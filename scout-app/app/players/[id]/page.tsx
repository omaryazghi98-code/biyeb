import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const entry = await prisma.watchlistEntry.findUnique({
    where: { playerId: params.id },
    include: { player: { include: { currentTeam: true, tags: { include: { tag: true } }, reports: { include: { fixture: { include: { homeTeam: true, awayTeam: true } } }, orderBy: { createdAt: "desc" } } } } },
  });
  if (!entry) notFound();
  const { player } = entry;

  const nextFixtures = player.currentTeamId ? await prisma.fixture.findMany({
    where: { kickoffAt: { gte: new Date() }, OR: [{ homeTeamId: player.currentTeamId }, { awayTeamId: player.currentTeamId }] },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoffAt: "asc" },
    take: 5,
  }) : [];

  const averageRating = player.reports.length
    ? (player.reports.reduce((sum, report) => sum + (report.rating ?? 0), 0) / player.reports.filter((report) => report.rating).length || 0).toFixed(1)
    : "—";

  return <main className="dashboard">
    <a className="backLink" href="/watchlist">← Back to player board</a>

    <header className="playerHero card">
      <div className="avatarWrap">{player.photoUrl ? <img src={player.photoUrl} alt="" className="avatar" /> : <div className="avatar fallback">{player.name.slice(0, 1)}</div>}</div>
      <div className="heroCopy"><div className="eyebrow">Scouting workspace</div><h1>{player.name}</h1><p className="subtitle">{player.position ?? "Position unknown"} · {player.currentTeam?.name ?? "No current club"}{player.nationality ? ` · ${player.nationality}` : ""}</p><div className="tagRow">{player.tags.map(({ tag }) => <span className="badge" key={tag.id}>{tag.name}</span>)}<span className="badge activeBadge">{entry.status}</span></div></div>
      <div className="heroAside"><div className="bigScore">{averageRating}</div><small>avg. report rating</small></div>
    </header>

    <section className="profileGrid">
      <div className="card">
        <div className="cardTitleRow"><div><div className="eyebrow">Next viewings</div><h2>Fixtures to watch</h2></div><a className="badge" href="/calendar">Full calendar →</a></div>
        {nextFixtures.length === 0 ? <div className="empty">No upcoming club fixtures found yet.</div> : <div className="miniFixtures">{nextFixtures.map((fixture) => <div className="miniFixture" key={fixture.id}><div><small>{new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(fixture.kickoffAt))}</small><strong>{new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(fixture.kickoffAt))}</strong></div><div><strong>{fixture.homeTeam.name} <span>vs</span> {fixture.awayTeam.name}</strong><small>{fixture.competition ?? "Match"}</small></div><a className="badge" href={`/calendar#${fixture.id}`}>View</a></div>)}</div>}
      </div>

      <aside className="card">
        <div className="cardTitleRow"><div><div className="eyebrow">Scout memory</div><h2>Reports</h2></div><span className="badge">{player.reports.length} total</span></div>
        <div className="memoryStat"><strong>{averageRating}</strong><span>average rating</span></div><div className="memoryStat"><strong>{player.reports.filter((r) => r.verdict === "Sign").length}</strong><span>positive sign verdicts</span></div><div className="memoryStat"><strong>{player.reports.filter((r) => r.verdict === "Monitor").length}</strong><span>monitor verdicts</span></div>
      </aside>
    </section>

    <section className="detailGrid">
      <div className="card">
        <div className="sectionHeader"><div><div className="eyebrow">New report</div><h2>Log what you saw</h2></div><span className="meta">Your opinion · not an algorithm</span></div>
        <form className="reportForm" action={`/api/players/${player.id}/reports`} method="post">
          <label>Match<input name="fixtureId" list="fixture-list" placeholder="Pick a recent/upcoming fixture ID" /><datalist id="fixture-list">{nextFixtures.map((fixture) => <option key={fixture.id} value={fixture.id}>{fixture.homeTeam.name} vs {fixture.awayTeam.name}</option>)}</datalist></label>
          <div className="formSplit"><label>Rating (1–10)<input name="rating" type="number" min="1" max="10" /></label><label>Verdict<select name="verdict"><option value="">Select…</option><option>Sign</option><option>Monitor</option><option>Not Ready</option><option>No Interest</option></select></label></div>
          <label>Notes<textarea name="notes" rows={9} placeholder="First touch, scanning, decision-making, movement, duels, response after mistakes…" required /></label>
          <button className="primaryButton" type="submit">Save scouting report</button>
        </form>
      </div>

      <aside className="card"><div className="eyebrow">Scouting history</div><h2>{player.reports.length} report{player.reports.length === 1 ? "" : "s"}</h2><div className="reportList">{player.reports.length === 0 ? <p className="muted">Nothing logged yet. Your first viewing goes here.</p> : player.reports.map((report) => <article className="report" key={report.id}><div className="reportTop"><strong>{report.rating ? `${report.rating}/10` : "Unrated"}</strong><span>{report.verdict ?? "No verdict"}</span></div>{report.fixture && <div className="meta">{report.fixture.homeTeam.name} vs {report.fixture.awayTeam.name}</div>}<p>{report.notes}</p></article>)}</div></aside>
    </section>
  </main>;
}
