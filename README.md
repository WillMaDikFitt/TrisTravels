# TRIS Travels

Frontend prototype for the Meghalaya experience platform — Next.js App Router, Tailwind, Framer Motion, mock data.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## What’s included

- Experiences (typed by PRD category) + booking / request flow
- Journeys (curated vs small-group) + Craft My Journey
- Destinations, Stories, About, Contact, Partner
- Traveller accounts (Firebase Auth) + wishlist
- Admin CMS (`/admin`) for content, availability, bookings, enquiries

Copy `.env.example` to `.env.local` and add Firebase + Cloudinary keys. Seed Firestore with `npm run seed`. Without env keys the site still runs on static data; bookings/enquiries use in-memory store until restart.

Payments are simulated. Spec: project `Docs/` folder.
