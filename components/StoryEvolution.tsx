'use client';
import {useState} from 'react';
import type {Product} from '@/lib/products';
import {EditorialPlaceholder} from './EditorialPlaceholder';
import {ProductPhoto} from './ProductPhoto';
export function StoryEvolution({product}:{product:Product}){const [stage,setStage]=useState(2);return <div className="evolution"><div className={`evolution-art ${product.chapter}`}>{stage<2?<EditorialPlaceholder chapter={product.chapter} className={stage===1?'evolution-sketch':''} label/>:<ProductPhoto product={product}/>}<span className="evolution-caption">{['SOURCE / ABSTRACT REFERENCE STUDY','ADAPTATION / COMPOSITION STUDY','GARMENT / SUPPLIED DESIGN REFERENCE'][stage]}</span></div><div className="evolution-controls" role="group" aria-label="Sketch-to-jacket evolution">{['REFERENCE','DESIGN STUDY','THE JACKET'].map((s,i)=><button key={s} aria-pressed={stage===i} onClick={()=>setStage(i)}><span>0{i+1}</span>{s}</button>)}</div></div>;}
