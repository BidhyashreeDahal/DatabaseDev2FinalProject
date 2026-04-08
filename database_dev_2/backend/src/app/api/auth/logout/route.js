import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { preflight, withCors } from "@/lib/cors";

export async function OPTIONS(req) {
  return preflight(req, ["POST", "OPTIONS"]);
}

export async function POST(req) {
  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true, message: "Logged out successfully" }, { status: 200 });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 0,
  });

  return withCors(req, response, ["POST", "OPTIONS"]);
}
