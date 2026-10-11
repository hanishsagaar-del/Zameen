# ZAMEEN payment activation

The storefront and server integration are implemented. Real payments are **not enabled**: the connected Razorpay app is read-only and cannot issue API keys or create payment orders for the deployed site. No live or Razorpay test transaction has been performed.

## Secure server configuration

Generate a Test Key ID and Key Secret in the merchant Razorpay Dashboard. Configure these on the website server as secrets/environment values, never in chat, source control, public JavaScript, or `NEXT_PUBLIC_*` variables:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET` (secret)
- `RAZORPAY_WEBHOOK_SECRET` (secret)
- `CHECKOUT_ENABLED=true` only when ready for test checkout.

Create a Razorpay webhook targeting `https://www.zameen.me/api/razorpay/webhook` once DNS/HTTPS and public access are active. Subscribe to `payment.captured` and `order.paid`. The webhook secret must exactly match the server setting. Configure automatic payment capture in Razorpay. A private storefront will prevent Razorpay from reaching this endpoint.

Test success, failure, cancellation, duplicate submission, delayed payment verification and tab reload. Verify the recorded order, address, size, quantity and payment in the merchant dashboard. Switch to the corresponding Live Key ID and Secret only after a successful test, merchant activation and final fulfilment policies. Redeploy after server settings change.

Both jackets are ₹3,500. Orders are calculated server-side in paise, independent of browser prices. The current checkout total adds no separate shipping charge. Confirm that this fits your shipping and tax policy before enabling sales. Sizes, production availability, final garment materials and measurement chart need merchant confirmation. No email receipt or dispatch workflow is configured; the confirmation page supplies an order/payment reference.

## Implementation

The Next.js App Router storefront is exported to static HTML. A Cloudflare-compatible Worker serves the payment endpoints alongside those assets. D1 stores authoritative order records and delivery information. The browser cart remains device-local. The secret session token is generated in the browser and only its SHA-256 hash is stored with the order.

Endpoints:
- `GET /api/checkout/config`: public availability and test/live mode.
- `POST /api/checkout/orders`: validates catalog items/sizes/quantities/address and creates the Razorpay order server-side.
- `POST /api/checkout/verify`: checks HMAC signature, then fetches and matches the captured payment.
- `POST /api/checkout/status`: private-token recovery/reconciliation.
- `POST /api/razorpay/webhook`: validates raw-body HMAC and records captured payments idempotently.

The frontend clears only purchased quantities after verified capture; pending/cancelled/failed payments preserve the bag. Card/bank credentials are entered in Razorpay's checkout. Checkout configuration is deliberately unavailable until valid keys and the enable setting are present.

Run `npm run build:site` then `npm run test:payments` for build/type checks and provider-mocked payment security tests. These do not replace a merchant-account test payment.
