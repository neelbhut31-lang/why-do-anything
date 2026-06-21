# Free Deployment Guide

This project is designed for:

- GitHub: stores the website code.
- Vercel: runs the website online.
- Supabase: stores pages, admin login data, and images.

## 1. Supabase Values You Need

Do not paste these values into chat. Put them directly into Vercel.

In Supabase, open your project and go to Project Settings.

You need:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`

Plain meaning:

- `SUPABASE_URL` is your Supabase project address.
- `SUPABASE_SERVICE_ROLE_KEY` is a private master key the website uses on the server to upload images.
- `DATABASE_URL` is the database address the website uses while running.
- `DIRECT_URL` is the direct database address Prisma uses while creating tables.

## 2. Vercel Environment Variables

In Vercel, open your project, then go to Settings > Environment Variables.

Add these variables:

```text
DATABASE_URL
DIRECT_URL
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
AUTH_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
```

Use your own secure values for:

```text
AUTH_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
```

`AUTH_SECRET` can be any long random text. It protects the admin login cookie.

## 3. Vercel Build Command

In Vercel, set the Build Command to:

```bash
npm run vercel-build
```

This command:

1. Generates Prisma database code.
2. Creates or updates Supabase database tables.
3. Adds the starter pages if the database is empty.
4. Builds the Next.js website.

## 4. After Deployment

Check:

- Homepage loads.
- Search works.
- `/admin` opens the login page.
- Admin login works with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Creating a page works.
- Uploading an image works.

## Important Safety Notes

- Never upload `.env` to GitHub.
- Never share `SUPABASE_SERVICE_ROLE_KEY`.
- Never share your database password.
- Keep the Supabase `media` bucket public, because article images need public URLs.
