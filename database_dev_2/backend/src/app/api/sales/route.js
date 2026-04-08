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
        payment_method: true,
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
      paymentMethod: sale.payment_method?.payment_method || null,
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
  const prisma = createPrismaClient();
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "CREATE_SALE")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const payload = await request.json();
    const customerId = Number(payload?.customerId);
    const itemId = Number(payload?.itemId);
    const paymentMethodId = Number(payload?.paymentMethodId);
    const salePrice = Number(payload?.salePrice);
    const salesDate = payload?.salesDate ? new Date(payload.salesDate) : new Date();

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return withCors(
        request,
        Response.json({ success: false, error: "Valid customerId is required" }, { status: 400 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return withCors(
        request,
        Response.json({ success: false, error: "Valid itemId is required" }, { status: 400 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (!Number.isInteger(paymentMethodId) || paymentMethodId <= 0) {
      return withCors(
        request,
        Response.json({ success: false, error: "Valid paymentMethodId is required" }, { status: 400 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (!Number.isFinite(salePrice) || salePrice <= 0) {
      return withCors(
        request,
        Response.json({ success: false, error: "salePrice must be a positive number" }, { status: 400 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (Number.isNaN(salesDate.getTime())) {
      return withCors(
        request,
        Response.json({ success: false, error: "Invalid salesDate" }, { status: 400 }),
        ["GET", "POST", "OPTIONS"]
      );
    }

    const [customer, item, paymentMethod, existingSale] = await Promise.all([
      prisma.customer.findUnique({ where: { customer_id: customerId } }),
      prisma.item.findUnique({ where: { item_id: itemId }, include: { sales: { select: { sales_id: true }, take: 1 } } }),
      prisma.payment_method.findUnique({ where: { payment_method_id: paymentMethodId } }),
      prisma.sales.findFirst({ where: { item_id: itemId } }),
    ]);

    if (!customer) {
      return withCors(
        request,
        Response.json({ success: false, error: "Customer not found" }, { status: 404 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (!item) {
      return withCors(
        request,
        Response.json({ success: false, error: "Item not found" }, { status: 404 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (!paymentMethod) {
      return withCors(
        request,
        Response.json({ success: false, error: "Payment method not found" }, { status: 404 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (existingSale || (item.sales && item.sales.length > 0)) {
      return withCors(
        request,
        Response.json({ success: false, error: "This item is already sold" }, { status: 409 }),
        ["GET", "POST", "OPTIONS"]
      );
    }

    const sale = await prisma.sales.create({
      data: {
        item_id: itemId,
        customer_id: customerId,
        user_id: Number(sessionUser.userId),
        payment_method_id: paymentMethodId,
        sale_price: salePrice,
        sales_date: salesDate,
      },
      include: {
        customer: true,
        item: true,
        user: true,
        payment_method: true,
      },
    });

    const createdSale = {
      salesId: sale.sales_id,
      date: sale.sales_date,
      customer: `${sale.customer.first_name} ${sale.customer.last_name}`,
      item: sale.item.title,
      itemId: sale.item_id,
      customerId: sale.customer_id,
      salePrice: Number(sale.sale_price),
      soldBy: `${sale.user.first_name} ${sale.user.last_name}`,
      paymentMethod: sale.payment_method.payment_method,
    };

    return withCors(
      request,
      Response.json({ success: true, sale: createdSale }, { status: 201 }),
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
