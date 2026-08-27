import { NextResponse } from "next/server";
import { getMovieGenres, getTvGenres } from "@/lib/tmdb";

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get("type") === "tv" ? "tv" : "movie";
  const genres = type === "tv" ? await getTvGenres() : await getMovieGenres();
  return NextResponse.json({ genres });
}
