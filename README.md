# Trek Sathi

A completely new, lightweight front-end recreation of the core trekking-companion system from the supplied project, built primarily with **HTML, CSS and vanilla JavaScript**.

## Included features

- Landing / home dashboard
- Personalized trail recommendations
- Nepal trail explorer
- Search + province + difficulty + duration + budget filters
- Trail detail pages
- Interactive Leaflet/OpenStreetMap route map
- Elevation-style visualization
- Weather/preparation section
- Save / unsave trails
- Mark completed hikes
- Trekker / companion recommendations
- Compatibility scores
- Friend requests and friends
- Groups: browse, filter, join, create
- User search
- Local demo messaging interface
- Profile with saved hikes, past hikes, friends and requests
- Preference onboarding/editing
- Login and signup demo flow
- Responsive mobile/desktop UI
- localStorage persistence
- No React, Vite, Node or database required

## Run locally

Open `index.html` directly in a browser, or use a simple static server:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Deploy

This is a static site. Upload the whole folder to:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any normal web hosting

## Important architecture note

The supplied original project uses React + Node/Express + MongoDB + Socket.IO + a Python recommendation service. This Trek Sathi version intentionally keeps the **main website in HTML/CSS/JavaScript** and uses localStorage for the demo data.

That means login, groups, friends and messages are functional in the browser, but they are not multi-user/server-backed yet. For a production system, replace the localStorage functions in `app.js` with API calls and add a real authentication/database/chat backend.

The map uses Leaflet and OpenStreetMap tiles from their public CDN/services, so an internet connection is needed for the map and remote trail photos.
