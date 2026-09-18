# Technical Brickwork

Website for Technical Brickwork Ltd, a specialist bricklaying and masonry
company in Harrow, London.

**Live:** [technicalbrickwork.co.uk](https://technicalbrickwork.co.uk)

A rebuild of an older WordPress site as a static, fast, dependency-light
production site with a lead capture form and an admin dashboard.

## Stack

Vite, vanilla JS, CSS custom properties. Hosted on Netlify with serverless
functions. Supabase for lead storage, Zoho for email.

## Structure

```
public/images/        Site images
src/
  main.js             Homepage entry
  quote.js            Quote form
  admin.js            Admin dashboard
  legal.js            Legal pages entry
  style.css           Homepage styles and design tokens
  legal.css           Legal page styles
  components/         Nav, animations, footer, page transitions
netlify/functions/
  submit-quote.js     Accepts form submissions (public, write only)
  leads.js            Reads and updates leads (requires login)
index.html            Homepage
quote.html            Quote form
admin.html            Admin dashboard
privacy.html          Privacy policy
cookies.html          Cookie policy
terms.html            Website terms
```

## Running locally

```bash
npm install
npx netlify dev
```

Use `netlify dev`, not `npm run dev`. Plain Vite does not run the functions, so
the quote form and admin dashboard will not work.

## Environment variables

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
```

Set these in Netlify under Environment variables, marking the secret key as a
secret value. Do not add a `VITE_` prefix: that would expose them to every
visitor's browser.

## Security

No database credentials reach the browser. All Supabase access goes through the
Netlify Functions, which hold a secret key server side.

Row Level Security is enabled on the `quotes` table with no policies granting
access to the `anon` role, so a public key cannot read or write it. Reading and
updating leads requires a Netlify Identity session, verified inside the function
rather than only in the UI.

Lead data is escaped before rendering in the admin dashboard, since it comes
from a public form. The quote form has a honeypot field and server side
validation. Security headers are set in `netlify.toml`, and `/admin` is excluded
from search engines.

## Database

PostgreSQL `quotes` table: id, created_at, name, phone, email, postcode,
contact_method, service, message, status.

## Deployment

Netlify, continuous deployment from GitHub. Every push to `main` rebuilds and
deploys.

## Built by

**Eduard Rednic** ([github.com/Sairanyx](https://github.com/Sairanyx))

B.Eng. ICT student (Data Engineering and AI), Turku University of Applied
Sciences. R&D Student Assistant, AIS Lab.
