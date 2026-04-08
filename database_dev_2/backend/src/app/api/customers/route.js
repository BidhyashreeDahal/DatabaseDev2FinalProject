import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { customerService } from "@/services/customerService";
import { createPrismaClient } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit";

export async function OPTIONS(req) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}

export async function GET(request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_CUSTOMER")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const customers = await customerService.listCustomers({ search });

    return withCors(
      request,
      Response.json({ success: true, customers }, { status: 200 }),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    const status = error.statusCode || error.status || 500;
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load customers" }, { status }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}

export async function POST(request) {
  try {
    const prisma = createPrismaClient();
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "CREATE_CUSTOMER")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const payload = await request.json();
    const customer = await customerService.createCustomer(payload);
    try {
      await logAuditEvent(prisma, {
        action: "CREATE_CUSTOMER",
        resourceType: "customer",
        resourceId: customer.customerId || customer.customer_id,
        userId: sessionUser.userId,
        summary: `Created customer ${payload.firstName || ""} ${payload.lastName || ""}`.trim(),
      });
    } catch {}

    return withCors(
      request,
      Response.json({ success: true, customer }, { status: 201 }),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    const status = error.statusCode || error.status || 500;
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to create customer" }, { status }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}
