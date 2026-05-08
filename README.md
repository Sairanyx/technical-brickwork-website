# Technical Brickwork - Family owned Company Website

A professional business website built for **Technical Brickwork Ltd**, a specialist bricklaying and masonry company based in Harrow, London. Established 2017.

Live site: [technicalbrickwork.co.uk](https://technicalbrickwork.co.uk)

---

## Project Overview

This project involved taking an existing WordPress site and rebuilding it from scratch as a fast, modern, and maintainable static site. The goals were:

- Professional design that reflects a trusted, established trade business
- Mobile-first layout optimised for customers finding and contacting the company
- Clean codebase with no unnecessary dependencies
- Easy to deploy and maintain without a CMS

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Vite** | Build tool and local dev server |
| **Vanilla JS** | Component logic (nav, animations, form) |
| **CSS Custom Properties** | Design tokens and theming |
| **Netlify** | Hosting and form handling |
| **Supabase** *(planned)* | Quote form database |
| **Zoho Mail** | Custom domain email hosting |
| **Namecheap** | Domain registration (`technicalbrickwork.co.uk`) |

---

## Features

- Fully responsive - mobile, tablet, and desktop
- Scroll-triggered reveal animations via IntersectionObserver
- Mobile navigation with hamburger menu
- Contact/quote form with Netlify Forms integration
- Gallery section with hover effects
- Team section with contact details
- Modular JS component structure

---

## Planned Features

- [ ] 2-step quote form with photo upload
- [ ] Supabase integration to store all quote submissions
- [ ] Email notifications on form submission
- [ ] Auto-reply to customer on submission
- [ ] Simple admin page for the owner to view and manage leads
- [ ] Mobile sticky call button
- [ ] Testimonials section
- [ ] Security hardening (CSP headers, rate limiting, honeypot)

---

## Project Structure

```
technical-brickwork/
├── public/
│   └── images/          # All site images
├── src/
│   ├── main.js          # App entry point
│   ├── style.css        # Global styles and design tokens
│   └── components/
│       ├── nav.js       # Mobile menu and scroll behaviour
│       ├── animations.js# Scroll reveal via IntersectionObserver
│       └── form.js      # Contact form handling
├── index.html           # Root HTML
├── vite.config.js       # Vite configuration
├── netlify.toml         # Netlify deploy config
└── package.json
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev
# → http://localhost:5173

# Build for production
npm run build
```

---

## Deployment

The site is deployed via **Netlify** with continuous deployment from this repository. Every push to `main` triggers an automatic rebuild and deploy.

```
Push to GitHub → Netlify builds → Live in ~30 seconds
```

---

## Design Decisions

- **No framework** - the site is simple enough that React/Vue would add unnecessary complexity and bundle size
- **Raleway font** - matches the logo typography, clean and professional
- **Dark theme** - charcoal backgrounds with off-white text and warm gold accents
- **Modular CSS** - all design tokens in `:root` variables for easy theming

---

## Built By

**Eduard Rednic** - [github.com/Sairanyx](https://github.com/Sairanyx)

B.Eng. ICT Student (Data Engineering & AI), Turku University of Applied Sciences  
R&D Student Assistant, AIS Lab - Autonomous & Intelligent Systems

---

*This is a real project built for our family business.*
