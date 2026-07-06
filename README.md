# Foodie Market

Foodie Market is a full-stack marketplace that connects home cooks (vendors) with local food lovers (buyers). Buyers post bespoke meal requests, vendors bid, and the winning bid becomes an order secured by an escrow payment through Paystack.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Radix UI, shadcn/ui
- **Payments:** Paystack
- **File Storage:** Cloudinary (vendor verification documents)
- **Deployment:** Vercel (API) and Firebase Hosting (frontend) via GitHub Actions

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud provider like Neon, Supabase, or AWS RDS)
- Paystack account (test or live keys)
- Cloudinary account (for vendor document uploads)

## Project Structure

```
c:\foodie
├── api/                  # Express backend
├── hosting/              # React frontend
├── prisma/               # Prisma schema and migrations
├── .env.example          # Required environment variables
└── README.md             # This file
```

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in real values for both backend and frontend:

```bash
cp .env.example .env
```

Then copy the frontend variables into `hosting/.env` when running Vite locally.

## Database Setup

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` in your `.env` file.
3. Apply the initial migration:

```bash
npx prisma migrate deploy
```

4. (Optional) Seed the database if a seed script is available:

```bash
npx prisma db seed
```

## Backend Setup

From the project root:

```bash
npm install
npx tsc --noEmit
```

Run the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000` (or the `PORT` you configured).

## Frontend Setup

From the project root:

```bash
cd hosting
npm install
```

Create a `hosting/.env` file with at least:

```env
VITE_API_BASE="http://localhost:3000"
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Verification

Before committing or deploying, run:

```bash
# TypeScript checks
npx tsc --noEmit

# Frontend production build
npm run build --prefix hosting

# Prisma schema validation
npx prisma validate
```

## Deployment

The repository includes GitHub Actions workflows for deployment:

- **API:** Deployed to Vercel. Ensure `vercel.json` and the project are configured in your Vercel dashboard.
- **Frontend:** Deployed to Firebase Hosting. Ensure the `firebase.json` and Firebase project are configured.

Set all production environment variables in the respective hosting dashboards (Vercel, Firebase) before deploying.

### Manual Deployment (optional)

```bash
# Deploy API to Vercel
vercel --prod

# Deploy frontend to Firebase Hosting
cd hosting
firebase deploy --only hosting
```

## Key Notes

- Vendor sign-up collects address, kitchen media, ID, and utility bill. These documents are uploaded to Cloudinary and stored as `VendorDocument` records for admin review.
- Password reset emails are not sent automatically in production. Configure an email provider (e.g., Resend, SendGrid) and wire it into `api/controllers/authController.ts` in the `requestPasswordReset` function.
- The legacy static HTML pages at the project root (`index.html`, `customers.html`, `cooks.html`, `trust.html`) now redirect to the React application.

## License

MIT
