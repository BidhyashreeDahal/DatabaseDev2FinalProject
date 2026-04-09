import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

export async function OPTIONS(req) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}

export async function GET(request) {
  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }
    if (!hasPermission(sessionUser.role, "READ_PRICING")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const pageParam = Number(searchParams.get("page")) || 1;
    const limitParam = Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), 100);
    const page = pageParam < 1 ? 1 : pageParam;
    const take = limitParam;
    const skip = (page - 1) * take;

    const where = search
      ? { OR: [{ item: { title: { contains: search, mode: "insensitive" } } }] }
      : undefined;

    const [total, priceHistory] = await Promise.all([
      prisma.price_history.count({ where }),
      prisma.price_history.findMany({
        where,
        include: { item: { select: { title: true } } },
        orderBy: { price_history_id: "desc" },
        skip,
        take,
      }),
    ]);

    const formatted = priceHistory.map((ph) => ({
      priceHistoryId: ph.price_history_id,
      itemId: ph.item_id,
      title: ph?.item?.title || "Unknown Item",
      marketValue: Number(ph.market_value),
      recordedDate: ph.recorded_date ? new Date(ph.recorded_date).toISOString() : null,
      source: ph.source,
    }));

    return withCors(
      request,
      Response.json({ success: true, items: formatted, page, limit: take, total }, { status: 200 }),
      [
      "GET",
      "POST",
      "OPTIONS",
      ]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load items" }, { status: 500 }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}

export async function POST(request) {
  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }
    if (!hasPermission(sessionUser.role, "UPDATE_PRICING")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }

    const body = await request.json();
    const itemId = Number(body?.itemId);
    const marketValue = Number(body?.marketValue);
    const source = typeof body?.source === "string" ? body.source.trim() : "";
    const recordedDate = body?.recordedDate ? new Date(body.recordedDate) : new Date();

    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw new Error("Valid itemId is required");
    }
    if (!Number.isFinite(marketValue) || marketValue <= 0) {
      throw new Error("marketValue must be a positive number");
    }
    if (!source) {
      throw new Error("source is required");
    }
    if (Number.isNaN(recordedDate.getTime())) {
      throw new Error("recordedDate is invalid");
    }

    const item = await prisma.item.findUnique({
      where: { item_id: itemId },
      select: { item_id: true },
    });
    if (!item) {
      return withCors(request, Response.json({ success: false, error: "Item not found" }, { status: 404 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }

    const created = await prisma.price_history.create({
      data: {
        item_id: itemId,
        market_value: marketValue,
        recorded_date: recordedDate,
        source,
      },
    });

    await logAuditEvent(prisma, {
      action: "CREATE_PRICE_HISTORY",
      resourceType: "price_history",
      resourceId: created.price_history_id,
      userId: Number(sessionUser.userId),
      summary: `Recorded market value ${Number(created.market_value)} for item #${created.item_id}`,
    });

    return withCors(
      request,
      Response.json(
        {
          success: true,
          priceHistory: {
            priceHistoryId: created.price_history_id,
            itemId: created.item_id,
            marketValue: Number(created.market_value),
            recordedDate: created.recorded_date,
            source: created.source,
          },
        },
        { status: 201 }
      ),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    const message = error?.message || "Failed to create price history";
    const status = /required|invalid|must/i.test(message) ? 400 : 500;
    return withCors(request, Response.json({ success: false, error: message }, { status }), [
      "GET",
      "POST",
      "OPTIONS",
    ]);
  }
}
