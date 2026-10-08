import { NextResponse } from "next/server";
import { encerrarSessao } from "@/lib/portal/auth";

export async function POST() {
  encerrarSessao();
  return NextResponse.json({ ok: true });
}
