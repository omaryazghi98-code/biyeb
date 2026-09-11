# Scout App Architecture

## Product model

The player is the center of the application. A watchlist entry identifies players the scout wants to follow. Club fixtures are derived from the player's current team. International fixtures are surfaced when the player is associated with a current national-team call-up/squad appearance.

## Core entities

- `players`: normalized football-provider identity and profile information
- `teams`: normalized clubs and national teams
- `competitions`: competitions represented by fixtures
- `fixtures`: upcoming and historical matches
- `watchlist`: scout-owned player tracking state and priority
- `tags`: reusable scouting labels
- `player_tags`: many-to-many player labels
- `scouting_reports`: notes, rating, verdict, and observations linked to a player and optionally a fixture

## Provider boundary

Keep football-provider access behind a small server-side interface. The rest of the application should not know API-Football endpoint details.

Example capabilities:

```ts
interface FootballDataProvider {
  searchPlayers(query: string): Promise<PlayerSearchResult[]>;
  getPlayer(playerId: string): Promise<PlayerProfile | null>;
  getTeam(teamId: string): Promise<Team | null>;
  getUpcomingFixtures(teamId: string, from: Date, to: Date): Promise<Fixture[]>;
  getFixtureLineup(fixtureId: string): Promise<Lineup | null>;
}
```

Start with API-Football. A second provider can implement the same interface later without changing the UI or database model.

## Data flow

1. Scout searches for a player.
2. Backend queries the provider and stores/updates the normalized player/team records.
3. Scout adds the player to the watchlist.
4. A sync job resolves unique tracked teams and imports their upcoming fixtures.
5. The UI joins fixtures with watchlist players to produce the scouting calendar.
6. After a match, the scout writes a report against the player/fixture.

## API efficiency

Do not fetch fixtures per page load. Cache normalized fixtures in PostgreSQL and refresh them through a scheduled sync. Deduplicate by team so multiple watched players at the same club do not multiply fixture requests.

## MVP boundaries

Do not build authentication, transfers, advanced analytics, AI reports, betting, or video ingestion in the first pass. Get the watchlist -> fixtures -> notes loop working first.
