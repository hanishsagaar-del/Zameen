'use client';
import {useEffect,useRef,type ReactNode} from 'react';
export function Modal({open,onClose,labelledBy,className='',children}:{open:boolean;onClose:()=>void;labelledBy:string;className?:string;children:ReactNode}){const ref=useRef<HTMLDialogElement>(null);const closeRef=useRef(onClose);closeRef.current=onClose;
 useEffect(()=>{const dialog=ref.current;if(!dialog)return;if(open){dialog.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=old;};}},[open]);
 return <dialog ref={ref} className={className} aria-labelledby={labelledBy} onCancel={e=>{e.preventDefault();closeRef.current();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeRef.current();}}}>{children}</dialog>;
}
