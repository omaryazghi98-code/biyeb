"use client";

import { useEffect, useState } from "react";

type SearchPlayer = { player: { id: number; name: string; nationality?: string; photo?: string }; statistics?: Array<{ team?: { id: number; name: string; logo: string }; games?: { position?: string } }> };
type WatchEntry = { id: string; playerId: string; player: { name: string; nationality?: string | null; position?: string | null; photoUrl?: string | null; currentTeam?: { name: string; logoUrl?: string | null } | null } };

const tags = ["All", "Priority", "One to Watch", "Wonderkid"];

export default function WatchlistPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchPlayer[]>([]);
  const [entries, setEntries] = useState<WatchEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTag, setActiveTag] = useState("All");
  const [error, setError] = useState("");

  async function loadEntries() { const response = await fetch("/api/watchlist"); const data = await response.json(); setEntries(data.entries ?? []); }
  useEffect(() => { void loadEntries(); }, []);

  async function search() {
    if (query.trim().length < 2) return;
    setLoading(true); setError("");
    try { const response = await fetch(`/api/players/search?q=${encodeURIComponent(query.trim())}`); const data = await response.json(); setResults(data.players ?? []); }
    catch { setError("Search failed. Check the football API configuration."); }
    finally { setLoading(false); }
  }

  async function addPlayer(player: SearchPlayer) {
    const response = await fetch("/api/watchlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ player }) });
    if (!response.ok) { setError("Could not add this player."); return; }
    await loadEntries(); setResults([]); setQuery("");
  }

  return (
    <main className="dashboard">
      <header className="header">
        <div><div className="eyebrow">Scoutboard / Player board</div><h1>Your shortlist, without the spreadsheet.</h1><p className="subtitle">Keep prospects in one tactile board. Every player becomes a workspace with fixtures, viewing options and your own scouting memory.</p></div>
        <div className="badge activeBadge">{entries.length} tracked</div>
      </header>

      <section className="card search-card">
        <div className="sectionHeader"><div><div className="eyebrow">Discover</div><h2>Add a player</h2></div><span className="meta">Powered by API-Football</span></div>
        <div className="search-row"><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && void search()} placeholder="Search player name…" aria-label="Search players" /><button onClick={() => void search()} disabled={loading}>{loading ? "Searching…" : "Search"}</button></div>
        {error && <p className="muted">{error}</p>}
        {results.length > 0 && <div className="results">{results.slice(0, 8).map((item) => { const team = item.statistics?.find((stat) => stat.team)?.team; return <button className="result" key={item.player.id} onClick={() => void addPlayer(item)}><span className="playerAvatar">{item.player.photo ? <img src={item.player.photo} alt="" /> : item.player.name.slice(0, 1)}</span><span><strong>{item.player.name}</strong><small>{team?.name ?? "Club unavailable"} · {item.player.nationality ?? "Unknown"}</small></span><span className="result-action">+ Add</span></button>; })}</div>}
      </section>

      <section className="boardToolbar"><div className="filterGroup">{tags.map((tag) => <button className={activeTag === tag ? "countryButton selected" : "countryButton"} key={tag} onClick={() => setActiveTag(tag)}>{tag}</button>)}</div><a className="badge" href="/calendar">See scouting calendar →</a></section>

      <section className="playerBoard">
        {entries.length === 0 ? <div className="card empty"><strong>Your board is empty.</strong><p>Search for a player above and start building your scouting pipeline.</p></div> : entries.map((entry, index) => (
          <a className="scoutCard card" href={`/players/${entry.playerId}`} key={entry.id}>
            <div className="cardTop"><span className="rank">{String(index + 1).padStart(2, "0")}</span><span className="badge">{activeTag === "All" ? "Watching" : activeTag}</span></div>
            <div className="scoutIdentity"><div className="scoutPhoto">{entry.player.photoUrl ? <img src={entry.player.photoUrl} alt="" /> : <span>{entry.player.name.slice(0, 1)}</span>}</div><div><h2>{entry.player.name}</h2><p>{entry.player.position ?? "Position unknown"} · {entry.player.currentTeam?.name ?? "Club unknown"}</p></div></div>
            <div className="scoutFooter"><span>{entry.player.nationality ?? "Nationality unknown"}</span><strong>Open workspace ↗</strong></div>
          </a>
        ))}
      </section>
    </main>
  );
}
