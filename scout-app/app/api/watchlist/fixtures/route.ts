import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTeamFixtures } from "@/lib/api-football";

export async function GET() {
  const entries = await prisma.watchlistEntry.findMany({ include: { player: { include: { currentTeam: true } } } });
  const teams = entries.map((entry) => entry.player.currentTeam).filter((team): team is NonNullable<typeof team> => Boolean(team));
  const uniqueTeams = [...new Map(teams.map((team) => [team.externalId, team])).values()];

  for (const team of uniqueTeams) {
    const result = await getTeamFixtures(team.externalId);
    for (const fixture of result.response) {
      for (const side of [fixture.teams.home, fixture.teams.away]) {
        await prisma.team.upsert({
          where: { externalId: side.id },
          update: { name: side.name, logoUrl: side.logo },
          create: { externalId: side.id, name: side.name, logoUrl: side.logo },
        });
      }
      const home = await prisma.team.findUniqueOrThrow({ where: { externalId: fixture.teams.home.id } });
      const away = await prisma.team.findUniqueOrThrow({ where: { externalId: fixture.teams.away.id } });
      await prisma.fixture.upsert({
        where: { externalId: fixture.fixture.id },
        update: { homeTeamId: home.id, awayTeamId: away.id, competition: fixture.league?.name, kickoffAt: new Date(fixture.fixture.date), venue: fixture.fixture.venue?.name, status: fixture.fixture.status?.short },
        create: { externalId: fixture.fixture.id, homeTeamId: home.id, awayTeamId: away.id, competition: fixture.league?.name, kickoffAt: new Date(fixture.fixture.date), venue: fixture.fixture.venue?.name, status: fixture.fixture.status?.short },
      });
    }
  }

  const fixtures = await prisma.fixture.findMany({
    where: {
      kickoffAt: { gte: new Date() },
      OR: [
        { homeTeam: { players: { some: { watchlist: { isNot: null } } } } },
        { awayTeam: { players: { some: { watchlist: { isNot: null } } } } },
      ],
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoffAt: "asc" },
    take: 50,
  });
  return NextResponse.json({ fixtures });
}