import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const reports = await prisma.scoutingReport.findMany({
    where: { playerId: params.id },
    include: { fixture: { include: { homeTeam: true, awayTeam: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ reports });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")
    ? Object.fromEntries((await request.formData()).entries())
    : await request.json();

  if (typeof body.notes !== "string" || body.notes.trim().length < 1) {
    return NextResponse.json({ error: "Notes are required" }, { status: 400 });
  }

  const rating = body.rating === "" || body.rating == null ? null : Number(body.rating);
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 10)) {
    return NextResponse.json({ error: "Rating must be an integer from 1 to 10" }, { status: 400 });
  }

  const report = await prisma.scoutingReport.create({
    data: {
      playerId: params.id,
      fixtureId: typeof body.fixtureId === "string" && body.fixtureId ? body.fixtureId : null,
      rating,
      verdict: typeof body.verdict === "string" && body.verdict ? body.verdict : null,
      notes: body.notes.trim(),
    },
  });
  return NextResponse.json({ report }, { status: 201 });
}
