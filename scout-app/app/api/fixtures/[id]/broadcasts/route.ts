import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PINNED = ["MA", "FR", "US"];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const selected = request.nextUrl.searchParams.get("country")?.toUpperCase();
  const fixture = await prisma.fixture.findUnique({
    where: { id: params.id },
    include: { broadcasts: true, homeTeam: true, awayTeam: true },
  });
  if (!fixture) return NextResponse.json({ error: "Fixture not found" }, { status: 404 });

  const countries = [...new Set(fixture.broadcasts.map((b) => b.countryCode))];
  const preferredCountry = selected || PINNED.find((code) => countries.includes(code)) || countries[0] || null;
  const broadcasts = preferredCountry ? fixture.broadcasts.filter((b) => b.countryCode === preferredCountry) : [];

  return NextResponse.json({
    fixture: { id: fixture.id, home: fixture.homeTeam.name, away: fixture.awayTeam.name },
    pinnedCountries: PINNED,
    countries,
    selectedCountry: preferredCountry,
    broadcasts,
    configured: Boolean(process.env.SPORTMONKS_TOKEN),
  });
}
