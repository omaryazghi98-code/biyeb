# Scoutboard

Personal football scouting watchlist and match calendar.

## Stack

- Next.js + TypeScript
- PostgreSQL + Prisma
- API-Football as the football data provider

## Local setup

```bash
cd scout-app
npm install
cp .env.example .env.local
npx prisma generate
npm run dev
```

Set `API_FOOTBALL_KEY` in `.env.local`. Set `DATABASE_URL` when database-backed features are enabled.

## Current MVP foundation

- Dashboard shell
- Watchlist domain model
- Teams, fixtures and scouting reports schema
- API-Football provider wrapper
- `GET /api/players/search?q=...` player search endpoint

## Next build step

Connect player search to an interactive add-to-watchlist UI, persist selected players, then sync their upcoming club fixtures into the database.
