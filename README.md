# Technical Brickwork — Company Website

A full-stack professional business website built for **Technical Brickwork Ltd**, a specialist bricklaying and masonry company based in Harrow, London. Established 2017.

**Live site:** [technicalbrickwork.co.uk](https://technicalbrickwork.co.uk)

---

## Project Overview

This project involved taking an existing WordPress site and rebuilding it from scratch as a fast, modern, secure, and maintainable production website. The goals were:

- Professional design that reflects a trusted, established trade business
- Mobile-first layout optimised for customers finding and contacting the company
- Full lead management system — quote form, database, email notifications, admin dashboard
- Clean codebase with no unnecessary dependencies
- Easy to deploy and maintain without a CMS

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Vite** | Build tool and local dev server |
| **Vanilla JS** | Component logic (nav, animations, form, admin) |
| **CSS Custom Properties** | Design tokens and theming |
| **Netlify** | Hosting, CI/CD, form detection, identity (auth) |
| **Supabase** | PostgreSQL database for quote storage |
| **Zoho Mail** | Custom domain email hosting |
| **Namecheap** | Domain registration (`technicalbrickwork.co.uk`) |
| **Netlify Forms** | Email notifications on form submission |

---

## Features

### Website
- Fully responsive — mobile, tablet, and desktop
- Scroll-triggered reveal animations via IntersectionObserver
- Mobile navigation with hamburger menu
- Sticky call button on mobile for instant contact
- SEO optimised — meta tags, Open Graph, Schema markup, sitemap, robots.txt
- Google Search Console verified
- Google Business Profile set up
- Security headers (X-Frame-Options, XSS protection, CSP etc.)

### Quote Form (`/quote`)
- 2-step form with smooth transitions
- Visual service selector (tap cards, no dropdowns)
- Multi-select preferred contact method (Call / WhatsApp / Email)
- Postcode field for location filtering
- Submissions saved to Supabase database
- Email notification to `info@technicalbrickwork.co.uk` on every submission
- Success screen with direct contact details

### Admin Dashboard (`/admin`)
- Netlify Identity authentication (email and password login)
- Shows all quote leads from Supabase in real time
- Stats: Total / New / Done
- Filter by status (All / New only / Done)
- Click to call directly from the page
- Click to WhatsApp with pre-filled message
- Mark leads as Done / Reopen
- Auto-refreshes every 60 seconds

### Email
- `info@technicalbrickwork.co.uk` via Zoho Mail
- MX, SPF, DKIM records configured

---

## Project Structure

```
technical-brickwork/
├── public/
│   ├── images/          # All site images
│   ├── sitemap.xml      # SEO sitemap
│   └── robots.txt       # Search engine rules
├── src/
│   ├── main.js          # Main entry point
│   ├── style.css        # Global styles and design tokens
│   ├── quote.js         # Quote form logic + Supabase integration
│   ├── admin.js         # Admin dashboard logic
│   └── components/
│       ├── nav.js       # Mobile menu
│       ├── animations.js# Scroll reveal
│       └── form.js      # Form handling
├── index.html           # Main website
├── quote.html           # Quote form page
├── admin.html           # Admin dashboard
├── vite.config.js       # Vite configuration
├── netlify.toml         # Netlify deploy + security headers
└── package.json
```

---

## Getting Started

```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

Create a `.env` file in the root:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add the same variables to Netlify → Environment variables.

---

## Deployment

Deployed via **Netlify** with continuous deployment from GitHub. Every push to `main` triggers an automatic rebuild and deploy in ~30 seconds.

---

## Database (Supabase)

PostgreSQL `quotes` table with columns: id, created_at, name, phone, email, postcode, contact_method, service, message, status.

RLS policies: anonymous insert, select, and update enabled.

---

## Security

- HTTPS via Let's Encrypt (auto-provisioned by Netlify)
- Security headers via `netlify.toml`
- Admin protected by Netlify Identity
- `/admin` blocked from search engines via robots.txt
- Environment variables stored in Netlify, never in code
- Honeypot spam protection on quote form

---

## Built By

**Eduard Rednic** — [github.com/Sairanyx](https://github.com/Sairanyx)

B.Eng. ICT Student (Data Engineering & AI specialisation), Turku University of Applied Sciences
R&D Student Assistant, AIS Lab — Autonomous & Intelligent Systems

*Real client project built for a family business. All systems live and operational.*
