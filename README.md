# Kilimani Vapes Shop

The existing static storefront, with an optional persistent Node server and a responsive store administration dashboard. No dependency installation or build is required for the application. No new repository or hosting project is needed.

## Run locally

```sh
cd /workspace/Kilimani-Vapes-Shop
node server.js
```

Requires Node.js 22+. Default port: 3001; `PORT` overrides it. Use the existing checkout; do not create a worktree unless explicitly requested.

For static-only preview:

```sh
python3 -m http.server 3000 --bind 0.0.0.0 --directory /workspace/Kilimani-Vapes-Shop
```

## Administration

Open `/admin.html`. The navy sidebar, overview cards, peach forms and orange actions follow the supplied admin references. Counts reflect actual configuration, not example screenshot numbers.

- **Products:** create, edit, delete, price, size, stock, description, image, visibility and illustration colour. Blank stock means unverified. Deleting a product removes its row and discount references.
- **Categories:** name, original image, visibility, delete and ordering. Renaming updates product and row references. Categories containing products must be emptied before deletion.
- **Discounts:** percentage or fixed reductions for selected products. The best applicable price wins; discounts do not stack. Prices agree across cards, details, bag and checkout preview.
- **Homepage rows:** category-based or manually selected product shelves, title, supporting text, count, order and publication. Party collections are shelves, not a single-priced bundled product.
- **Website content:** branding and contact information, colours, section visibility, partnership copy, footer, policies, article, FAQs and storefront labels. Banners have original images, text, destination, button, order and publication. Use the jump links to reach Popup and Banners.
- **Popup:** heading, description, acknowledgement/leave button text, notice, optional image, panel/text/button colours. Age acknowledgement remains a browser session check, not legal identity verification.
- **Delivery & payments:** checkout copy, optional dispatch coordinates, planned payment choices, optional gift notes and non-overlapping distance/fee bands. These settings do not connect a payment provider or enable real orders/GPS calculations.
- **Orders / Dispatch:** private server order lists and fulfilment-status changes. They stay empty until a separate order intake is connected. No fake orders or counts are seeded.
- **Backup & export:** configuration JavaScript/JSON exports, import, advanced JSON editing and repository-default restoration.

The homepage has a larger banner and a vertically scrollable list of circular categories beside the banner on desktop and below it on smaller screens. Two or three category circles can be shown at once, selected in Website content → Category scrolling. Autoplay and its interval are editable there too. By default three circles are visible. The list advances every three seconds, pauses on hover/focus/touch, provides a pause/play control, and respects reduced-motion preferences. Original uploaded images use `object-fit: contain` and retain their aspect ratio, colours and bytes. No image is cropped or redrawn.

### Original logo

The supplied logo is visible in chat, but no original attachment file was available in the checkout. A clearly marked placeholder remains until the original file is supplied. Select the actual PNG/JPG/WebP under **Website content → Company logo**, then save. It is used unchanged in the header, footer, about section and age popup (unless a separate popup image is chosen). No substitute artwork is represented as the official logo.

### Static mode versus shared server

**Static hosting:** edits are local to the current browser. Export `store-config.js`, replace the file in this existing repository and use its existing deployment. Local image uploads are embedded as data URLs; browser storage limits apply. The dashboard explicitly labels this mode as Local preview.

**Node server:** set `KILIMANI_ADMIN_PASSWORD` securely through the host's environment settings. No default password is committed. Without this variable, public browsing works but shared writes and uploads are disabled. Sign in to make changes visible to all visitors after refresh, without redeploying. Shared configuration takes precedence over local previews. Authentication uses HttpOnly SameSite cookies, origin checks and login rate limits. Sessions expire after eight hours and clear on restart. Conflicting configuration revisions are rejected rather than silently overwriting another admin's changes.

Set `KILIMANI_DATA_DIR` to a private persistent directory outside the public checkout (default `/workspace/.kilimani-store`). Back up `store-config.json`, the `uploads/` directory and any separately integrated `orders.json`. Uploaded images are saved with hash-based names; bytes are preserved. Exports contain image references, so uploaded files must be retained separately. PNG, JPEG and WebP up to 2 MB are accepted; SVG uploads are excluded. The server only exposes allowlisted application files, safe local assets and public image uploads. Configuration is public: never put payment credentials, passwords or customer records in content fields.

Use HTTPS in production and `KILIMANI_SECURE_COOKIES=true`. Existing static Vercel/Cloudflare Pages deployments do not run this long-lived server automatically; shared administration needs a persistent Node runtime or an adapted backend on the existing hosting setup. This change does not create or configure a Supabase project, payment account, new Vercel project or deployment.

## Commerce status

Twelve illustrative sample products are included. Catalogue prices and business details require verification. Checkout is explicitly a preview: no order is submitted, no payment is collected, and customer form details are not persisted. Live commerce still requires verified inventory/prices, fulfilment rules, a customer order intake, payment integration and courier integration. Do not infer delivery times, payment support, store addresses or opening hours from the screenshots.

Private order administration reads `orders.json` only when present. A future order intake must create validated records there or replace that adapter. Order status edits do not dispatch a real courier or notify a customer.

## Checks

Dependency-free API/model/security suite:

```sh
node --test tests/server.test.cjs
```

Browser integration suite (requires Playwright and Chromium available to the test runner):

```sh
KILIMANI_PLAYWRIGHT_PATH=/path/to/playwright \
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
node tests/admin.browser.cjs
```

Autoplay behavior can also be checked against a running default storefront:

```sh
KILIMANI_PLAYWRIGHT_PATH=/path/to/playwright \
CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
KILIMANI_TEST_URL=http://127.0.0.1:3001 \
node tests/category-scroll.browser.cjs
```

The suites use isolated temporary storage and generated test credentials; they do not modify the running store. They verify migration, best-price rules, schema validation, authentication/origin checks, stale-write rejection, byte-preserving uploads, order privacy/statuses, dashboard CRUD, cross-browser changes, editable popup, banner/row rendering, bag/checkout preview, visibility, deletion cleanup and responsive layouts from 320–1440px. Storefront artwork is original or supplied by the user; reference branding and photos are not copied.
