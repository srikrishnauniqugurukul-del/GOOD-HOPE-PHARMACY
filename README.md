# Good Hope Pharmacy — Kalimpong

Official full-stack healthcare website, visiting specialist directory, appointment booking system, and full-control Admin Dashboard for **Good Hope Pharmacy**, KD Pradhan Road, Kalimpong Bazar, Kalimpong, West Bengal 734301 (`3FCC+MF`).

## Key Capabilities

- **Public Healthcare Website**: Animated 4-scene hero (with reduced-motion/static toggle), About Good Hope, Why Choose Good Hope, 11 Service Categories, 8 Visiting Doctors Directory (with individual SEO profile pages), Real Appointment Booking Workflow, In-Store Pharmacy Information (no online drug sales), Photo Gallery with Lightbox, Contact & Location Page, 4-Language Support (English, Bengali, Nepali, Hindi), and Legal/Policy Pages.
- **Full-Control Admin Panel (`/admin`)**:
  - 18-item Green & Navy sidebar covering Dashboard Overview (real DB charts), Appointments Table, Calendar View, Doctors, Departments, Services, Private Customers, Business Hours (IST), per-Doctor Availability Schedules, Blocked Dates & Holidays, Photo Gallery (upload from device, caption, reorder, Show/Hide, permanent Delete), Website Content & Master Show/Hide Section Toggles, Notifications & Contact Enquiries, Verified Reviews, Map & Contact Settings, Admin Profile, Security & Audit Logs, and Logout.
  - All edits, Show/Hide switches, and uploaded/deleted photos persist on the server immediately across all browsers and devices.

## Database & Supabase PostgreSQL Setup

1. By default, the Express backend persists all changes atomically on the server (`data/goodhope-store.json` + uploaded media in `data/uploads/`) so edits and gallery uploads are immediately live across all visitors.
2. To connect **Supabase PostgreSQL**:
   - Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor to create all tables, indexes, Row Level Security (RLS) policies, and the `book_appointment_atomic` function.
   - Optionally run `supabase/seed.sql` to populate initial departments and all 8 doctors in `draft_unverified` status.
   - Add `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` to your environment secrets.

## Admin Authentication & Security

- Visit `/admin/login` on first launch to claim the initial owner administrator account (one-time bootstrap locked immediately after claim), or configure `ADMIN_PASSCODE` in environment secrets.
- Admin passwords are hashed server-side using `crypto.scryptSync` and verified via timing-safe comparison.
- Admin sessions use signed `Authorization: Bearer` tokens kept strictly in memory (never `localStorage`).
- Private customer records and appointments are excluded from all public API endpoints.
- Uploaded media serving enforces strict path-traversal confinement.

## Running Locally & Deployment

```bash
npm install
npm run dev      # Runs Express + Vite full-stack server on port 3000
npm run build    # Builds production frontend bundle
npm start        # Runs production server via tsx server.ts
```
