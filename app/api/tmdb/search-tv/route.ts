import { NextResponse } from "next/server";
import { searchTv } from "@/lib/tmdb";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ results: [] });

  const results = await searchTv(query);
  return NextResponse.json({ results: results.slice(0, 8) });
}
