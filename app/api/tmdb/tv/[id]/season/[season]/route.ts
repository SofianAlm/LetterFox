import { NextResponse } from "next/server";
import { getSeasonEpisodes } from "@/lib/tmdb";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; season: string }> },
) {
  const { id, season } = await params;
  const episodes = await getSeasonEpisodes(Number(id), Number(season));
  return NextResponse.json({ episodes });
}
