"use client";

import { useEffect, useMemo, useState } from "react";

type Fixture = { id: string; kickoffAt: string; competition?: string | null; venue?: string | null; homeTeam: { name: string; logoUrl?: string | null }; awayTeam: { name: string; logoUrl?: string | null } };
type Broadcast = { country: string; countryCode: string; station: string; stationUrl?: string | null; logoUrl?: string | null };
const PINNED = [["MA", "🇲🇦 Morocco"], ["FR", "🇫🇷 France"], ["US", "🇺🇸 USA"]] as const;
const COUNTRIES = [["GB", "🇬🇧 United Kingdom"], ["ES", "🇪🇸 Spain"], ["DE", "🇩🇪 Germany"], ["IT", "🇮🇹 Italy"], ["PT", "🇵🇹 Portugal"], ["NL", "🇳🇱 Netherlands"], ["BE", "🇧🇪 Belgium"], ["TR", "🇹🇷 Türkiye"], ["SA", "🇸🇦 Saudi Arabia"], ["AE", "🇦🇪 UAE"], ["CA", "🇨🇦 Canada"], ["AU", "🇦🇺 Australia"]] as const;
function displayDate(value: string) { return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(value)); }
function displayTime(value: string) { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export default function CalendarPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("MA");
  const [broadcasts, setBroadcasts] = useState<Record<string, Broadcast[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/watchlist/fixtures").then((r) => r.json()).then((d) => setFixtures(d.fixtures ?? [])).finally(() => setLoading(false)); }, []);
  const days = useMemo(() => { const groups = new Map<string, Fixture[]>(); for (const fixture of fixtures) { const key = new Intl.DateTimeFormat("en-CA", { year:"numeric", month:"2-digit", day:"2-digit" }).format(new Date(fixture.kickoffAt)); groups.set(key, [...(groups.get(key) ?? []), fixture]); } return [...groups.entries()]; }, [fixtures]);

  async function loadBroadcasts(fixtureId: string, country = selectedCountry) {
    setExpanded(fixtureId);
    if (broadcasts[`${fixtureId}:${country}`]) return;
    const response = await fetch(`/api/fixtures/${fixtureId}/broadcasts?country=${country}`); const data = await response.json();
    setBroadcasts((current) => ({ ...current, [`${fixtureId}:${country}`]: data.broadcasts ?? [] }));
  }
  function countryName(code: string) { return [...PINNED, ...COUNTRIES].find(([key]) => key === code)?.[1] ?? "Selected country"; }

  return <main className="dashboard">
    <header className="header"><div><div className="eyebrow">Scoutboard / Scouting calendar</div><h1>Never miss a viewing.</h1><p className="subtitle">Every upcoming match that matters to your board, grouped into a clean viewing agenda. Broadcast rights stay country-specific.</p></div><a className="badge activeBadge" href="/watchlist">+ Manage players</a></header>

    <section className="card countryBar"><div><div className="eyebrow">Where to watch</div><h2>Broadcast market</h2><div className="meta">Pinned markets stay one tap away.</div></div><div className="countryControls">{PINNED.map(([code, name]) => <button key={code} className={selectedCountry === code ? "countryButton selected" : "countryButton"} onClick={() => setSelectedCountry(code)}>{name}</button>)}<label className="countrySelect"><span>More</span><select value={COUNTRIES.some(([code]) => code === selectedCountry) ? selectedCountry : ""} onChange={(e) => e.target.value && setSelectedCountry(e.target.value)}><option value="">Other markets…</option>{COUNTRIES.map(([code, name]) => <option value={code} key={code}>{name}</option>)}</select></label></div></section>

    <section className="calendar">{loading ? <div className="card loadingState">Syncing your board…</div> : days.length === 0 ? <div className="card empty"><strong>No tracked fixtures yet.</strong><p>Add a player and Scoutboard will build the agenda automatically.</p></div> : days.map(([day, matches]) => <div className="day" key={day}><div className="dayTitle">{displayDate(matches[0].kickoffAt)}</div>{matches.map((fixture) => { const key = `${fixture.id}:${selectedCountry}`; const isOpen = expanded === fixture.id; const stations = broadcasts[key] ?? []; return <article className="fixtureCard card" id={fixture.id} key={fixture.id}><div className="fixtureTime"><strong>{displayTime(fixture.kickoffAt)}</strong><span>{fixture.competition ?? "Match"}</span></div><div className="fixtureTeams"><strong>{fixture.homeTeam.name}</strong><span>VS</span><strong>{fixture.awayTeam.name}</strong><small>{fixture.venue ?? "Venue TBA"}</small></div><button className="watchButton" onClick={() => loadBroadcasts(fixture.id)}>{isOpen ? "Close" : "Where to watch"}</button>{isOpen && <div className="broadcastPanel"><div className="broadcastHeader"><div><div className="eyebrow">{countryName(selectedCountry)}</div><strong>Available broadcasters</strong></div><span className="badge">{stations.length} found</span></div>{stations.length ? stations.map((station) => <a className="station" href={station.stationUrl || "#"} key={`${station.countryCode}-${station.station}`} target="_blank" rel="noreferrer"><span>{station.station}</span><span>↗</span></a>) : <div className="muted">No broadcaster currently available for {countryName(selectedCountry)}. Rights data may not be announced yet.</div>}</div>}</article>; })}</div>)}</section>
  </main>;
}
