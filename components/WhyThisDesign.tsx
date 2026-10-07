import Link from 'next/link';
import type {Product} from '@/lib/products';
export function WhyThisDesign({product}:{product:Product}){return <div className="why-design"><p className="eyebrow">WHY THIS DESIGN?</p><h2>From a place.<br/>Into a new form.</h2><p className="serif">{product.culturalStory.translation}</p><Link href={`/stories/${product.slug}`} className="text-link">MEET THE STORY <span aria-hidden="true">↗</span></Link></div>;}
