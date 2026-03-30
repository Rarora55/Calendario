# Calendario Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-30

## Active Technologies
- TypeScript on Expo/React Native 0.81 + Expo Router 6, with existing backend TypeScript-compatible services unchanged for this feature + React Native, Expo, Expo Router, Zustand, Expo SQLite, Supabase, Express, Prisma (002-swipe-delete-timer)
- SQLite-backed local business data with existing sync metadata; transient timer/swipe UI state in Zustand memory (002-swipe-delete-timer)

- React Native
- Expo
- TypeScript
- Expo Router
- Zustand
- SQLite
- Supabase (Auth, PostgreSQL, Storage, Sync)
- Express
- PostgreSQL + Prisma
- ESLint + Prettier
- Jest + React Native Testing Library
- Playwright

## Project Structure

```text
app/
components/
src/
backend/
prisma/
supabase/
tests/
|-- unit/
|-- integration/
`-- e2e/
```

## Commands

npm test; npm run lint

## Code Style

- Clean Code, SOLID, DRY, KISS
- Simple UX and responsive design
- Minimal dependencies with explicit justification
- Mandatory automated testing for every meaningful change

## Recent Changes
- 002-swipe-delete-timer: Added TypeScript on Expo/React Native 0.81 + Expo Router 6, with existing backend TypeScript-compatible services unchanged for this feature + React Native, Expo, Expo Router, Zustand, Expo SQLite, Supabase, Express, Prisma

- 001-laboris-product-setup: Added TypeScript on Expo/React Native 0.81 + Expo Router 6 for the client, plus TypeScript-compatible Express and Prisma patterns for backend work + React Native, Expo, Expo Router, Zustand, SQLite via Expo, Supabase Auth/PostgreSQL, Express, Prisma

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
