import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const fixture = await prisma.fixture.findUnique({ where: { id: params.id } });
  if (!fixture) return NextResponse.json({ error: "Fixture not found" }, { status: 404 });
  const entries = await prisma.watchlistEntry.findMany({
    where: { player: { currentTeamId: { in: [fixture.homeTeamId, fixture.awayTeamId] } } },
    include: { player: true },
    orderBy: { priority: "desc" },
  });
  return NextResponse.json({ players: entries.map((entry) => ({ id: entry.player.id, name: entry.player.name, status: entry.status })) });
}
