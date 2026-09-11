"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = { id: string; playerId: string; player: { name: string; position?: string | null; currentTeam?: { name: string; logoUrl?: string | null } | null } };
type Fixture = { id: string; kickoffAt: string; competition?: string | null; homeTeam: { name: string; logoUrl?: string | null }; awayTeam: { name: string; logoUrl?: string | null } };

function day(value: string) { return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(value)); }
function time(value: string) { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/watchlist").then((r) => r.json()), fetch("/api/watchlist/fixtures").then((r) => r.json())])
      .then(([watch, fx]) => { setEntries(watch.entries ?? []); setFixtures(fx.fixtures ?? []); })
      .finally(() => setLoading(false));
  }, []);

  const next = useMemo(() => fixtures.slice(0, 5), [fixtures]);

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <div className="eyebrow">Scoutboard / Command desk</div>
          <h1>Watch the players.<br />We’ll handle the fixture noise.</h1>
          <p className="subtitle">A tactile scouting board for prospects you care about. Add a player once; their relevant matches, viewing options and your notes stay connected.</p>
        </div>
        <a className="primaryButton badge" href="/watchlist">+ Add player</a>
      </header>

      <section className="card heroPanel">
        <div className="cardTitleRow"><div><div className="eyebrow">This week</div><h2>Scouting workload</h2></div><span className="badge">Live board</span></div>
        <div className="heroStats">
          <div className="statTile"><small>Players tracked</small><strong>{loading ? "—" : entries.length}</strong></div>
          <div className="statTile"><small>Matches ahead</small><strong>{loading ? "—" : fixtures.length}</strong></div>
          <div className="statTile"><small>Priority mode</small><strong>{entries.filter((e) => e.player.name).length ? "Focused" : "Ready"}</strong></div>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <div className="cardTitleRow"><div><div className="eyebrow">Next opportunities</div><h2>Tracked fixtures</h2></div><a className="badge" href="/calendar">Open calendar →</a></div>
          {next.length === 0 ? <div className="empty">Your board is waiting. Add your first player.</div> : next.map((fixture) => (
            <a className="fixture" href={`/calendar#${fixture.id}`} key={fixture.id}>
              <div><div className="time">{day(fixture.kickoffAt)}</div><strong>{time(fixture.kickoffAt)}</strong></div>
              <div><div className="match">{fixture.homeTeam.name} <span className="vs">vs</span> {fixture.awayTeam.name}</div><div className="meta">{fixture.competition ?? "Match"}</div></div>
              <span className="badge">Scout</span>
            </a>
          ))}
        </div>

        <aside className="card">
          <div className="cardTitleRow"><div><div className="eyebrow">Your board</div><h2>Watched players</h2></div><a className="badge" href="/watchlist">Manage →</a></div>
          {entries.length === 0 ? <div className="empty">No players yet.</div> : <div className="players">{entries.slice(0, 6).map((entry) => (
            <a className="player" href={`/players/${entry.playerId}`} key={entry.id}><div className="playerLeft"><div className="playerAvatar"><span>{entry.player.name.slice(0, 1)}</span></div><div><strong>{entry.player.name}</strong><span>{entry.player.currentTeam?.name ?? "Club unknown"} · {entry.player.position ?? "—"}</span></div></div><span className="badge">Watch</span></a>
          ))}</div>}
        </aside>
      </section>
    </main>
  );
}
