# Scout App

Personal football scouting watchlist and fixture tracker.

## MVP

- Search football players
- Add players to a watchlist
- Automatically surface upcoming club fixtures
- Track national-team fixtures when called up
- Take notes per match
- Tag players (`Wonderkid`, `One to Watch`, `Priority`, etc.)
- Maintain scouting reports and verdicts
- Weekly scouting calendar

## Planned stack

- Next.js + TypeScript
- PostgreSQL
- API-Football as the first football-data provider
- Provider abstraction so the data source can be swapped later

## Architecture

```text
API-Football
     |
     v
Application backend
     |
     +--> PostgreSQL
     |
     v
Next.js UI
```

See `docs/architecture.md` for the initial design.