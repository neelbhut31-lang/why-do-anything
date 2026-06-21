# Why Do Anything?

A calm, content-first library for understanding how daily habits affect the body over time.

## Stack

- Next.js 15 App Router and TypeScript
- Tailwind CSS with system-aware dark mode
- Prisma with Supabase PostgreSQL
- Signed, HTTP-only cookie authentication
- TipTap rich text editor
- Supabase Storage image uploads with media records

## Run locally

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. The admin area is at `http://localhost:3000/admin`.

Default local credentials:

```text
admin@example.com
change-me
```

Change `AUTH_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before deployment. Running `npm run db:seed` updates the configured admin user's password.

## Content

Every item is a `Page`. Pages can be nested to any depth and their URL, breadcrumbs, and child navigation are generated from their ancestry. Content is created and published entirely through the admin area.

## Production notes

This project is ready for Vercel plus Supabase. Vercel runs the website, Supabase PostgreSQL stores pages and users, and the Supabase `media` bucket stores uploaded images. The Vercel build command runs Prisma database setup and seeds starter content automatically.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the beginner-friendly deployment checklist.
