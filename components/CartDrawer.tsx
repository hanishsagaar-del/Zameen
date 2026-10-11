'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {flushSync} from 'react-dom';
import {X,Minus,Plus,Check,LockKeyhole} from 'lucide-react';
import {useCart,type CartItem} from '@/lib/cart-context';
import {products,money} from '@/lib/products';
import {checkoutRequest,loadRazorpay,type PaymentResponse} from '@/lib/razorpay';
import {Modal} from './Modal';
import {ProductPhoto} from './ProductPhoto';
type Pending={token:string;orderId:string;reference:string;items:CartItem[]};
type Receipt={reference:string;paymentId:string;amount:number};
const pendingKey='zameen-checkout-v1';
const initialCustomer={name:'',email:'',phone:'',address:'',city:'',state:'',pincode:''};
export function CartDrawer(){
 const cart=useCart();const [step,setStep]=useState<'bag'|'address'|'complete'>('bag');
 const [busy,setBusy]=useState('');const [overlay,setOverlay]=useState(false);const [message,setMessage]=useState('');
 const [availability,setAvailability]=useState<{available:boolean;mode:string}|null>(null);
 const [customer,setCustomer]=useState(initialCustomer);const [pending,setPending]=useState<Pending|null>(null);const [receipt,setReceipt]=useState<Receipt|null>(null);
 const draft=useRef<{fingerprint:string;token:string}|null>(null);
 const total=cart.items.reduce((n,i)=>n+products.find(p=>p.id===i.id)!.price*i.quantity,0);
 useEffect(()=>{try{const p=JSON.parse(sessionStorage.getItem(pendingKey)||'null');if(p&&typeof p.orderId==='string'&&typeof p.token==='string'&&Array.isArray(p.items))setPending(p);}catch{/* This tab has no recoverable checkout. */}},[]);
 useEffect(()=>{if(!cart.open){setStep('bag');return;}let active=true;fetch('/api/checkout/config',{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(active)setAvailability(data);}).catch(()=>{if(active)setAvailability({available:false,mode:'unavailable'});});return()=>{active=false;};},[cart.open]);
 useEffect(()=>{if(cart.open&&step!=='bag')document.getElementById('cart-heading')?.focus();},[step,cart.open]);
 function savePending(value:Pending){setPending(value);try{sessionStorage.setItem(pendingKey,JSON.stringify(value));}catch{/* Server order remains durable. */}}
 function finish(result:Receipt,current:Pending){cart.consume(current.items);setReceipt(result);setPending(null);draft.current=null;setCustomer(initialCustomer);setStep('complete');setMessage('');try{sessionStorage.removeItem(pendingKey);}catch{}}
 async function checkPending(current=pending){if(!current)return;setBusy('Checking payment…');setMessage('');try{const result=await checkoutRequest('status',current);if(result.status==='paid'){finish(result,current);return true;}setMessage(result.status==='refunded'?'This payment was refunded. Your bag is unchanged.':'Payment is not confirmed yet. If your account was debited, check again before making another payment.');return false;}catch(error){setMessage(error instanceof Error?error.message:'Payment could not be checked. Please try again.');return false;}finally{setBusy('');}}
 async function pay(event:FormEvent){event.preventDefault();if(busy||!availability?.available)return;setMessage('');setBusy('Preparing secure checkout…');
 try{
  await loadRazorpay();
  const fingerprint=JSON.stringify({items:cart.items,customer});
  if(!draft.current||draft.current.fingerprint!==fingerprint)draft.current={fingerprint,token:Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')};
  if(pending){const recovery=await checkoutRequest('status',pending);if(recovery.status==='paid'){finish(recovery,pending);setBusy('');return;}if(recovery.status==='pending'&&!recovery.canRetry)throw new Error('Your earlier payment is still being processed. Check its status before starting another payment.');}
  const token=draft.current.token;
  // Reuse the same Razorpay order for repeated clicks with unchanged details.
  const order=await checkoutRequest('orders',{items:cart.items,customer,token});
  const current={token,orderId:order.orderId,reference:order.reference,items:cart.items.map(i=>({...i}))};savePending(current);
  const previous=await checkoutRequest('status',current);if(previous.status==='paid'){finish(previous,current);setBusy('');return;}
  let responseReceived=false;
  const instance=new window.Razorpay!({key:order.keyId,amount:order.amount,currency:order.currency,name:'ZAMEEN',description:'Two chapters. One canvas.',order_id:order.orderId,prefill:{name:customer.name,email:customer.email,contact:customer.phone},theme:{color:'#22332b'},retry:{enabled:true},
   handler:async(payment:PaymentResponse)=>{responseReceived=true;setOverlay(false);setBusy('Verifying your payment…');try{const result=await checkoutRequest('verify',{token,orderId:order.orderId,paymentId:payment.razorpay_payment_id,signature:payment.razorpay_signature});if(result.status==='paid')finish(result,current);else setMessage('Payment received but confirmation is pending. Please check payment status before paying again.');}catch(error){setMessage(error instanceof Error?error.message:'Payment verification is pending. Please check the payment status.');}finally{setBusy('');}},
   modal:{ondismiss:()=>{setOverlay(false);if(!responseReceived){setBusy('');setMessage('Checkout closed. Your bag is saved. If you completed a payment, check its status below.');}}}
  });
  instance.on('payment.failed',()=>setMessage('The payment was unsuccessful. You can retry in Razorpay or return to your bag.'));
  // Close the native dialog before the provider iframe opens; a top-layer dialog would cover it.
  flushSync(()=>setOverlay(true));setBusy('Payment open in Razorpay…');instance.open();
 }catch(error){setOverlay(false);setBusy('');setMessage(error instanceof Error?error.message:'Checkout could not start. Please try again.');}}
 const close=()=>{if(!busy)cart.setOpen(false);};
 return <Modal open={cart.open&&!overlay} onClose={close} labelledBy="cart-heading" className="cart-dialog"><div className="cart-content">
  <div className="dialog-heading"><h2 id="cart-heading" tabIndex={-1}>{step==='complete'?'PAYMENT CONFIRMED':step==='address'?'SECURE CHECKOUT':`YOUR BAG (${cart.count})`}</h2><button className="icon-button" disabled={!!busy} aria-label="Close bag" onClick={close}><X size={24}/></button></div>
  {step==='complete'&&receipt?<div className="cart-empty"><Check size={32}/><h3>The next chapter is yours.</h3><p>Your payment is confirmed and your order has been recorded. Keep these details for your records.</p>{availability?.mode==='test'&&<p className="checkout-message">TEST PAYMENT — no real money was charged.</p>}<div className="checkout-receipt"><div><span>Total paid</span><strong>{money(receipt.amount/100)}</strong></div><p className="payment-reference">Order: {receipt.reference}</p><p className="payment-reference">Payment: {receipt.paymentId}</p></div><button className="button dark" onClick={close}>CONTINUE EXPLORING</button></div>:<>
  {pending&&<div className="checkout-message"><p>A checkout is saved in this tab.</p><p className="payment-reference">{pending.reference}</p><button className="text-link" disabled={!!busy} onClick={()=>checkPending()}>CHECK PAYMENT STATUS</button></div>}
  {message&&<p className="checkout-message" role="alert">{message}</p>}{busy&&<p className="checkout-message" role="status">{busy}</p>}
  {!cart.ready?<p role="status">Opening your bag…</p>:cart.items.length===0?<div className="cart-empty"><span className="serif">A story waiting to be worn.</span><p>Your bag is empty. Discover the collection.</p><Link href="/#chapters" className="button dark" onClick={close}>EXPLORE THE CHAPTERS</Link></div>:<>
  {step==='bag'?<div className="cart-items">{cart.items.map(item=>{const p=products.find(p=>p.id===item.id)!;return <article className="cart-item" key={`${item.id}-${item.size}`}><Link href={`/products/${p.slug}`} onClick={close} className="cart-photo"><ProductPhoto product={p} view="front"/></Link><div className="cart-item-info"><Link href={`/products/${p.slug}`} onClick={close} className="cart-product-name">{p.name}</Link><p className="small-note">SIZE {item.size} / {p.chapter==='india'?'LUCKNOW':'RIO DE JANEIRO'}</p><p>{money(p.price)}</p><div className="cart-item-bottom"><div className="quantity"><button aria-label={`Decrease ${p.name} size ${item.size} quantity`} disabled={!!busy||item.quantity<=1} onClick={()=>cart.change(item.id,item.size,item.quantity-1)}><Minus size={14}/></button><span aria-label="Quantity">{item.quantity}</span><button aria-label={`Increase ${p.name} size ${item.size} quantity`} disabled={!!busy||item.quantity>=10} onClick={()=>cart.change(item.id,item.size,item.quantity+1)}><Plus size={14}/></button></div><button className="remove-link" disabled={!!busy} aria-label={`Remove ${p.name} size ${item.size}`} onClick={()=>cart.remove(item.id,item.size)}>REMOVE</button></div></div></article>;})}</div>:<form className="checkout-form" onSubmit={pay} id="checkout-form"><fieldset disabled={!!busy}><legend>CONTACT & DELIVERY · INDIA</legend>{(['name','email','phone','address','city','state','pincode'] as const).map(field=><label key={field} htmlFor={`checkout-${field}`}>{({name:'Full name',email:'Email',phone:'Mobile number',address:'Street address, building & apartment',city:'City',state:'State / union territory',pincode:'PIN code'})[field]}<input id={`checkout-${field}`} name={field} type={field==='email'?'email':field==='phone'?'tel':'text'} autoComplete={({name:'name',email:'email',phone:'tel',address:'street-address',city:'address-level2',state:'address-level1',pincode:'postal-code'})[field]} value={customer[field]} onChange={e=>setCustomer({...customer,[field]:e.target.value})} required maxLength={field==='address'?240:field==='pincode'?6:field==='phone'?14:150} pattern={field==='pincode'?'[1-9][0-9]{5}':undefined} inputMode={field==='pincode'?'numeric':undefined}/></label>)}</fieldset><p className="small-note">Your contact and address are saved with your order for delivery. Payment details are entered directly with Razorpay and are never stored by ZAMEEN.</p></form>}
  <div className="cart-summary"><div><span>TOTAL · {cart.count} {cart.count===1?'JACKET':'JACKETS'}</span><strong>{money(total)}</strong></div><p className="small-note">₹3,500 per jacket · INR</p>{step==='bag'?<button disabled={!!busy} className="button dark full" onClick={()=>{setStep('address');setMessage('');}}>CONTINUE TO CHECKOUT</button>:<>{!availability?<p className="checkout-message" role="status">Checking payment availability…</p>:!availability.available?<p className="checkout-message" role="status">Online payments are not available yet. Your bag is saved.</p>:availability.mode==='test'?<p className="checkout-message">Razorpay test mode. No real money will be charged.</p>:null}<button type="submit" form="checkout-form" disabled={!!busy||!availability?.available} className="button dark full"><LockKeyhole size={16}/>{busy?'PLEASE WAIT…':`PAY ${money(total)} WITH RAZORPAY`}</button><button className="text-link back-to-bag" disabled={!!busy} onClick={()=>setStep('bag')}>BACK TO BAG</button></>}</div>
  </>}
  </>}
 </div></Modal>;
}
