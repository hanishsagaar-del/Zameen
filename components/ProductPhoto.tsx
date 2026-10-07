import Image from 'next/image';
import type {Product} from '@/lib/products';
type View='front'|'back'|'detail'|'architecture';
const crops={india:{front:[0,0,710,728],back:[712,0,710,728],detail:[7,224,236,320],architecture:[816,211,477,310]},brazil:{front:[22,264,154,161],back:[167,263,148,162],detail:[162,429,68,73],architecture:[236,431,77,76]}};
export function ProductPhoto({product,view='back',priority=false,className=''}:{product:Product;view?:View;priority?:boolean;className?:string}){
 // Only crest-free back and detail crops are displayed for the Rio design reference.
 const safeView=product.chapter==='brazil'&&view==='front'?'back':view;
 const [x,y,w,h]=crops[product.chapter][safeView];const [sourceW,sourceH]=product.chapter==='india'?[2048,728]:[336,742];
 return <div className={`product-photo ${className}`}><div className="photo-window" style={{aspectRatio:`${w}/${h}`}}><Image src={product.images[0]} width={sourceW} height={sourceH} sizes="(max-width: 700px) 90vw, 55vw" placeholder="blur" blurDataURL="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27%3E%3Crect width=%2716%27 height=%2716%27 fill=%27%2323322d%27/%3E%3C/svg%3E" priority={priority} alt={`${product.name}, ${safeView==='back'?'back artwork':safeView==='front'?'Z monogram front':'embroidery detail'}; ${product.chapter==='india'?'goldwork reference informed by Lucknow zardozi':'Rio de Janeiro architectural line-work design reference'}`} style={{width:`${sourceW/w*100}%`,maxWidth:'none',height:'auto',left:`${-x/w*100}%`,top:`${-y/h*100}%`}}/></div></div>;
}
