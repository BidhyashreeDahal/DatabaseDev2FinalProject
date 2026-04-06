import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

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
    const item = await prisma.item.findUnique({
      where: { item_id: id },
      include: {
        book: {
          include: {
            author: { select: { name: true } },
            publisher: { select: { name: true } },
          },
        },
        map: {
          include: {
            cartographer: { select: { name: true } },
            publisher: { select: { name: true } },
          },
        },
        periodical: {
          include: {
            publisher: { select: { name: true } },
          },
        },
        provenance: {
          orderBy: { start_date: "desc" },
          take: 5,
        },
        price_history: {
          orderBy: { recorded_date: "desc" },
          take: 10,
        },
        sales: {
          select: { sales_id: true },
          take: 1,
        },
      },
    });
    if (!item) {
      return withCors(request, Response.json({ success: false, error: "Item not found" }, { status: 404 }));
    }
    const category = item.book ? "Book" : item.map ? "Map" : item.periodical ? "Magazine" : "Other";
    const status = item.sales.length > 0 ? "Sold" : "In Stock";
    return withCors(request, Response.json({ success: true, item: { ...item, category, status } }, { status: 200 }));
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
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "UPDATE_ITEM")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const payload = await request.json();
    const { priceHistorySource, priceRecordedDate, ...updateData } = payload ?? {};

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.item.findUnique({
        where: { item_id: id },
        select: { item_id: true, selling_price: true },
      });
      if (!existing) {
        throw new Error("Item not found");
      }

      const updatedItem = await tx.item.update({
        where: { item_id: id },
        data: updateData,
      });

      const currentPrice = Number(existing.selling_price);
      const nextPrice = Number(updatedItem.selling_price);
      if (Number.isFinite(nextPrice) && nextPrice > 0 && nextPrice !== currentPrice) {
        const historySource =
          typeof priceHistorySource === "string" && priceHistorySource.trim()
            ? priceHistorySource.trim()
            : "Price updated from item edit";
        const recordedDate = priceRecordedDate ? new Date(priceRecordedDate) : new Date();

        await tx.price_history.create({
          data: {
            item_id: id,
            market_value: nextPrice,
            recorded_date: Number.isNaN(recordedDate.getTime()) ? new Date() : recordedDate,
            source: historySource,
          },
        });
      }

      return updatedItem;
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
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "DELETE_ITEM")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    await prisma.$transaction(async (tx) => {
      // Remove child rows first to satisfy FK constraints before deleting item.
      await tx.sales.deleteMany({ where: { item_id: id } });
      await tx.acquisition.deleteMany({ where: { item_id: id } });
      await tx.price_history.deleteMany({ where: { item_id: id } });
      await tx.provenance.deleteMany({ where: { item_id: id } });
      await tx.book.deleteMany({ where: { item_id: id } });
      await tx.map.deleteMany({ where: { item_id: id } });
      await tx.periodical.deleteMany({ where: { item_id: id } });
      await tx.item.delete({ where: { item_id: id } });
    });
    return withCors(request, Response.json({ success: true, message: "Item deleted successfully" }, { status: 200 }));
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to delete item" }, { status: 500 })
    );
  }
}