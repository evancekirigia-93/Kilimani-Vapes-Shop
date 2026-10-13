# Kilimani Vapes Shop

Responsive drinks storefront in the existing repository. Plain HTML, CSS and JavaScript; no dependency installation or build step. Original SVG bottle illustrations and a clearly marked logo placeholder are included. Replace illustrations with licensed product photography and add the official logo under `assets/`, then set its path in the editor.

## Development

Static preview:

```sh
cd /workspace/Kilimani-Vapes-Shop
python3 -m http.server 3000 --bind 0.0.0.0
```

Shared configuration server (Node.js 22+):

```sh
cd /workspace/Kilimani-Vapes-Shop
node server.js
```

The server defaults to port 3001. `PORT` overrides it. Both workflows use the existing checkout; no new repository, worktree or hosting project is needed.

## Store editor

Open `admin.html` through the server. Edit branding, logo URL, colours, homepage text, category rows, the adjacent banner, products, descriptions, sizes, prices, image URLs and contact copy. Advanced JSON edits all supported configuration fields. Layout and application behavior remain source-code changes.

- **Static hosting:** saves local previews in the current browser. Export `store-config.js`, replace that file in this repository, and publish using the existing deployment. Export/import JSON backups are also available. This mode has no shared admin login.
- **Node server:** set `KILIMANI_ADMIN_PASSWORD` securely in the hosting service's environment settings. No password is committed or provided by default. Admin writes are disabled when it is unset. Sign in to save configuration for all visitors. The server uses HttpOnly, SameSite cookies, checks origins on writes, limits login attempts, validates configuration and writes it atomically. Sessions expire after eight hours and are cleared on server restart.

Set `KILIMANI_DATA_DIR` to a persistent private directory outside the public checkout; default `/workspace/.kilimani-store`. Back up `store-config.json`. Node-hosted shared configuration takes precedence over browser previews. Protect production with HTTPS and set `KILIMANI_SECURE_COOKIES=true`. Do not place secrets, customer information or credentials in catalogue configuration. The editor supports image paths/URLs, not uploading files.

Existing static Vercel/Cloudflare Pages deployments do not automatically run this long-lived Node server. Shared administration needs a persistent Node runtime or a separate backend integration with your existing hosting setup. No hosting project was created and no deployment was made.

## Catalogue and checkout

Eight sample products across seven categories demonstrate search, category filtering, price/name sorting, product details, persistent bag quantities and checkout review. All prices are indicative. Bottle artwork is illustrative, not official product photography.

Checkout is explicitly a preview: it never submits an order, charges a customer or stores their contact details. Live commerce requires verified products/stock/prices, business contact information, delivery fees and areas, an order backend and a payment-provider integration. No business facts or payment credentials have been invented.

## Validation

Validated in Chromium at desktop and 390px mobile widths: eight products, search, category filtering, product details, bag persistence, checkout review, no horizontal overflow, local editor saves and product creation. Shared server checks cover unauthenticated writes, incorrect passwords, origin rejection, authenticated editing visible to a second browser, persistent JSON storage, malformed-product rejection and sign-out. No browser JavaScript errors occurred.

The Oaks & Corks reference could not be retrieved because outbound access returned HTTP 403. The design uses an original drinks-store layout and assets; no reference code, images or branding were copied.
