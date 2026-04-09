import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getSessionUser } from "@/lib/auth";
import { preflight, withCors } from "@/lib/cors";
import { createPrismaClient } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export async function OPTIONS(req) {
  return preflight(req, ["POST", "OPTIONS"]);
}

export async function POST(req) {
  const sessionUser = await getSessionUser();
  const prisma = createPrismaClient();

  if (sessionUser?.userId) {
    await logAuditEvent(prisma, {
      action: "LOGOUT",
      resourceType: "auth",
      resourceId: Number(sessionUser.userId),
      userId: Number(sessionUser.userId),
      summary: `User ${sessionUser.email || sessionUser.userId} logged out`,
    });
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 0,
  });

  return withCors(req, response, ["POST", "OPTIONS"]);
}
