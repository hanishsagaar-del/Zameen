'use client';
import {motion,useReducedMotion} from 'framer-motion';
/** Abstract drafting geometry: a contemporary house graphic, not a traditional motif. */
export function ThreadGraphic({className=''}:{className?:string}){
 const reduced=useReducedMotion();return <div className={`thread-graphic ${className}`} aria-hidden="true"><motion.svg viewBox="0 0 600 600" fill="none" initial={reduced?false:{clipPath:'inset(0 100% 0 0)'}} whileInView={{clipPath:'inset(0 0% 0 0)'}} viewport={{once:true}} transition={{duration:reduced?0:1.5,ease:[.22,1,.36,1]}}><circle cx="300" cy="300" r="238"/><circle cx="300" cy="300" r="190" strokeDasharray="2 10"/><ellipse cx="300" cy="300" rx="100" ry="238"/><ellipse cx="300" cy="300" rx="190" ry="238"/><path d="M30 300H570M300 30V570M132 132L468 468M132 468L468 132" strokeOpacity=".3"/><path d="M40 200H560M40 400H560" strokeDasharray="1 7"/><circle cx="300" cy="62" r="4"/><circle cx="538" cy="300" r="4"/><circle cx="300" cy="538" r="4"/><circle cx="62" cy="300" r="4"/></motion.svg></div>;
}
