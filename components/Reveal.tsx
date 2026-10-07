'use client';
import {motion,useReducedMotion} from 'framer-motion';
import type {ReactNode} from 'react';
export function Reveal({children,className=''}:{children:ReactNode;className?:string}){const reduced=useReducedMotion();return <motion.div className={className} initial={reduced?false:{clipPath:'inset(8% 0 0 0)',opacity:0}} whileInView={{clipPath:'inset(0% 0 0 0)',opacity:1}} viewport={{once:true,amount:0.12}} transition={{duration:reduced?0:0.5,ease:'easeOut'}}>{children}</motion.div>;}
