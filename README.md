# ringadvice.com — Setup Guide

## Deploy in 4 Steps (30 min total)

### Step 1 — Buy Domain (5 min, ~€10)
1. Go to **namecheap.com**
2. Search: `ringadvice.com`
3. Buy with WhoisGuard privacy (free)
4. Keep the confirmation email

### Step 2 — Create GitHub Repo (5 min, free)
1. Create account at **github.com**
2. New repository → name: `ringadvice`
3. Upload ALL these project files
4. Make the repo **public** (required for Cloudflare Pages free tier)

### Step 3 — Deploy to Cloudflare Pages (10 min, free)
1. Go to **pages.cloudflare.com** → Create account
2. "Create a project" → "Connect to Git" → Select your GitHub repo
3. Build settings:
   - Framework: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Click Deploy → Wait 2-3 min
5. You get a free URL like `ringadvice.pages.dev`

### Step 4 — Connect Your Domain (10 min)
1. In Cloudflare Pages → Custom domains → Add `ringadvice.com`
2. In Namecheap → Change nameservers to Cloudflare's
3. Wait 10-30 min for DNS propagation
4. ✅ ringadvice.com is live!

---

## Publishing Articles

### From the Article Generator (recommended)
1. Generate article in the Claude generator tool
2. Copy the JSON output
3. Save as `article.json`
4. Run: `node publish.mjs article.json`
5. Commit & push to GitHub → Cloudflare auto-deploys in 2 min

### Manually
- Spanish articles go in: `src/pages/es/analisis/[slug].astro`
- English articles go in: `src/pages/reviews/[slug].astro`
- Use ArticleLayout as the layout component

---

## Affiliate Programs to Register

### Day 1 (no traffic required)
- **Awin**: awin.com → Free to join → Find gadget/tech advertisers
- **Impact.com**: impact.com → Tech brands, 5-15% commissions
- **Oura Ring Direct**: Email partners@ouraring.com → $40/sale

### Month 2-3 (after traffic builds)
- **Amazon Associates Spain**: programas.amazon.es/associates
- **Amazon Associates USA**: affiliate-program.amazon.com
- Requirement: 3 sales in first 180 days, active website

---

## SEO Checklist After Publishing Each Article
- [ ] Submit URL to Google Search Console (search.google.com/search-console)
- [ ] Check indexing status after 48h
- [ ] Add internal links from other articles
- [ ] Share on Reddit (r/QuantifiedSelf, r/smartwatch) if relevant

---

## Monthly Costs
| Item | Cost |
|------|------|
| Domain (Namecheap) | ~€0.83/month |
| Hosting (Cloudflare Pages) | €0 |
| Claude API (articles) | ~€2-5/month |
| **Total** | **~€3-6/month** |
