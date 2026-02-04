import { NextRequest, NextResponse } from "next/server";
import { deleteSessionFromRequest, sessionCookieName } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await deleteSessionFromRequest(req);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
