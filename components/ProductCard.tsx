import Link from 'next/link';
import type {Product} from '@/lib/products';
import {money} from '@/lib/products';
import {ProductPhoto} from './ProductPhoto';
import {CreditBadge} from './CreditBadge';
import {EditorialPlaceholder} from './EditorialPlaceholder';
export function ProductCard({product}:{product:Product}){return <Link className={`product-card ${product.chapter}`} href={`/products/${product.slug}`}><div className="card-art"><div className="card-finished"><ProductPhoto product={product}/></div><div className="card-reference"><EditorialPlaceholder chapter={product.chapter} label/><span>01 / SOURCE STUDY</span></div><div className="card-sketch"><EditorialPlaceholder chapter={product.chapter}/><span>02 / DESIGN STUDY</span></div><span className="card-corner">VIEW THE PIECE ↗</span></div><div className="card-details"><div><p className="eyebrow">{product.culturalStory.location}</p><h3>{product.name}</h3></div><span>{money(product.price)}</span></div><CreditBadge type={product.creditType}/></Link>;}
