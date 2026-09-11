import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.watchlistEntry.findMany({
    include: { player: { include: { currentTeam: true, tags: { include: { tag: true } } } } },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ entries });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const player = body.player;
  if (!player?.id || !player?.name) return NextResponse.json({ error: "Invalid player" }, { status: 400 });

  const teamStat = player.statistics?.find((s: { team?: { id: number; name: string; logo: string } }) => s.team);
  const team = teamStat?.team
    ? await prisma.team.upsert({
        where: { externalId: teamStat.team.id },
        update: { name: teamStat.team.name, logoUrl: teamStat.team.logo },
        create: { externalId: teamStat.team.id, name: teamStat.team.name, logoUrl: teamStat.team.logo },
      })
    : null;

  const savedPlayer = await prisma.player.upsert({
    where: { externalId: player.id },
    update: {
      name: player.name,
      firstName: player.firstname,
      lastName: player.lastname,
      nationality: player.nationality,
      position: teamStat?.games?.position,
      photoUrl: player.photo,
      currentTeamId: team?.id,
    },
    create: {
      externalId: player.id,
      name: player.name,
      firstName: player.firstname,
      lastName: player.lastname,
      nationality: player.nationality,
      position: teamStat?.games?.position,
      photoUrl: player.photo,
      currentTeamId: team?.id,
    },
  });

  const entry = await prisma.watchlistEntry.upsert({
    where: { playerId: savedPlayer.id },
    update: {},
    create: { playerId: savedPlayer.id },
    include: { player: { include: { currentTeam: true } } },
  });

  return NextResponse.json({ entry });
}