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
    if (!hasPermission(sessionUser.role, "READ_SALE")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const sales = await prisma.sales.findMany({
      include: {
        customer: true,
        item: true,
        user: true,
      },
      orderBy: { sales_date: "desc" },
      take: 50,
    });

    const formatted = sales.map((sale) => ({
      salesId: sale.sales_id,
      date: sale.sales_date,
      customer: `${sale.customer.first_name} ${sale.customer.last_name}`,
      item: sale.item.title,
      salePrice: Number(sale.sale_price),
      soldBy: `${sale.user.first_name} ${sale.user.last_name}`,
    }));

    return withCors(request, Response.json({ success: true, sales: formatted }, { status: 200 }), [
      "GET",
      "POST",
      "OPTIONS",
    ]);
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load sales" }, { status: 500 }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}

export async function POST(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "CREATE_SALE")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    // TODO: Extract body (customerId, itemId, quantity, price, date, notes)
    // Validate using validateSalePayload, check permissions (MANAGER/ADMIN)
    // Call saleService.createSale - decreases item quantity, tracks revenue
    // Log audit event: {action: 'CREATE_SALE', resourceId, userId}
    // Return created sale with 201 status
    return withCors(
      request,
      Response.json({ success: false, error: "Not implemented" }, { status: 501 }),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to create sale" }, { status: 500 }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}
