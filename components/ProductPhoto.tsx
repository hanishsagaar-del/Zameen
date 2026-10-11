import Image from 'next/image';
import type {Product} from '@/lib/products';
export type ProductView='front'|'back'|'left'|'right'|'detail'|'architecture';
export function ProductPhoto({product,view='back',priority=false,className=''}:{product:Product;view?:ProductView;priority?:boolean;className?:string}){
 const index={front:0,back:1,left:2,right:3,detail:2,architecture:1}[view];
 const closeup=view==='detail'||view==='architecture';
 return <div className={`product-photo ${className}`}><div className={`photo-window supplied-photo ${closeup?'photo-closeup':''}`} style={{aspectRatio:'1/1'}}><Image src={product.images[index]} width={1254} height={1254} sizes="(max-width: 700px) 90vw, 55vw" placeholder="blur" blurDataURL="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27%3E%3Crect width=%2716%27 height=%2716%27 fill=%27%23e9e9e9%27/%3E%3C/svg%3E" priority={priority} alt={`${product.name}, ${view} view; ${product.chapter==='india'?'indigo and ink-green jacket with gold embroidery inspired by Lucknow zardozi':'black jacket with gold architectural line-work and Z monogram'}`}/></div></div>;
}
