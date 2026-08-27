import { NextResponse } from "next/server";
import { getTvDetails } from "@/lib/tmdb";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const details = await getTvDetails(Number(id));
  return NextResponse.json(details);
}
