// C:\Users\bidhy\DatabaseDev2FinalProject\database_dev_2\backend\app\api\cartographers\route.js

import { NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

const prisma = createPrismaClient();

export async function OPTIONS(req) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}

export async function GET(req) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(req, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_ITEM")) {
      return withCors(req, NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }

    const rows = await prisma.cartographer.findMany({
      orderBy: { name: "asc" },
    });

    const cartographers = rows.map((c) => ({
      id: c.cartographer_id,
      name: c.name,
    }));

    return withCors(req, NextResponse.json({ cartographers }));
  } catch (err) {
    console.error("[GET /api/cartographers]", err);
    return withCors(req, NextResponse.json({ error: err.message }, { status: 500 }));
  }
}

export async function POST(req) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(req, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "CREATE_ITEM")) {
      return withCors(req, NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }

    const { name } = await req.json();

    if (!name?.trim()) {
      return withCors(req, NextResponse.json({ error: "Name is required" }, { status: 400 }));
    }

    const created = await prisma.cartographer.create({
      data: { name: name.trim() },
    });

    return withCors(req, NextResponse.json({
      cartographer: { id: created.cartographer_id, name: created.name },
    }));
  } catch (err) {
    console.error("[POST /api/cartographers]", err);
    return withCors(req, NextResponse.json({ error: err.message }, { status: 500 }));
  }
}