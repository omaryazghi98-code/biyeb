import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const entry = await prisma.watchlistEntry.findUnique({
    where: { playerId: params.id },
    include: { player: { include: { currentTeam: true, tags: { include: { tag: true } }, reports: { include: { fixture: { include: { homeTeam: true, awayTeam: true } } }, orderBy: { createdAt: "desc" } } } } },
  });
  if (!entry) notFound();
  const { player } = entry;

  return (
    <main className="dashboard">
      <a className="backLink" href="/watchlist">← Back to watchlist</a>
      <header className="playerHero card">
        <div className="avatarWrap">{player.photoUrl ? <img src={player.photoUrl} alt="" className="avatar" /> : <div className="avatar fallback">{player.name.slice(0, 1)}</div>}</div>
        <div className="heroCopy">
          <div className="eyebrow">Scouting workspace</div>
          <h1>{player.name}</h1>
          <p className="subtitle">{player.position ?? "Position unknown"} · {player.currentTeam?.name ?? "No current club"} {player.nationality ? `· ${player.nationality}` : ""}</p>
          <div className="tagRow">
            {player.tags.map(({ tag }) => <span className="badge" key={tag.id}>{tag.name}</span>)}
            <span className="badge activeBadge">{entry.status}</span>
          </div>
        </div>
      </header>

      <section className="detailGrid">
        <div className="card">
          <div className="sectionHeader"><div><div className="eyebrow">New report</div><h2>Scout the next match</h2></div></div>
          <form className="reportForm" action={`/api/players/${player.id}/reports`} method="post">
            <label>Match / fixture ID<input name="fixtureId" placeholder="Optional fixture ID" /></label>
            <label>Rating (1–10)<input name="rating" type="number" min="1" max="10" /></label>
            <label>Verdict<select name="verdict"><option value="">Select…</option><option>Sign</option><option>Monitor</option><option>Not Ready</option><option>No Interest</option></select></label>
            <label>Notes<textarea name="notes" rows={9} placeholder="What did you notice? First touch, scanning, decision-making, movement, duels…" required /></label>
            <button className="primaryButton" type="submit">Save report</button>
          </form>
        </div>

        <aside className="card">
          <div className="eyebrow">Scouting history</div>
          <h2>{player.reports.length} report{player.reports.length === 1 ? "" : "s"}</h2>
          <div className="reportList">
            {player.reports.length === 0 ? <p className="muted">Nothing logged yet. Your first viewing goes here.</p> : player.reports.map((report) => (
              <article className="report" key={report.id}>
                <div className="reportTop"><strong>{report.rating ? `${report.rating}/10` : "Unrated"}</strong><span>{report.verdict ?? "No verdict"}</span></div>
                {report.fixture && <div className="meta">{report.fixture.homeTeam.name} vs {report.fixture.awayTeam.name}</div>}
                <p>{report.notes}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
