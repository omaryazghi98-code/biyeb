"use client";

import { useEffect, useMemo, useState } from "react";

type Fixture = {
  id: string;
  kickoffAt: string;
  competition?: string | null;
  venue?: string | null;
  homeTeam: { name: string; logoUrl?: string | null };
  awayTeam: { name: string; logoUrl?: string | null };
};

type Broadcast = { country: string; countryCode: string; station: string; stationUrl?: string | null; logoUrl?: string | null };

const PINNED = [
  ["MA", "Morocco"],
  ["FR", "France"],
  ["US", "USA"],
] as const;

function dateKey(value: string) { return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value)); }
function displayDate(value: string) { return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date(value)); }
function displayTime(value: string) { return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }

export default function CalendarPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("MA");
  const [broadcasts, setBroadcasts] = useState<Record<string, Broadcast[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/watchlist/fixtures").then((r) => r.json()).then((d) => setFixtures(d.fixtures ?? []));
  }, []);

  const days = useMemo(() => {
    const groups = new Map<string, Fixture[]>();
    for (const fixture of fixtures) {
      const key = dateKey(fixture.kickoffAt);
      groups.set(key, [...(groups.get(key) ?? []), fixture]);
    }
    return [...groups.entries()];
  }, [fixtures]);

  async function loadBroadcasts(fixtureId: string, country = selectedCountry) {
    setExpanded(fixtureId);
    const response = await fetch(`/api/fixtures/${fixtureId}/broadcasts?country=${country}`);
    const data = await response.json();
    setBroadcasts((current) => ({ ...current, [fixtureId]: data.broadcasts ?? [] }));
  }

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <div className="eyebrow">Scoutboard / Calendar</div>
          <h1>Your scouting week.</h1>
          <p className="subtitle">Only fixtures involving players you are watching. Open a match to see where it can be watched and jump into scouting notes.</p>
        </div>
        <div className="navLinks"><a className="badge" href="/">Dashboard</a><a className="badge" href="/watchlist">Watchlist</a></div>
      </header>

      <section className="countryBar card">
        <div><div className="eyebrow">Where to watch</div><strong>Your broadcast country</strong></div>
        <div className="countryControls">
          {PINNED.map(([code, name]) => <button key={code} className={selectedCountry === code ? "countryButton selected" : "countryButton"} onClick={() => setSelectedCountry(code)}>{name}</button>)}
          <label className="countrySelect"><span>More</span><select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}><option value="MA">Morocco</option><option value="FR">France</option><option value="US">USA</option><option value="GB">United Kingdom</option><option value="ES">Spain</option><option value="DE">Germany</option><option value="IT">Italy</option><option value="PT">Portugal</option><option value="NL">Netherlands</option><option value="BE">Belgium</option><option value="TR">Türkiye</option><option value="SA">Saudi Arabia</option><option value="AE">UAE</option><option value="CA">Canada</option><option value="AU">Australia</option></select></label>
        </div>
      </section>

      <section className="calendar">
        {days.length === 0 ? <div className="card empty">No tracked fixtures yet. Add a player to start building your calendar.</div> : days.map(([day, matches]) => (
          <div className="day" key={day}>
            <div className="dayTitle">{displayDate(matches[0].kickoffAt)}</div>
            {matches.map((fixture) => {
              const isOpen = expanded === fixture.id;
              const stations = broadcasts[fixture.id] ?? [];
              return <article className="fixtureCard card" key={fixture.id}>
                <div className="fixtureTime"><strong>{displayTime(fixture.kickoffAt)}</strong><span>{fixture.competition ?? "Match"}</span></div>
                <div className="fixtureTeams"><strong>{fixture.homeTeam.name}</strong><span>vs</span><strong>{fixture.awayTeam.name}</strong><small>{fixture.venue ?? "Venue TBA"}</small></div>
                <button className="watchButton" onClick={() => loadBroadcasts(fixture.id)}>{isOpen ? "Hide" : "Where to watch"}</button>
                {isOpen && <div className="broadcastPanel">
                  <div className="eyebrow">{selectedCountry === "MA" ? "Morocco" : selectedCountry === "FR" ? "France" : selectedCountry === "US" ? "USA" : "Selected country"}</div>
                  {stations.length ? stations.map((station) => <a className="station" href={station.stationUrl || "#"} key={`${station.countryCode}-${station.station}`} target="_blank" rel="noreferrer"><span>{station.station}</span><span>↗</span></a>) : <div className="muted">No broadcaster currently available for this country. Broadcast data is provider-dependent and may not be announced yet.</div>}
                </div>}
              </article>;
            })}
          </div>
        ))}
      </section>
    </main>
  );
}
