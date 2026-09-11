import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { playerId: string } }) {
  const body = await request.json();
  const status = typeof body.status === "string" ? body.status : undefined;
  const priority = body.priority == null ? undefined : Number(body.priority);

  if (priority !== undefined && (!Number.isInteger(priority) || priority < 0 || priority > 3)) {
    return NextResponse.json({ error: "Priority must be 0–3" }, { status: 400 });
  }
  if (status && !["WATCHING", "PRIORITY", "ONE_TO_WATCH", "WONDERKID", "WATCHED", "DROPPED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const entry = await prisma.watchlistEntry.update({
    where: { playerId: params.playerId },
    data: { ...(status !== undefined ? { status } : {}), ...(priority !== undefined ? { priority } : {}) },
    include: { player: { include: { currentTeam: true } } },
  });

  return NextResponse.json({ entry });
}
