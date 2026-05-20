# MutualFundCompass — Deployment Guide

## Folder structure
```
netlify-deploy/
├── public/
│   ├── index.html          ← main app
│   ├── robots.txt
│   └── sitemap.xml         ← update URL if domain changes
├── netlify/
│   └── functions/
│       └── mfdata.js       ← proxy for mfdata.in (adds CORS headers)
├── netlify.toml            ← build config
└── README.md
```

## Deploy in 3 steps

### Step 1 — Upload to GitHub
1. Create a free account at github.com
2. Create a new repository called `mutualfundcompass`
3. Upload all files in this folder (drag and drop works)

### Step 2 — Connect to Netlify
1. Go to app.netlify.com → "Add new site" → "Import from Git"
2. Connect your GitHub account, select the `mutualfundcompass` repo
3. Build settings are auto-detected from netlify.toml
4. Click "Deploy site"

### Step 3 — Add custom domain (optional)
1. Buy domain on GoDaddy / Namecheap (~₹800/year for .in)
2. Netlify → Site settings → Domain management → Add custom domain
3. Follow DNS instructions — takes ~10 minutes

## After deploy — update these files
- `public/sitemap.xml` → replace `mutualfundcompass.in` with your actual domain
- `public/index.html` → replace `GA_MEASUREMENT_ID` with your Google Analytics ID
- `public/index.html` → replace all `mutualfundcompass.in` references with your domain
- Add an `og-image.png` (1200×630px) to the `public/` folder for social previews

## How the AUM proxy works
When a user opens the tool:
1. Fund list loads instantly from api.mfapi.in (scheme names only)
2. Returns load progressively from mfapi.in (NAV history)
3. AUM + TER load via `/.netlify/functions/mfdata` → mfdata.in
   - This works because Netlify runs server-side, bypassing CORS
   - AUM fills in progressively as each fund's data arrives
   - Cells show shimmer animation while loading
   - Falls back to our verified hardcoded data if proxy fails

## SEO notes
- JSON-LD structured data included (WebApplication + FAQPage)
- Open Graph tags for WhatsApp/LinkedIn/Twitter previews
- Canonical URL set — update to your domain
- sitemap.xml submitted to Google via Search Console after deploy
