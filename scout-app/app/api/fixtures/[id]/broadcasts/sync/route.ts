import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function dayBounds(date: Date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const token = process.env.SPORTMONKS_TOKEN;
  if (!token) return NextResponse.json({ error: "SPORTMONKS_TOKEN is not configured" }, { status: 503 });

  const fixture = await prisma.fixture.findUnique({ where: { id: params.id }, include: { homeTeam: true, awayTeam: true } });
  if (!fixture) return NextResponse.json({ error: "Fixture not found" }, { status: 404 });

  const { start, end } = dayBounds(fixture.kickoffAt);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = new Date(end.getTime() - 1).toISOString().slice(0, 10);
  const url = `https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}?api_token=${encodeURIComponent(token)}&include=participants;tvStations.country`;
  const response = await fetch(url, { next: { revalidate: 900 } });
  if (!response.ok) return NextResponse.json({ error: `Sportmonks request failed: ${response.status}` }, { status: 502 });

  const data = await response.json() as { data?: Array<{ id: number; starting_at?: string; participants?: Array<{ meta?: { location?: string }; name?: string }>; tvstations?: Array<{ tv_station?: { name?: string; url?: string; image_path?: string }; country?: { name?: string; iso2?: string } }>; tvStations?: Array<{ tv_station?: { name?: string; url?: string; image_path?: string }; country?: { name?: string; iso2?: string } }> }> };
  const candidates = data.data ?? [];
  const targetKickoff = fixture.kickoffAt.getTime();
  const match = candidates.find((item) => {
    const time = item.starting_at ? new Date(item.starting_at).getTime() : 0;
    if (Math.abs(time - targetKickoff) > 6 * 60 * 60 * 1000) return false;
    const names = (item.participants ?? []).map((p) => p.name?.toLowerCase());
    return names.includes(fixture.homeTeam.name.toLowerCase()) && names.includes(fixture.awayTeam.name.toLowerCase());
  });

  if (!match) return NextResponse.json({ broadcasts: [], matchedFixture: false });

  const rows = (match.tvStations ?? match.tvstations ?? []).flatMap((entry) => {
    const countryCode = entry.country?.iso2?.toUpperCase();
    const station = entry.tv_station?.name;
    if (!countryCode || !station || !entry.country?.name) return [];
    return [{ fixtureId: fixture.id, country: entry.country.name, countryCode, station, stationUrl: entry.tv_station?.url, logoUrl: entry.tv_station?.image_path }];
  });

  await prisma.broadcast.deleteMany({ where: { fixtureId: fixture.id } });
  if (rows.length) await prisma.broadcast.createMany({ data: rows, skipDuplicates: true });
  return NextResponse.json({ broadcasts: rows, matchedFixture: true });
}
