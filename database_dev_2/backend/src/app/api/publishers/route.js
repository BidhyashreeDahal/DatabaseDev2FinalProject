// C:\Users\bidhy\DatabaseDev2FinalProject\database_dev_2\backend\app\api\publishers\route.js

import { NextResponse } from "next/server";
import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";

const prisma = createPrismaClient();

export async function OPTIONS(req) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}

export async function GET(req) {
  try {
    const rows = await prisma.publisher.findMany({
      orderBy: { name: "asc" },
    });

    const publishers = rows.map((p) => ({
      id: p.publisher_id,
      name: p.name,
    }));

    return withCors(req, NextResponse.json({ publishers }));
  } catch (err) {
    console.error("[GET /api/publishers]", err);
    return withCors(req, NextResponse.json({ error: err.message }, { status: 500 }));
  }
}

export async function POST(req) {
  try {
    const { name } = await req.json();

    if (!name?.trim()) {
      return withCors(req, NextResponse.json({ error: "Name is required" }, { status: 400 }));
    }

    const created = await prisma.publisher.create({
      data: { name: name.trim() },
    });

    return withCors(req, NextResponse.json({
      publisher: { id: created.publisher_id, name: created.name },
    }));
  } catch (err) {
    console.error("[POST /api/publishers]", err);
    return withCors(req, NextResponse.json({ error: err.message }, { status: 500 }));
  }
}