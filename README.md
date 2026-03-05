# TajHotel — Production Website

**Luxury 4-page fine-dining website for TajHotel, New Delhi, India.**

## File Structure

```
/
├── index.html              # Home page
├── menu.html               # Menu page (dynamic, rendered from JSON)
├── about.html              # About / Quality & Sourcing + Interior Gallery
├── contact.html            # Contact & Reservations
├── styles.css              # Full design system (CSS custom properties)
├── main.js                 # Progressive-enhanced interactivity
├── menu-with-images.json   # Canonical menu data (97 items, 7 categories)
├── restaurant-schema.jsonld # Restaurant JSON-LD structured data
├── scripts/
│   └── image-map.js        # Node.js helper to regenerate menu-with-images.json
└── [dish images].jpeg/.png # All assets in root directory
```

---

## Slug Rules

Dish names are matched to image filenames using the following `slugify` function:

```js
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
```

**Examples:**
| Dish Name | Slug | Matched File |
|---|---|---|
| Smoked Salmon Carpaccio | `smoked-salmon-carpaccio` | `Smoked Salmon Carpaccio.jpeg` |
| Burrata & Heirloom Tomatoes | `burrata-heirloom-tomatoes` | `Burrata & Heirloom Tomatoes.jpeg` |
| Crème Brûlée | `cr-me-br-l-e` | `Crème Brûlée.jpeg` |
| Charcoal-Grilled Tomahawk 1kg | `charcoal-grilled-tomahawk-1kg` | `Charcoal-Grilled Tomahawk 1kg.jpeg` |

When **multiple files** match a slug (e.g. `Caramel Panna Cotta.jpeg` and `Caramel Panna Cotta (2).jpeg`), the file with the **largest pixel area (width × height)** is selected. File size is used as a proxy when `sharp` is not installed.

---

## Serving the Site

> **Important:** `menu.html` fetches `menu-with-images.json` via `fetch()`. This requires an HTTP server — it **will not work** when opened as `file://` directly.

**Quick local server options:**

```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js (npx)
npx serve .

# Option 3: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then open: `http://localhost:8080`

---

## Regenerating menu-with-images.json

```bash
# Install dependency (optional but recommended for accuracy)
npm install sharp

# Run the mapper
node scripts/image-map.js
```

The script will:
1. Scan all image files in the project root
2. Slugify each filename and match against menu item names
3. Pick highest-resolution file when duplicates exist
4. Write `menu-with-images.json`

---

## Generating Optimised Image Variants (Sharp)

For production, generate AVIF/WebP/JPEG srcset variants:

```bash
npm install sharp-cli -g

# For each image, generate variants at 480, 960, 1440px:
npx sharp -i "Smoked Salmon Carpaccio.jpeg" -o "dist/smoked-salmon-carpaccio-480.avif" resize 480 --format avif --quality 80
npx sharp -i "Smoked Salmon Carpaccio.jpeg" -o "dist/smoked-salmon-carpaccio-960.webp" resize 960 --format webp --quality 82
npx sharp -i "Smoked Salmon Carpaccio.jpeg" -o "dist/smoked-salmon-carpaccio-1440.jpeg" resize 1440 --quality 85
```

Or use a batch script:

```js
// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const widths = [480, 960, 1440];
const formats = ['avif', 'webp', 'jpeg'];
const srcDir = '.';
const outDir = './dist/assets';

fs.mkdirSync(outDir, { recursive: true });

fs.readdirSync(srcDir)
  .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  .forEach(file => {
    const slug = file.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    widths.forEach(w => {
      formats.forEach(fmt => {
        sharp(path.join(srcDir, file))
          .resize(w)
          .toFile(path.join(outDir, `${slug}-${w}.${fmt}`))
          .catch(console.error);
      });
    });
  });
```

---

## Editing the Menu

1. Open `menu-with-images.json` in any text editor
2. Edit `name`, `descriptor`, `priceINR`, `tags` for each item
3. To add a new dish: add a new object to the array, matching the category name exactly
4. To add an image: place the image file in the project root → run `node scripts/image-map.js`
5. Save `menu-with-images.json` — the menu page will reflect changes automatically

**Category names (must match exactly):**
- `Starters / Appetizers`
- `Signature Steaks`
- `Fresh Seafood`
- `Indian Classics`
- `Global Cuisine / Chef Specials`
- `Desserts`
- `Beverages & Wine`

**Auto-tagging heuristics (used for dietary filters):**
- Vegetarian: name contains `Paneer`, `Vegetable`, `Kulfi`, `Gulab`, `Dal`, `Truffle Arancini`, `Burrata`, `Gnocchi`, `Risotto`
- Tags are set manually in `menu-with-images.json` — edit the `tags` array per item

---

## Deployment

### Netlify / Vercel (Recommended)
```bash
# Push to GitHub, connect repo to Netlify
# Set publish directory to: .
# No build command needed for static HTML
```

### S3 + CloudFront
```bash
aws s3 sync . s3://your-bucket --exclude "*.js.map" --cache-control "max-age=31536000"
aws cloudfront create-invalidation --distribution-id XXXX --paths "/*"
```

### Caching Headers (recommended)
```
# Static assets: long cache with hash-busting
Cache-Control: public, max-age=31536000, immutable  # for hashed CSS/JS

# HTML pages: revalidate
Cache-Control: public, max-age=0, must-revalidate
```

### SSL & Performance
- Enable Brotli & Gzip compression on your host
- HTTP/2 or HTTP/3 for asset multiplexing
- Add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` (already in all pages)

---

## Wiring the Reservation Form

The form in `contact.html` submits to `#` by default. To wire a real backend:

### Option A: Formspree (no server needed)
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="post">
```

### Option B: Serverless (AWS Lambda / Vercel Function)

Create `api/reservation.js`:
```js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { fullName, email, phone, date, time, partySize, specialRequests } = req.body;
  // Send confirmation email via SendGrid / Resend
  // await sendEmail({ to: email, subject: 'TajHotel Reservation Confirmed', ... });
  res.status(200).json({ success: true });
}
```

Update form action:
```html
<form id="reservation-form" action="/api/reservation" method="post">
```

---

## Google Maps Embed

Replace the static image placeholder in `contact.html`:

```html
<!-- Find this comment in contact.html and replace the map-placeholder div: -->
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!... (get from maps.google.com → Share → Embed)"
  width="100%" height="220" style="border:0;border-radius:var(--radius-xl)"
  allowfullscreen="" loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  title="TajHotel location on Google Maps">
</iframe>
```

---

## Analytics (Opt-in Only)

Analytics is **disabled by default**. To enable Google Analytics 4:

```html
<!-- Add before </head> in all HTML files -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

For privacy-first alternative, consider [Plausible](https://plausible.io) or [Fathom](https://usefathom.com).

---

## Developer Note — Image Mapping Summary

`menu-with-images.json` was generated by manually slug-matching each of the 97 menu items against the 123 image files in the workspace root. The slug rule (`/[^a-z0-9]+/g → '-'`) was applied to both the dish name and the image filename (without extension). When duplicate candidates were found (e.g. `Caramel Panna Cotta.jpeg` vs `Caramel Panna Cotta (2).jpeg`), the larger file (by byte size, as a resolution proxy) was selected. Items with no matching image have `"image": null` and render as text-only rows.

To regenerate: `node scripts/image-map.js`

---

*Built with HTML5, Vanilla CSS, and progressive-enhanced JavaScript. No external UI frameworks.*
