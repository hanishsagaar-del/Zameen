# ZAMEEN

Contemporary statement-jacket storefront with two chapters: Lucknow goldwork and Rio de Janeiro architectural line-work.

## Develop and build

```sh
npm ci
npm run dev
npm run build:site
npm run test:payments
```

Next.js 16 App Router, TypeScript, Tailwind CSS, Framer Motion and local fonts. The Next export is the storefront; the server Worker adds real Razorpay Orders/verification/webhook endpoints and D1 order persistence. `npm run build` and `npm run build:site` build the storefront and bundle the payment backend. Sites deployment packages `dist/` with the existing project identity.

Golden Procession Jacket and One Culture Jacket each cost ₹3,500. `lib/products.ts` is the typed catalog used by both the storefront and server. Eight supplied front/back/side images are integrated; web-optimized WebP copies retain detail and full-size original PNGs are preserved. Gallery transitions, staggered text/masked scroll reveals and abstract thread drafting graphics respect reduced motion.

Cart quantities and selected sizes persist in localStorage. Checkout collects an India delivery address, uses Razorpay Standard Checkout, confirms captured payments server-side, and records the order. Secrets stay on the server. The checkout cannot take payments until the merchant's keys and enable setting are configured.

See `RAZORPAY-SETUP.md` for secure activation, current limitations and test/live steps. See `DOMAIN-SETUP.md` for exact GoDaddy DNS records. Hosting publication succeeded with public access on 11 October 2026 at https://zameen.hanishsagarm.chatgpt.site. The custom domain is attached but pending verification.

Cultural attribution distinguishes a source tradition from this house's contemporary interpretation. The supplied Rio garment includes mixed architectural references; it is not presented as a literal Rio skyline. Source traditions remain credited to their communities and creators. No artisan partnership or verified construction specification is asserted.
