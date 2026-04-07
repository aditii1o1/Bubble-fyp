# Bubble (Frontend + Backend)

This repo is split into:
- `bubble-frontend/` (Expo Router React Native app)
- `bubble-backend/` (Node.js + Express + MongoDB + JWT)
- `docs/` (project documentation)

## Documentation

- Khalti integration guide: `docs/khalti.md`

## Shared Environment Setup

1. Copy the root template:
   - `cp .env.example .env`
2. Fill the required values in `.env`.
3. Root `.env` is the single shared file for both backend and frontend.
4. Legacy fallback: the backend still reads `bubble-backend/.env` if the root `.env` is missing.

Important donation keys:

- `KHALTI_SECRET_KEY`
- `EXPO_PUBLIC_KHALTI_ENV`
- `KHALTI_WEBSITE_URL`
- `KHALTI_RETURN_URL`

`EXPO_PUBLIC_KHALTI_PUBLIC_KEY` is not used by the current mobile app flow.
Bubble opens Khalti's official `payment_url` in-app and verifies it with the backend using `pidx`.

Current Khalti ePayment base URLs:

- Sandbox: `https://dev.khalti.com/api/v2/`
- Production: `https://khalti.com/api/v2/`

For local development, a simple callback setup is:

- `KHALTI_WEBSITE_URL=http://localhost:4000`
- `KHALTI_RETURN_URL=http://localhost:4000/payment/callback`

If you are testing on a real phone or Android emulator, make sure the return URL is reachable from that device.
`localhost` is fine for some simulator/web setups, but on-device payment flows usually need your LAN IP or a tunnel URL.

## Render Backend + Resend Email

Use these Render settings for the backend service:

- Root Directory: `bubble-backend`
- Build Command: `npm install`
- Start Command: `npm run start`

Set backend environment variables in Render dashboard:

- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `BACKEND_PUBLIC_URL` (your Render backend URL, for example `https://your-service.onrender.com`)
- `ADMIN_EMAILS` (optional)

Set Resend environment variables:

- `RESEND_API_KEY`
- `RESEND_FROM`
- `RESEND_REPLY_TO` (optional)

Optional first-email test variable:

- `RESEND_TEST_TO`

Optional fallback SMTP/Gmail vars (only if you want backup delivery):

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- or `EMAIL_USER`, `EMAIL_PASSWORD`

Mailer behavior:

1. Backend tries Resend first when `RESEND_API_KEY` and `RESEND_FROM` are set.
2. If Resend fails or is missing, backend falls back to SMTP/Gmail when configured.
3. If neither provider is configured, email is skipped and a warning is logged.

Quick Resend test from backend:

- `cd bubble-backend`
- `npm run email:test -- your-email@example.com`
- or set `RESEND_TEST_TO` and run `npm run email:test`

## Backend (local MongoDB)

1. Start MongoDB locally.
2. Install and run:
   - `cd bubble-backend`
   - `npm install`
   - `npm run dev`

Backend runs on `http://localhost:4000`.

## Frontend

1. Install dependencies:
   - `cd bubble-frontend`
   - `npm install`
2. Start the app:
   - For Expo Go QR scanning: `npm run start:go`
   - For Expo Go with Metro cache reset: `npm run start:go:clear`
   - If the phone cannot open the LAN link/QR: `npm run start:tunnel`
   - If you also want tunnel + cache reset: `npm run start:tunnel:clear`
   - For a custom development build: `npm start`
   - or `npm run start:dev-client`

Important:

- This repo includes `expo-dev-client`, so `npx expo start` / `npm start` is for a custom development build, not Expo Go.
- If you scan that QR without a matching dev build installed on the phone, the QR/link will not open the app correctly.
- For Expo Go, use `npx expo start --go` or `npm run start:go`.
- If your laptop and phone are not on the same network, or the link still does not open, use `--tunnel`.
- If Metro crashes after `npm install` with a missing hidden path such as `.expo-linking-xxxx`, wait for installs to finish and restart with one of the `:clear` scripts above.

Khalti checkout is supported in the mobile app flow, not in Expo web.

## Admin Dashboard

Use Expo web for the admin donations dashboard:

- `cd bubble-frontend`
- `npm run web`

Admin auth still uses the normal Bubble login plus the existing admin role.

## Khalti Sandbox Test Credentials

- Khalti ID: `9800000000`
- MPIN: `1111`
- OTP: `987654`

## Secret Safety Before Push

If any secret/env file was committed in the past, untrack it once:

- `git rm --cached .env bubble-backend/.env bubble-frontend/.env`
- `git commit -m "stop tracking local env files"`

If a real password or token was exposed, rotate it immediately.
