import { NextResponse } from "next/server";
import { getBootstrap } from "@/lib/data/bootstrap";

/** Estado inicial do profissional logado (hidrata o store no cliente). */
export async function GET() {
  const data = await getBootstrap();
  if (!data) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  return NextResponse.json(data);
}
