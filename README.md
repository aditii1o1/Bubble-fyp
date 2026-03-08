# Bubble (Frontend + Backend)

This repo is split into:
- `bubble-frontend/` (Expo Router React Native app)
- `bubble-backend/` (Node.js + Express + MongoDB + JWT)

## Shared Environment Setup

1. Copy root template:
   - `cp .env.example .env`
2. Fill real values in `.env`.
3. Root `.env` is the single shared file for both backend + frontend.
4. Legacy fallback: backend will read `bubble-backend/.env` only if root `.env` is missing.

Frontend reads `EXPO_PUBLIC_*` values from root `.env` via npm scripts.

## Backend (local MongoDB)

1. Start MongoDB locally.
2. Install + run:
   - `cd bubble-backend`
   - `npm install`
   - `npm run dev`

Backend runs on `http://localhost:4000`.

## Frontend

1. Install + run:
   - `cd bubble-frontend`
   - `npm install`
   - `npm start`

## Secret Safety Before Push

If any secret/env file was committed in the past, untrack it once:

- `git rm --cached .env bubble-backend/.env bubble-frontend/.env`
- `git commit -m "stop tracking local env files"`

If a real password/token was exposed, rotate it immediately.
