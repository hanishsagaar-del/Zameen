# ZAMEEN

A complete two-chapter fashion website built directly in Next.js 16 App Router, TypeScript, Tailwind CSS and Framer Motion.

## Run or build

Requires Node.js 20.9 or newer.

```
npm ci
npm run dev
```

Open http://localhost:3000. To create the production website:

```
npm run build
```

The `out/` folder is a complete static export and can be served by Vercel, Cloudflare Pages, Netlify, or any static web host. No database, Replit subscription, or backend is required.

## Included

- Home with mask-based cinematic hero, chapters, philosophy, interactive process, and story links.
- `/collections/india/`, `/collections/brazil/`.
- `/products/golden-procession/`, `/products/rio-art-deco/`.
- `/stories/golden-procession/`, `/stories/rio-art-deco/`.
- Galleries that prioritize back artwork, size selection, cultural source panels, and design credit badges.
- Size-specific cart with quantity controls, removal, localStorage validation/persistence, accessible native modal, and demo checkout.
- Responsive layouts, keyboard navigation, reduced-motion support, page metadata, 404/error states, locally hosted fonts.

## Content and assets

Edit `lib/products.ts` to update indicative prices, sizes, product names, and cultural stories. The supplied jacket reference images live in `public/images/products/`. The Rio jacket uses crest-free back/detail viewport crops; its football crest is not shown in the interface. All imagery is presented as design references. Abstract SVG studies are intentionally labeled and contain replacement comments for future editorial photography.

The historical zardozi technique is a source reference, not a verified manufacturing specification. The Rio reference has light thread, while tonal matte-on-black is described as an intended adaptation. Research/consultation/collaboration/attribution steps are principles, not claims of actual partnerships.

## Demo limits

Indicative prices: Golden Procession ₹18,900 and Rio Art Deco ₹17,900. Size options are for the preview. No payment is taken, no real order is placed, and no personal/payment information is collected. Final materials, fit measurements, availability and shipping policy must be confirmed before selling.

## Licensing

User-provided brand and garment references remain with their respective owners. Space Grotesk, Fraunces, and Archivo Black are bundled through Fontsource; their licenses are retained in the dependency packages. No fabricated customer quotes, artisan partnerships or endorsements are included.
