import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { customerService } from "@/services/customerService";

function parseId(params) {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function OPTIONS(req) {
  return preflight(req, ["GET", "PATCH", "DELETE", "OPTIONS"]);
}

export async function GET(request, { params }) {
  const id = parseId(await params);
  if (!id) {
    return withCors(request, Response.json({ success: false, error: "Invalid customer id" }, { status: 400 }));
  }

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_CUSTOMER")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const customer = await customerService.getCustomer(id);
    return withCors(
      request,
      Response.json({ success: true, customer }, { status: 200 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  } catch (error) {
    const status = error.statusCode || error.status || 500;
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load customer" }, { status }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  }
}

export async function PATCH(request, { params }) {
  const id = parseId(await params);
  if (!id) {
    return withCors(request, Response.json({ success: false, error: "Invalid customer id" }, { status: 400 }));
  }

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "UPDATE_CUSTOMER")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const payload = await request.json();
    const customer = await customerService.updateCustomer(id, payload);
    return withCors(
      request,
      Response.json({ success: true, customer }, { status: 200 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  } catch (error) {
    const status = error.statusCode || error.status || 500;
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to update customer" }, { status }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  }
}

export async function DELETE(request, { params }) {
  const id = parseId(await params);
  if (!id) {
    return withCors(request, Response.json({ success: false, error: "Invalid customer id" }, { status: 400 }));
  }

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "DELETE_CUSTOMER")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    await customerService.deleteCustomer(id);
    return withCors(
      request,
      Response.json({ success: true, message: "Customer deleted successfully" }, { status: 200 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  } catch (error) {
    const status = error.statusCode || error.status || 500;
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to delete customer" }, { status }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  }
}
