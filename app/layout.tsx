import type {Metadata} from 'next';
import '@fontsource/space-grotesk/latin-400.css';
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/fraunces/latin-400.css';
import '@fontsource/fraunces/latin-400-italic.css';
import '@fontsource/archivo-black/latin-400.css';
import './globals.css';
import {CartProvider} from '@/lib/cart-context';
import {Navbar} from '@/components/Navbar';
import {Footer} from '@/components/Footer';
import {CartDrawer} from '@/components/CartDrawer';
export const metadata:Metadata={title:{default:'ZAMEEN — Two cultures. Many stories. One canvas.',template:'%s — ZAMEEN'},description:'A two-chapter outerwear collection exploring Lucknow zardozi goldwork and Rio de Janeiro Art Deco. Inspired by culture. Created with respect.',icons:{icon:'/icon.svg'},openGraph:{title:'ZAMEEN — Two cultures. Many stories. One canvas.',description:'Wear the story. Know the source.',type:'website'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><CartProvider><a className="skip-link" href="#main">SKIP TO CONTENT</a><Navbar/><main id="main">{children}</main><Footer/><CartDrawer/></CartProvider></body></html>;}
