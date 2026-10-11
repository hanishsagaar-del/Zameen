'use client';
import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import {products} from './products';
export type CartItem={id:string;size:string;quantity:number};
type Cart={items:CartItem[];ready:boolean;open:boolean;setOpen:(open:boolean)=>void;add:(id:string,size:string)=>void;change:(id:string,size:string,quantity:number)=>void;remove:(id:string,size:string)=>void;clear:()=>void;consume:(purchased:CartItem[])=>void;count:number};
const Context=createContext<Cart|null>(null);
export function CartProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<CartItem[]>([]); const [ready,setReady]=useState(false);const [open,setOpen]=useState(false);
 useEffect(()=>{try{const data=JSON.parse(localStorage.getItem('zameen-cart-v1')||'[]');if(Array.isArray(data)){const valid:CartItem[]=[];for(const item of data){const p=products.find(p=>p.id===item?.id);if(p&&p.sizes.includes(item.size)&&Number.isInteger(item.quantity)&&item.quantity>0&&item.quantity<=10){const prior=valid.find(v=>v.id===item.id&&v.size===item.size);if(prior)prior.quantity=Math.min(10,prior.quantity+item.quantity);else valid.push({id:item.id,size:item.size,quantity:item.quantity});}}setItems(valid);}}catch{/* Storage unavailable or invalid; use a fresh bag. */}setReady(true);},[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('zameen-cart-v1',JSON.stringify(items));}catch{/* Bag remains usable for this visit. */}},[items,ready]);
 const add=useCallback((id:string,size:string)=>{const p=products.find(p=>p.id===id);if(!p||!p.sizes.includes(size))return;setItems(old=>{const existing=old.find(i=>i.id===id&&i.size===size);return existing?old.map(i=>i===existing?{...i,quantity:Math.min(10,i.quantity+1)}:i):[...old,{id,size,quantity:1}];});setOpen(true);},[]);
 const remove=useCallback((id:string,size:string)=>setItems(old=>old.filter(i=>!(i.id===id&&i.size===size))),[]);
 const change=useCallback((id:string,size:string,quantity:number)=>setItems(old=>old.map(i=>i.id===id&&i.size===size?{...i,quantity:Math.max(1,Math.min(10,Math.floor(quantity)))}:i)),[]);
 return <Context.Provider value={{items,ready,open,setOpen,add,change,remove,clear:()=>setItems([]),consume:(purchased)=>setItems(old=>old.map(i=>({...i,quantity:i.quantity-(purchased.find(p=>p.id===i.id&&p.size===i.size)?.quantity||0)})).filter(i=>i.quantity>0)),count:items.reduce((n,i)=>n+i.quantity,0)}}>{children}</Context.Provider>;
}
export function useCart(){const c=useContext(Context);if(!c)throw new Error('CartProvider is required');return c;}
