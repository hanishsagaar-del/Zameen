import {products} from '../lib/products';
const encoder=new TextEncoder();
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
class CheckoutError extends Error {constructor(message,status=400){super(message);this.status=status;}}
const fail=(message,status=400)=>{throw new CheckoutError(message,status);};
const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
const digest=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
async function validSignature(secret,value,signature){
 if(typeof signature!=='string'||!/^[a-f0-9]{64}$/i.test(signature))return false;
 const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 return crypto.subtle.verify('HMAC',key,Uint8Array.from(signature.match(/../g),s=>parseInt(s,16)),encoder.encode(value));
}
function configured(env){return !!(env.DB&&/^rzp_(test|live)_\w+$/.test(env.RAZORPAY_KEY_ID||'')&&env.RAZORPAY_KEY_SECRET);}
function enabled(env){return configured(env)&&env.CHECKOUT_ENABLED==='true';}
function db(env){if(!env.DB)fail('Checkout is temporarily unavailable.',503);return env.DB;}
async function body(request,max=12000){
 if(!request.headers.get('content-type')?.includes('application/json'))fail('Expected JSON.',415);
 const reader=request.body?.getReader();if(!reader)fail('Missing request.');
 let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();fail('Request too large.',413);}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 const raw=new TextDecoder().decode(bytes);try{return {raw,data:JSON.parse(raw)};}catch{fail('Invalid JSON.');}
}
function checkoutInput(input){
 if(!input||!Array.isArray(input.items)||input.items.length<1||input.items.length>12)fail('Your bag is invalid.');
 const seen=new Set();let count=0;
 const items=input.items.map(item=>{
  const p=products.find(p=>p.id===item?.id);if(!p||!p.sizes.includes(item.size)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>10)fail('Please check the items and sizes in your bag.');
  const key=`${item.id}:${item.size}`;if(seen.has(key))fail('Duplicate bag item.');seen.add(key);count+=item.quantity;
  return {id:p.id,name:p.name,size:item.size,quantity:item.quantity,unitAmount:p.price*100};
 }).sort((a,b)=>(a.id+a.size).localeCompare(b.id+b.size));
 if(count>20)fail('Please order no more than 20 jackets at a time.');
 const customer={};for(const [field,min,max] of [['name',2,100],['email',3,150],['phone',10,14],['address',5,240],['city',2,80],['state',2,80],['pincode',6,6]]){
  const value=input.customer?.[field];if(typeof value!=='string'||value.trim().length<min||value.trim().length>max||/[\x00-\x1f]/.test(value))fail(`Please check your ${field}.`);customer[field]=value.trim();
 }
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))fail('Please enter a valid email.');
 customer.phone=customer.phone.replace(/[\s+-]/g,'');if(!/^(91)?[6-9]\d{9}$/.test(customer.phone))fail('Please enter an Indian mobile number.');
 if(!/^[1-9]\d{5}$/.test(customer.pincode))fail('Please enter a six-digit Indian PIN code.');
 customer.country='IN';
 return {items,customer,amount:items.reduce((n,i)=>n+i.unitAmount*i.quantity,0)};
}
function tokenOf(input){if(typeof input?.token!=='string'||!/^[a-f0-9]{64}$/.test(input.token))fail('Your checkout session has expired. Please reopen your bag.');return input.token;}
async function razorpay(env,path,options={}){
 if(!configured(env))fail('Payments are not yet available.',503);
 let response;try{response=await fetch(`https://api.razorpay.com/v1/${path}`,{...options,headers:{'Authorization':`Basic ${btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(15000)});}catch{fail('The payment service is taking longer than expected. Please check this order again before paying.',503);}
 if(!response.ok){console.error('Razorpay request failed',response.status,path.split('/')[0]);fail('The payment service could not complete this request. Please try again later.',502);}return response.json();
}
async function rateLimit(request,env,kind,maximum){
 const bucket=Math.floor(Date.now()/3600000);const ip=request.headers.get('cf-connecting-ip')||'local';
 const id=await digest(`${env.RAZORPAY_KEY_SECRET}:${ip}:${bucket}:${kind}`);
 const row=await db(env).prepare('INSERT INTO checkout_limits (id,count,expires_at) VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count').bind(id,(bucket+2)*3600000).first();
 if(row.count>maximum)fail('Too many checkout attempts. Please try again later.',429);
 await db(env).prepare('DELETE FROM checkout_limits WHERE expires_at < ?').bind(Date.now()).run();
}
async function ownedOrder(env,input){
 tokenOf(input);if(typeof input.orderId!=='string'||!/^order_[a-zA-Z0-9]+$/.test(input.orderId))fail('Invalid order.');
 const order=await db(env).prepare('SELECT * FROM orders WHERE razorpay_order_id = ? AND token_hash = ?').bind(input.orderId,await digest(input.token)).first();
 if(!order)fail('Order not found.',404);return order;
}
async function confirmPayment(env,order,payment){
 if(payment.order_id!==order.razorpay_order_id||payment.amount!==order.amount||payment.currency!=='INR')fail('Payment details did not match this order.',409);
 if(payment.status==='refunded'||payment.amount_refunded>0)return {status:'refunded',reference:order.id};
 if(payment.status!=='captured')return {status:'pending',reference:order.id};
 // Conditional, idempotent update: repeated callbacks/webhooks cannot create duplicate paid orders.
 await db(env).prepare("UPDATE orders SET status='paid',payment_id=?,paid_at=COALESCE(paid_at,?) WHERE id=? AND (payment_id IS NULL OR payment_id=?)").bind(payment.id,Date.now(),order.id,payment.id).run();
 return {status:'paid',reference:order.id,paymentId:payment.id,amount:order.amount,currency:'INR'};
}
async function createOrder(request,env,input){
 if(!enabled(env))fail('Online payments are not available yet. Your bag has been saved.',503);
 await rateLimit(request,env,'create',12);
 const token=tokenOf(input);const {items,customer,amount}=checkoutInput(input);
 const tokenHash=await digest(token);const requestHash=await digest(JSON.stringify({items,customer}));
 const id=`Z${crypto.randomUUID().replaceAll('-','')}`;
 const insert=await db(env).prepare("INSERT OR IGNORE INTO orders (id,token_hash,request_hash,amount,currency,items,customer,status,created_at) VALUES (?,?,?,?,'INR',?,?,'creating',?)").bind(id,tokenHash,requestHash,amount,JSON.stringify(items),JSON.stringify(customer),Date.now()).run();
 // token_hash is unique. The winner alone contacts Razorpay.
 const saved=await db(env).prepare('SELECT * FROM orders WHERE token_hash=?').bind(tokenHash).first();
 if(saved.request_hash!==requestHash)fail('Your bag or address changed. Start a new checkout.',409);
 if(insert.meta.changes===0){
  if(saved.razorpay_order_id)return {orderId:saved.razorpay_order_id,keyId:env.RAZORPAY_KEY_ID,amount:saved.amount,currency:'INR',reference:saved.id,mode:env.RAZORPAY_KEY_ID.startsWith('rzp_live_')?'live':'test'};
  fail('Your order is still being checked. Please wait before retrying.',409);
 }
 const rp=await razorpay(env,'orders',{method:'POST',body:JSON.stringify({amount,currency:'INR',receipt:id,partial_payment:false,notes:{store:'ZAMEEN',reference:id,items:items.map(i=>`${i.id}/${i.size} x${i.quantity}`).join('; ').slice(0,256)}})});
 if(!/^order_[a-zA-Z0-9]+$/.test(rp.id)||rp.amount!==amount||rp.currency!=='INR')fail('The payment service returned an invalid order.',502);
 await db(env).prepare('UPDATE orders SET razorpay_order_id=?,status=? WHERE id=?').bind(rp.id,'created',id).run();
 return {orderId:rp.id,keyId:env.RAZORPAY_KEY_ID,amount,currency:'INR',reference:id,mode:env.RAZORPAY_KEY_ID.startsWith('rzp_live_')?'live':'test'};
}
async function webhook(request,env){
 if(!env.RAZORPAY_WEBHOOK_SECRET)fail('Webhook not configured.',503);
 const {raw,data}=await body(request,128000);
 if(!await validSignature(env.RAZORPAY_WEBHOOK_SECRET,raw,request.headers.get('x-razorpay-signature')))fail('Invalid webhook signature.',401);
 if(data.event!=='payment.captured'&&data.event!=='order.paid')return json({received:true});
 const payment=data.payload?.payment?.entity;if(!payment?.order_id)return json({received:true});
 const order=await db(env).prepare('SELECT * FROM orders WHERE razorpay_order_id=?').bind(payment.order_id).first();
 if(!order)return json({received:true});
 await confirmPayment(env,order,payment);return json({received:true});
}
export default {async fetch(request,env){
 const url=new URL(request.url);const path=url.pathname.replace(/\/$/,'');
 if(!path.startsWith('/api/'))return env.ASSETS?env.ASSETS.fetch(request):new Response('Not found',{status:404});
 try{
  if(path==='/api/checkout/config'&&request.method==='GET')return json({available:enabled(env),mode:configured(env)?(env.RAZORPAY_KEY_ID.startsWith('rzp_live_')?'live':'test'):'unconfigured'});
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  if(path==='/api/razorpay/webhook')return await webhook(request,env);
  if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')fail('Please use checkout on this website.',403);
  const {data}=await body(request);
  if(path==='/api/checkout/orders')return json(await createOrder(request,env,data));
  if(path==='/api/checkout/verify'||path==='/api/checkout/status'){
   await rateLimit(request,env,'verify',120);const order=await ownedOrder(env,data);
   if(path.endsWith('/verify')){
    if(typeof data.paymentId!=='string'||!/^pay_[a-zA-Z0-9]+$/.test(data.paymentId))fail('Invalid payment.');
    if(!await validSignature(env.RAZORPAY_KEY_SECRET,`${order.razorpay_order_id}|${data.paymentId}`,data.signature))fail('Payment signature could not be verified.',401);
    return json(await confirmPayment(env,order,await razorpay(env,`payments/${data.paymentId}`)));
   }
   // Recovery after a closed tab or delayed callback. The private session token is required.
   const payments=await razorpay(env,`orders/${order.razorpay_order_id}/payments`);
   const paid=payments.items?.find(p=>p.status==='captured'||p.status==='refunded');
   const unsettled=payments.items?.some(p=>p.status==='authorized'||p.status==='created');
   return json(paid?await confirmPayment(env,order,paid):{status:'pending',reference:order.id,canRetry:!unsettled});
  }
  return json({error:'Not found.'},404);
 }catch(error){
  if(error instanceof CheckoutError)return json({error:error.message},error.status);
  console.error('Checkout failed',error?.name||'Error');return json({error:'Checkout is temporarily unavailable. Your bag has been kept. Please try again.'},503);
 }
}};
