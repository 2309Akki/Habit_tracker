import crypto from "crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "ht_session";
const SESSION_DAYS = 30;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV !== "production") return "dev_session_secret_change_me";
  throw new Error("Missing SESSION_SECRET env var");
}

export function hashSessionToken(token: string) {
  const secret = getSessionSecret();
  return crypto.createHmac("sha256", secret).update(token).digest("hex");
}

export function newSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  };
}

export async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const session = await prisma.session.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  return session?.user ?? null;
}

export async function deleteSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return;

  const tokenHash = hashSessionToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export const sessionCookieName = SESSION_COOKIE;
export const sessionDays = SESSION_DAYS;
