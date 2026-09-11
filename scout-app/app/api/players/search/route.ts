import { NextRequest, NextResponse } from "next/server";
import { searchPlayers } from "@/lib/api-football";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ players: [] });

  try {
    const result = await searchPlayers(q);
    return NextResponse.json({ players: result.response });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Player search failed" }, { status: 502 });
  }
}
