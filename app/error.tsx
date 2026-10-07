'use client';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <section className="not-found"><p className="eyebrow">A MOMENTARY INTERRUPTION</p><h1>Let’s try<br/>that again.</h1><button className="button dark" onClick={reset}>RELOAD THIS CHAPTER</button></section>;}
