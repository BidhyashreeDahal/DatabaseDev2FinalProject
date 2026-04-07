import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function OPTIONS(req) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}

export async function GET(request) {
  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_ITEM")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();

    const items = await prisma.item.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        book: true,
        map: true,
        periodical: true,
        sales: {
          select: { sales_id: true },
          take: 1,
        },
      },
      orderBy: { item_id: "desc" },
      take: 50,
    });

    const formatted = items.map((item) => ({
      itemId: item.item_id,
      title: item.title,
      category: item.book ? "Book" : item.map ? "Map" : item.periodical ? "Magazine" : "Other",
      condition: item.condition,
      askingPrice: Number(item.selling_price),
      status: item.sales.length > 0 ? "Sold" : "In Stock",
    }));

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
/// Post new item - only MANAGER/ADMIN can create, validate the iteam. 

export async function POST(request) {
  const prisma = createPrismaClient();

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "CREATE_ITEM")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const body = await request.json();

    // -----------------------------
    // 1. COMMON FIELDS
    // -----------------------------
    const title = body?.title?.trim();
    const condition = body?.condition?.trim();
    const description = typeof body?.description === "string" ? body.description.trim() : null;
    const note = typeof body?.note === "string" ? body.note.trim() : null;
    const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : null;

    const acquisitionDate = body?.acquisitionDate ? new Date(body.acquisitionDate) : null;
    const acquisitionCost = Number(body?.acquisitionCost);
    const sellingPrice = Number(body?.sellingPrice);

    const category = body?.category;

    // -----------------------------
    // 2. VALIDATION (COMMON)
    // -----------------------------
    if (!title) throw new Error("Title is required");
    if (!condition) throw new Error("Condition is required");

    if (!acquisitionDate || Number.isNaN(acquisitionDate.getTime())) {
      throw new Error("Valid acquisitionDate is required");
    }

    if (!Number.isFinite(acquisitionCost) || acquisitionCost <= 0) {
      throw new Error("acquisitionCost must be positive");
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
      throw new Error("sellingPrice must be positive");
    }

    if (!["Book", "Map", "Magazine"].includes(category)) {
      throw new Error("Invalid category");
    }

    // -----------------------------
    // 3. TRANSACTION
    // -----------------------------
    const result = await prisma.$transaction(async (tx) => {
      // -----------------------------
      // CREATE BASE ITEM
      // -----------------------------
      const item = await tx.item.create({
        data: {
          title,
          description,
          condition,
          acquisition_date: acquisitionDate,
          acquisition_cost: acquisitionCost,
          selling_price: sellingPrice,
          image_url: imageUrl,
          note,
        },
      });

      // Always track the initial listing price in price history.
      await tx.price_history.create({
        data: {
          item_id: item.item_id,
          market_value: sellingPrice,
          recorded_date: acquisitionDate,
          source: "Initial listing price",
        },
      });

      // -----------------------------
      // CATEGORY-SPECIFIC CREATION
      // -----------------------------
      if (category === "Book") {
        const book = body?.book;

        if (!book) throw new Error("Book data is required");

        if (!book.authorId || !book.publisherId) {
          throw new Error("Book must include authorId and publisherId");
        }

        const edition = typeof book.edition === "string" ? book.edition.trim() : "";
        const isbn = typeof book.isbn === "string" ? book.isbn.trim() : "";
        const bindingType = typeof book.bindingType === "string" ? book.bindingType.trim() : "";
        const publishingYear = book.publishingYear ? new Date(book.publishingYear) : null;

        if (!publishingYear || Number.isNaN(publishingYear.getTime())) {
          throw new Error("Book publishingYear is required");
        }
        if (!edition) {
          throw new Error("Book edition is required");
        }
        if (!isbn) {
          throw new Error("Book isbn is required");
        }
        if (!bindingType) {
          throw new Error("Book bindingType is required");
        }

        await tx.book.create({
          data: {
            item_id: item.item_id,
            author_id: Number(book.authorId),
            publisher_id: Number(book.publisherId),
            publishing_year: publishingYear,
            edition,
            isbn,
            binding_type: bindingType,
            genre: book.genre || null,
          },
        });
      }

      if (category === "Map") {
        const map = body?.map;

        if (!map) throw new Error("Map data is required");
        if (!map.mapType) throw new Error("mapType is required");

        await tx.map.create({
          data: {
            item_id: item.item_id,
            cartographer_id: map.cartographerId ? Number(map.cartographerId) : null,
            publisher_id: map.publisherId ? Number(map.publisherId) : null,
            publishing_year: map.publishingYear ? new Date(map.publishingYear) : null,
            scale: map.scale || null,
            map_type: map.mapType,
          },
        });
      }

      if (category === "Magazine") {
        const p = body?.periodical;

        if (!p) throw new Error("Periodical data is required");
        if (!p.issueDate) throw new Error("issueDate is required");

        await tx.periodical.create({
          data: {
            item_id: item.item_id,
            publisher_id: p.publisherId ? Number(p.publisherId) : null,
            issue_date: new Date(p.issueDate),
            issue_number: p.issueNumber || null,
            subject_coverage: p.subjectCoverage || null,
          },
        });
      }

      // -----------------------------
      // OPTIONAL: PROVENANCE
      // -----------------------------
      if (Array.isArray(body?.provenance)) {
        for (const prov of body.provenance) {
          if (!prov.previousOwner || !prov.startDate) continue;

          await tx.provenance.create({
            data: {
              item_id: item.item_id,
              previous_owner: prov.previousOwner,
              start_date: new Date(prov.startDate),
              end_date: prov.endDate ? new Date(prov.endDate) : null,
              verified_status: Boolean(prov.verifiedStatus),
              note: prov.note || null,
            },
          });
        }
      }

      // -----------------------------
      // OPTIONAL: PRICE HISTORY
      // -----------------------------
      if (Array.isArray(body?.priceHistory)) {
        for (const ph of body.priceHistory) {
          if (!ph.marketValue || !ph.recordedDate) continue;

          await tx.price_history.create({
            data: {
              item_id: item.item_id,
              market_value: Number(ph.marketValue),
              recorded_date: new Date(ph.recordedDate),
              source: ph.source || "Unknown",
            },
          });
        }
      }

      return item;
    });

    // -----------------------------
    // RESPONSE
    // -----------------------------
    return withCors(
      request,
      Response.json(
        {
          success: true,
          itemId: result.item_id,
          message: "Item created successfully",
        },
        { status: 201 }
      ),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    const message = error?.message || "Failed to create item";
    const status = /required|invalid|must include/i.test(message) ? 400 : 500;
    return withCors(
      request,
      Response.json(
        {
          success: false,
          error: message,
        },
        { status }
      ),
      ["GET", "POST", "OPTIONS"]
    );
  }
}