# www.zameen.me — GoDaddy DNS

The hostname is attached to the existing ZAMEEN hosting project. It is pending DNS and certificate validation. The GoDaddy DNS page requires sign-in.

In the `zameen.me` DNS zone, configure these exact records. GoDaddy's Name field normally takes the relative name below, not the full hostname.

| Type | Name | Value |
|---|---|---|
| CNAME | `www` | `custom-domains.chatgpt.site` |
| TXT | `_openai-site-verification.www` | `openai-site-verification=4oSX1b4DlEbqeoB_Lra5UpaM69R-v0ydBDXZ9LS-a7c` |
| TXT | `_cf-custom-hostname.www` | `9a3d164e-8485-4a52-9515-76a34d7e3af2` |

Preserve unrelated MX, TXT and other records. If `www` already has a CNAME or A record, replace only the conflicting `www` record after reviewing its current destination. Do not change nameservers or buy/transfer the domain.

After DNS propagates, refresh custom-domain verification and check that both routing and HTTPS are active. Apex `zameen.me` is not attached; this setup covers the requested `www.zameen.me` hostname only.

The storefront is public. Hosting publication succeeded on 11 October 2026. The domain remains pending until these DNS records are configured and verification completes.
