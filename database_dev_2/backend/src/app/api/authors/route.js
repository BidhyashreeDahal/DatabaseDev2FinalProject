// C:\Users\bidhy\DatabaseDev2FinalProject\database_dev_2\backend\app\api\authors\route.js

import { NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

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

    const rows = await prisma.author.findMany({
      orderBy: { name: "asc" },
    });

    const authors = rows.map((a) => ({
      id: a.author_id,
      name: a.name,
    }));

    return withCors(req, NextResponse.json({ authors }));
  } catch (err) {
    console.error("[GET /api/authors]", err);
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

    const created = await prisma.author.create({
      data: { name: name.trim() },
    });

    await logAuditEvent(prisma, {
      action: "CREATE_AUTHOR",
      resourceType: "author",
      resourceId: created.author_id,
      userId: Number(sessionUser.userId),
      summary: `Created author "${created.name}"`,
    });

    return withCors(req, NextResponse.json({
      author: { id: created.author_id, name: created.name },
    }));
  } catch (err) {
    console.error("[POST /api/authors]", err);
    return withCors(req, NextResponse.json({ error: err.message }, { status: 500 }));
  }
}