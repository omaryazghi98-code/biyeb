const tracked = [
  { name: "Lamine Yamal", club: "Barcelona", tag: "One to Watch" },
  { name: "João Neves", club: "PSG", tag: "Priority" },
  { name: "Warren Zaïre-Emery", club: "PSG", tag: "Wonderkid" },
];

const fixtures = [
  { date: "SAT 12 SEP", time: "17:30", match: "Barcelona vs Real Sociedad", players: 1, competition: "La Liga" },
  { date: "SUN 13 SEP", time: "20:00", match: "PSG vs Marseille", players: 2, competition: "Ligue 1" },
  { date: "WED 16 SEP", time: "20:00", match: "PSG vs Arsenal", players: 2, competition: "UEFA Champions League" },
];

export default function Home() {
  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <div className="eyebrow">Scoutboard / Dashboard</div>
          <h1>Watch the players, not the fixtures.</h1>
          <p className="subtitle">Your personal scouting calendar. Add a player once and Scoutboard keeps the matches worth watching in front of you.</p>
        </div>
        <a className="badge" href="/watchlist">Add players</a>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Upcoming tracked matches</h2>
          {fixtures.map((fixture) => (
            <div className="fixture" key={`${fixture.date}-${fixture.match}`}>
              <div><div className="time">{fixture.date}</div><strong>{fixture.time}</strong></div>
              <div><div className="match">{fixture.match}</div><div className="meta">{fixture.competition} · {fixture.players} tracked player{fixture.players > 1 ? "s" : ""}</div></div>
              <span className="badge">Watch</span>
            </div>
          ))}
        </div>

        <aside className="card">
          <h2>My watchlist</h2>
          <div className="players">
            {tracked.map((player) => (
              <div className="player" key={player.name}>
                <div><strong>{player.name}</strong><span>{player.club} · {player.tag}</span></div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
