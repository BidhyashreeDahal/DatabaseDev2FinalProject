import { NextResponse } from "next/server";
import { loginUser } from "@/services/authService";
import { AUTH_COOKIE_NAME, signAuthToken } from "@/lib/auth";
import { preflight, withCors } from "@/lib/cors";

export async function OPTIONS(req) {
  return preflight(req, ["POST", "OPTIONS"]);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const email = String(body?.email || "").trim();
    const password = String(body?.password || "");

    if (!email || !password) {
      return withCors(
        req,
        NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 }),
        ["POST", "OPTIONS"]
      );
    }

    const user = await loginUser(email, password);

    const token = signAuthToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const response = NextResponse.json({ success: true, user }, { status: 200 });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      // Frontend and backend are on different domains (Vercel/Render),
      // so cross-site cookie settings are required for auth to persist.
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return withCors(req, response, ["POST", "OPTIONS"]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    const status = message === "Invalid email or password" ? 401 : 500;
    return withCors(req, NextResponse.json({ success: false, error: message }, { status }), ["POST", "OPTIONS"]);
  }
}
