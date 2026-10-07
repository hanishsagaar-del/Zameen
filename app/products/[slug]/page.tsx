import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getProduct,products} from '@/lib/products';
import {ProductExperience} from '@/components/ProductExperience';
import {SourceCreditPanel} from '@/components/SourceCreditPanel';
import {WhyThisDesign} from '@/components/WhyThisDesign';
import {ProductPhoto} from '@/components/ProductPhoto';
import {EditorialPlaceholder} from '@/components/EditorialPlaceholder';
import {Reveal} from '@/components/Reveal';
export function generateStaticParams(){return products.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const p=getProduct((await params).slug);return {title:p?.name||'Piece not found',description:p?.subtitle};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const p=getProduct((await params).slug);if(!p)notFound();return <><div className="product-page"><ProductExperience product={p}/><section className="cultural-section"><Reveal><WhyThisDesign product={p}/></Reveal><Reveal><SourceCreditPanel product={p}/></Reveal></section><section className="detail-section"><div className="section-heading"><div><p className="eyebrow">A CLOSER LOOK</p><h2>EVERY LINE<br/>HAS A REASON.</h2></div><p className="small-note">Embroidery and artwork design references.<br/>Construction photography to accompany production.</p></div><div className="detail-grid"><figure className={p.chapter}><ProductPhoto product={p} view="detail"/><figcaption>01 / EMBROIDERY REFERENCE</figcaption></figure><figure className={p.chapter}><ProductPhoto product={p} view="architecture"/><figcaption>02 / ARCHITECTURAL LINE-WORK</figcaption></figure><figure className="construction-study"><EditorialPlaceholder chapter={p.chapter} label/><figcaption>03 / PATTERN STUDY · CONSTRUCTION PHOTOGRAPHY FORTHCOMING</figcaption></figure></div></section><Link href={`/stories/${p.slug}`} className="product-story-banner"><p className="eyebrow">THE GARMENT IS ONLY THE BEGINNING.</p><span className="serif">Know the place.<br/>Meet the story.</span><span className="text-link">READ THE FULL STORY ↗</span></Link></div></>;}
