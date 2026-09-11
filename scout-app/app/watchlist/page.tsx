"use client";

import { useEffect, useState } from "react";

type SearchPlayer = {
  player: { id: number; name: string; nationality?: string; photo?: string };
  statistics?: Array<{ team?: { id: number; name: string; logo: string }; games?: { position?: string } }>;
};

type WatchEntry = {
  id: string;
  playerId: string;
  player: { name: string; nationality?: string | null; position?: string | null; photoUrl?: string | null; currentTeam?: { name: string } | null };
};

export default function WatchlistPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPlayer[]>([]);
  const [entries, setEntries] = useState<WatchEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadEntries() {
    const response = await fetch("/api/watchlist");
    const data = await response.json();
    setEntries(data.entries ?? []);
  }

  useEffect(() => { void loadEntries(); }, []);

  async function search() {
    if (query.trim().length < 2) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/players/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      setResults(data.players ?? []);
    } catch { setError("Search failed. Check the football API configuration."); }
    finally { setLoading(false); }
  }

  async function addPlayer(player: SearchPlayer) {
    setError("");
    const response = await fetch("/api/watchlist", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ player }),
    });
    if (!response.ok) { setError("Could not add this player."); return; }
    await loadEntries(); setResults([]); setQuery("");
  }

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <div className="eyebrow">Scoutboard / Watchlist</div>
          <h1>Build your player board.</h1>
          <p className="subtitle">Search the football database, add a player once, and Scoutboard starts tracking his club.</p>
        </div>
        <div className="navLinks"><a className="badge" href="/">Dashboard</a><a className="badge" href="/calendar">Calendar</a></div>
      </header>

      <section className="card search-card">
        <div className="search-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void search()} placeholder="Search a player…" aria-label="Search players" />
          <button onClick={() => void search()} disabled={loading}>{loading ? "Searching…" : "Search"}</button>
        </div>
        {error && <p className="muted">{error}</p>}
        {results.length > 0 && <div className="results">
          {results.slice(0, 8).map((item) => {
            const team = item.statistics?.find((stat) => stat.team)?.team;
            return <button className="result" key={item.player.id} onClick={() => void addPlayer(item)}>
              <span className="avatar">{item.player.photo ? <img src={item.player.photo} alt="" /> : item.player.name.slice(0, 1)}</span>
              <span><strong>{item.player.name}</strong><small>{team?.name ?? "Club unavailable"} · {item.player.nationality ?? "Unknown"}</small></span>
              <span className="result-action">+ Add</span>
            </button>;
          })}
        </div>}
      </section>

      <section className="card">
        <div className="section-heading"><h2>My watchlist</h2><span className="badge">{entries.length} players</span></div>
        {entries.length === 0 ? <p className="empty">No players yet. Search above and add your first prospect.</p> : <div className="players">
          {entries.map((entry) => <a className="player" href={`/players/${entry.playerId}`} key={entry.id}>
            <div><strong>{entry.player.name}</strong><span>{entry.player.currentTeam?.name ?? "No current club"} · {entry.player.position ?? "Position unknown"}</span></div>
            <span className="badge">Open workspace →</span>
          </a>)}
        </div>}
      </section>
    </main>
  );
}
