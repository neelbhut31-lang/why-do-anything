# Why Do Anything?

A calm, content-first library for understanding how daily habits affect the body over time.

## Stack

- Next.js 15 App Router and TypeScript
- Tailwind CSS with system-aware dark mode
- Prisma with SQLite
- Signed, HTTP-only cookie authentication
- TipTap rich text editor
- Local image uploads with media records

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

SQLite and `public/uploads` work well on a persistent Node server or Docker volume. On serverless hosts with ephemeral filesystems, replace SQLite with PostgreSQL and the upload route with durable object storage such as S3 or Cloudflare R2. Keep the same `Page` and `Media` interfaces so the application layer does not need to change.
