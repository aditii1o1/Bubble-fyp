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
2. Start the app on Android or iOS:
   - `npm start`
   - or `npx expo start --dev-client`

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
