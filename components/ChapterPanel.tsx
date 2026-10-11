import Link from 'next/link';
import {chapters,products,type Chapter} from '@/lib/products';
import {ProductPhoto} from './ProductPhoto';
import {ThreadGraphic} from './ThreadGraphic';
import {EditorialPlaceholder} from './EditorialPlaceholder';
export function ChapterPanel({chapter}:{chapter:Chapter}){const c=chapters[chapter];const p=products.find(p=>p.chapter===chapter)!;return <Link href={`/collections/${chapter}`} className={`chapter-panel ${chapter}`}><div className="chapter-image"><ProductPhoto product={p}/><ThreadGraphic className="chapter-thread"/><EditorialPlaceholder chapter={chapter} className="hover-pattern"/></div><div className="chapter-caption"><span className="eyebrow">CHAPTER {c.number} / {c.place}</span><h3>{c.name}</h3><p>{c.line}</p><span className="text-link">ENTER THE CHAPTER <span aria-hidden="true">↗</span></span></div></Link>;}
