import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

function parseId(params) {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function OPTIONS(req) {
  return preflight(req, ["GET", "OPTIONS"]);
}

export async function GET(request, { params }) {
  const salesId = parseId(await params);
  if (!salesId) {
    return withCors(request, Response.json({ success: false, error: "Invalid sale id" }, { status: 400 }));
  }

  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_SALE")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const sale = await prisma.sales.findUnique({
      where: { sales_id: salesId },
      include: {
        customer: true,
        item: {
          include: {
            book: { include: { author: true, publisher: true } },
            map: { include: { cartographer: true, publisher: true } },
            periodical: { include: { publisher: true } },
          },
        },
        user: true,
        payment_method: true,
      },
    });

    if (!sale) {
      return withCors(request, Response.json({ success: false, error: "Sale not found" }, { status: 404 }));
    }

    const formatted = {
      salesId: sale.sales_id,
      date: sale.sales_date,
      salePrice: Number(sale.sale_price),
      paymentMethod: sale.payment_method?.payment_method || null,
      customer: {
        customerId: sale.customer_id,
        name: `${sale.customer.first_name} ${sale.customer.last_name}`,
        email: sale.customer.email,
        phone: sale.customer.phone,
      },
      item: {
        itemId: sale.item_id,
        title: sale.item.title,
        condition: sale.item.condition,
        askingPrice: Number(sale.item.selling_price),
        category: sale.item.book ? "Book" : sale.item.map ? "Map" : sale.item.periodical ? "Magazine" : "Other",
      },
      soldBy: {
        userId: sale.user_id,
        name: `${sale.user.first_name} ${sale.user.last_name}`,
      },
    };

    return withCors(
      request,
      Response.json({ success: true, sale: formatted }, { status: 200 }),
      ["GET", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load sale" }, { status: 500 }),
      ["GET", "OPTIONS"]
    );
  }
}
