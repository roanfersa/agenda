import { NextResponse } from "next/server";
import { getAdminBootstrap } from "@/lib/data/admin-bootstrap";

/** Dados globais do painel admin (somente equipe interna). */
export async function GET() {
  const data = await getAdminBootstrap();
  if (!data) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(data);
}
