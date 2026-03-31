import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";

function parseId(params) {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function OPTIONS(req) {
  return preflight(req, ["GET", "PUT", "DELETE", "OPTIONS"]);
}

export async function GET(request, { params }) {
  const prisma = createPrismaClient();
  const id = parseId(await params);
  if (!id) {
    return withCors(request, Response.json({ success: false, error: "Invalid item id" }, { status: 400 }));
  }

  try {
    const item = await prisma.item.findUnique({ where: { item_id: id } });
    if (!item) {
      return withCors(request, Response.json({ success: false, error: "Item not found" }, { status: 404 }));
    }
    return withCors(request, Response.json({ success: true, item }, { status: 200 }));
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load item" }, { status: 500 })
    );
  }
}

export async function PUT(request, { params }) {
  const prisma = createPrismaClient();
  const id = parseId(await params);
  if (!id) {
    return withCors(request, Response.json({ success: false, error: "Invalid item id" }, { status: 400 }));
  }

  try {
    const payload = await request.json();
    const updated = await prisma.item.update({
      where: { item_id: id },
      data: payload,
    });
    return withCors(request, Response.json({ success: true, item: updated }, { status: 200 }));
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to update item" }, { status: 500 })
    );
  }
}

export async function DELETE(request, { params }) {
  const prisma = createPrismaClient();
  const id = parseId(await params);
  if (!id) {
    return withCors(request, Response.json({ success: false, error: "Invalid item id" }, { status: 400 }));
  }

  try {
    await prisma.item.delete({ where: { item_id: id } });
    return withCors(request, Response.json({ success: true, message: "Item deleted successfully" }, { status: 200 }));
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to delete item" }, { status: 500 })
    );
  }
}