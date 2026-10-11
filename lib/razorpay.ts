export type PaymentResponse={razorpay_order_id:string;razorpay_payment_id:string;razorpay_signature:string};
type Options={key:string;amount:number;currency:string;name:string;description:string;order_id:string;prefill:{name:string;email:string;contact:string};theme:{color:string};handler:(payment:PaymentResponse)=>void;modal:{ondismiss:()=>void};retry:{enabled:boolean}};
type Instance={open:()=>void;on:(event:string,callback:()=>void)=>void};
declare global{interface Window{Razorpay?:new(options:Options)=>Instance}}
let loading:Promise<void>|undefined;
export function loadRazorpay(){
 if(window.Razorpay)return Promise.resolve();if(loading)return loading;
 loading=new Promise<void>((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://checkout.razorpay.com/v1/checkout.js';script.async=true;
  const timer=setTimeout(()=>{script.remove();loading=undefined;reject(new Error('Razorpay did not load. Please check your connection and try again.'));},20000);
  script.onload=()=>{clearTimeout(timer);if(window.Razorpay)resolve();else{loading=undefined;reject(new Error('Razorpay could not start.'));}};
  script.onerror=()=>{clearTimeout(timer);script.remove();loading=undefined;reject(new Error('Razorpay could not load. Please try again.'));};
  document.body.append(script);
 });return loading;
}
export async function checkoutRequest(path:string,data:unknown){
 const response=await fetch(`/api/checkout/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(25000)});
 const result=await response.json();if(!response.ok)throw new Error(result.error||'Checkout could not continue. Please try again.');return result;
}
