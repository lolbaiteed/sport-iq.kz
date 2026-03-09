# Astro + Tailwind + Strapi Starter

A clean starter project for building a content-driven website with:
- **Astro** — static site generator (blazing fast, great SEO)
- **Tailwind CSS** — utility-first CSS framework
- **Strapi** — headless CMS backend (Node.js + MySQL)

---

## Project Structure

```
src/
├── components/
│   └── ArticleCard.astro     # Blog post card component
├── layouts/
│   └── Base.astro            # Shared HTML layout (navbar + footer)
├── lib/
│   └── strapi.js             # Strapi API helper functions
├── pages/
│   ├── index.astro           # Homepage
│   ├── about.astro           # About page
│   └── blog/
│       ├── index.astro       # Blog listing page
│       └── [slug].astro      # Dynamic blog post page
```

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure your Strapi URL
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Then edit `.env`:
```
STRAPI_URL=http://localhost:1337
STRAPI_TOKEN=your_api_token_here
```

Get your API token from: Strapi Admin → Settings → API Tokens → Create new token

### 3. Set up Strapi content types
In your Strapi admin, create a **Collection Type** called `Article` with these fields:
| Field        | Type        | Notes                        |
|--------------|-------------|------------------------------|
| title        | Short text  | Required                     |
| slug         | UID         | Based on title               |
| description  | Short text  | Optional summary             |
| content      | Rich text   | Main body                    |
| cover        | Media       | Cover image                  |
| publishedAt  | Date        | Auto-managed by Strapi       |

### 4. Run locally
```bash
npm run dev
```
Your site will be at `http://localhost:4321`

### 5. Build for production
```bash
npm run build
```
This outputs a `dist/` folder of pure static HTML files.

---

## Deploying to Plesk

1. Run `npm run build` locally to generate the `dist/` folder
2. In Plesk, go to your domain → **File Manager**
3. Upload the contents of `dist/` to your domain's `public_html/` folder
4. That's it! No Node.js required for the frontend

> **Tip:** Strapi backend runs separately as a Node.js app on a subdomain like `api.yoursite.com`

---

## Customizing

### Change site name & nav
Edit `src/layouts/Base.astro` — update the logo text and nav links.

### Add new pages
Create a new `.astro` file in `src/pages/`. For example:
- `src/pages/contact.astro` → becomes `/contact`
- `src/pages/portfolio/index.astro` → becomes `/portfolio`

### Add new Strapi content types
1. Create the collection type in Strapi admin
2. Add a new fetch function in `src/lib/strapi.js`
3. Use it in any `.astro` page with `await yourNewFunction()`

### Tailwind customization
Edit `tailwind.config.mjs` to change fonts, colors, and more.

---

## Tech Stack

| Tool       | Purpose              | Docs                          |
|------------|----------------------|-------------------------------|
| Astro      | Static site generator | https://docs.astro.build      |
| Tailwind   | CSS framework         | https://tailwindcss.com       |
| Strapi     | Headless CMS          | https://docs.strapi.io        |
