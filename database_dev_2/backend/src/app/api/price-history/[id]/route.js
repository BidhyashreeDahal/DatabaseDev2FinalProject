import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

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
    return withCors(request, Response.json({ success: false, error: "Invalid price history id" }, { status: 400 }));
  }

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_PRICING")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const priceHistory = await prisma.price_history.findUnique({
      where: { price_history_id: id },
      include: {
        item: {
          select: { title: true },
        },
      },
    });
    if (!priceHistory) {
      return withCors(request, Response.json({ success: false, error: "Price history not found" }, { status: 404 }));
    }

    return withCors(
      request,
      Response.json(
        {
          success: true,
          priceHistory: {
            priceHistoryId: priceHistory.price_history_id,
            itemId: priceHistory.item_id,
            title: priceHistory.item?.title || "Unknown Item",
            marketValue: Number(priceHistory.market_value),
            recordedDate: priceHistory.recorded_date,
            source: priceHistory.source,
          },
        },
        { status: 200 }
      )
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load price history" }, { status: 500 })
    );
  }
}

export async function PUT(request, { params }) {
  const prisma = createPrismaClient();
  const id = parseId(await params);
  if (!id) {
    return withCors(request, Response.json({ success: false, error: "Invalid price history id" }, { status: 400 }));
  }

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "UPDATE_PRICING")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const payload = await request.json();
    const marketValue = payload?.marketValue !== undefined ? Number(payload.marketValue) : undefined;
    const source = payload?.source !== undefined ? String(payload.source || "").trim() : undefined;
    const recordedDate = payload?.recordedDate !== undefined ? new Date(payload.recordedDate) : undefined;

    if (marketValue !== undefined && (!Number.isFinite(marketValue) || marketValue <= 0)) {
      return withCors(request, Response.json({ success: false, error: "marketValue must be a positive number" }, { status: 400 }));
    }
    if (source !== undefined && !source) {
      return withCors(request, Response.json({ success: false, error: "source is required" }, { status: 400 }));
    }
    if (recordedDate !== undefined && Number.isNaN(recordedDate.getTime())) {
      return withCors(request, Response.json({ success: false, error: "recordedDate is invalid" }, { status: 400 }));
    }

    const updateData = {};
    if (marketValue !== undefined) updateData.market_value = marketValue;
    if (source !== undefined) updateData.source = source;
    if (recordedDate !== undefined) updateData.recorded_date = recordedDate;

    if (Object.keys(updateData).length === 0) {
      return withCors(request, Response.json({ success: false, error: "No valid fields to update" }, { status: 400 }));
    }

    const updated = await prisma.price_history.update({
      where: { price_history_id: id },
      data: updateData,
      include: {
        item: {
          select: { title: true },
        },
      },
    });

    await logAuditEvent(prisma, {
      action: "UPDATE_PRICE_HISTORY",
      resourceType: "price_history",
      resourceId: updated.price_history_id,
      userId: Number(sessionUser.userId),
      summary: `Updated market value history for item #${updated.item_id}`,
    });

    return withCors(
      request,
      Response.json(
        {
          success: true,
          priceHistory: {
            priceHistoryId: updated.price_history_id,
            itemId: updated.item_id,
            title: updated.item?.title || "Unknown Item",
            marketValue: Number(updated.market_value),
            recordedDate: updated.recorded_date,
            source: updated.source,
          },
        },
        { status: 200 }
      )
    );
  } catch (error) {
    if (error?.code === "P2025") {
      return withCors(request, Response.json({ success: false, error: "Price history not found" }, { status: 404 }));
    }

    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to update price history" }, { status: 500 })
    );
  }
}

export async function DELETE(request, { params }) {
  const prisma = createPrismaClient();
  const id = parseId(await params);
  if (!id) {
    return withCors(request, Response.json({ success: false, error: "Invalid price history id" }, { status: 400 }));
  }

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "UPDATE_PRICING")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const existing = await prisma.price_history.findUnique({
      where: { price_history_id: id },
      select: { price_history_id: true, item_id: true, market_value: true },
    });
    if (!existing) {
      return withCors(request, Response.json({ success: false, error: "Price history not found" }, { status: 404 }));
    }

    await prisma.price_history.delete({ where: { price_history_id: id } });
    await logAuditEvent(prisma, {
      action: "DELETE_PRICE_HISTORY",
      resourceType: "price_history",
      resourceId: id,
      userId: Number(sessionUser.userId),
      summary: `Deleted price history for item #${existing.item_id} (value ${Number(existing.market_value)})`,
    });
    return withCors(request, Response.json({ success: true, message: "Price history deleted successfully" }, { status: 200 }));
  } catch (error) {
    if (error?.code === "P2025") {
      return withCors(request, Response.json({ success: false, error: "Price history not found" }, { status: 404 }));
    }

    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to delete price history" }, { status: 500 })
    );
  }
}