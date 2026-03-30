import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";

export async function OPTIONS(req) {
  return preflight(req, ["GET", "OPTIONS"]);
}

export async function GET(request) {
  const prisma = createPrismaClient();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const priceHistory = await prisma.price_history.findMany({
      where: search
        ? {
            OR: [
              { item: { title: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
        include: {
          item: {
            select: { title: true },
          },
        },
      orderBy: { item_id: "desc" },
      take: 50,
    });

    const formatted = priceHistory.map((ph) => ({
      priceHistoryId: ph.price_history_id,
      title: ph?.item?.title || "Unknown Item",
      marketValue: Number(ph.market_value),
      recordedDate: ph.recorded_date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
    }),
      source: ph.source,
    }));

    console.log("Fetched price history data:", formatted);

    return withCors(request, Response.json({ success: true, items: formatted }, { status: 200 }), [
      "GET",
      "POST",
      "OPTIONS",
    ]);
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load items" }, { status: 500 }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}

export async function POST(request) {
  try {
    // TODO: Extract body, validate using validateItemPayload, create via itemService
    return Response.json({ success: false, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
