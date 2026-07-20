# ALFA IT SERVICES - Backend

This backend implements a secure Node.js + Express API scaffold with JWT auth, Supabase support, uploads, logging and basic security hardening.

Quick start:

```powershell
cd backend
npm install
cp .env.example .env   # edit env values (JWT_SECRET, SUPABASE_*, SMTP_*, CORS_ORIGIN)
npm run dev
```

APIs mounted under `/api/*`.

Notes:
- Use Supabase by setting `SUPABASE_URL` and `SUPABASE_KEY` in `.env`.
- Logs are written to `logs/` with daily rotation.
- Uploads saved to `uploads/` and served read-only.

See code for more details.
