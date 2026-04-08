import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function OPTIONS(req) {
  return preflight(req, ["GET", "OPTIONS"]);
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

    const rows = await prisma.payment_method.findMany({
      orderBy: { payment_method_id: "asc" },
    });

    const paymentMethods = rows.map((row) => ({
      paymentMethodId: row.payment_method_id,
      paymentMethod: row.payment_method,
    }));

    return withCors(
      request,
      Response.json({ success: true, paymentMethods }, { status: 200 }),
      ["GET", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load payment methods" }, { status: 500 }),
      ["GET", "OPTIONS"]
    );
  }
}
