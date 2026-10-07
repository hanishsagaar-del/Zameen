import type {CreditType} from '@/lib/products';
export function CreditBadge({type}:{type:CreditType}){return <span className={`credit-badge ${type}`}>{type==='interpretation'?'DESIGN INTERPRETATION':type==='inspired-by'?'INSPIRED BY PLACE':'ARTIST COLLABORATION'}</span>;}
