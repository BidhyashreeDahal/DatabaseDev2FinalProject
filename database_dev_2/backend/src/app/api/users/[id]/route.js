import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

function parseId(params) {
  const id = Number(params?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeRoleName(input) {
  return String(input || "").trim().toLowerCase();
}

export async function OPTIONS(req) {
  return preflight(req, ["GET", "PATCH", "DELETE", "OPTIONS"]);
}

export async function GET(request, { params }) {
  const prisma = createPrismaClient();
  const userId = parseId(await params);
  if (!userId) {
    return withCors(request, Response.json({ success: false, error: "Invalid user id" }, { status: 400 }));
  }

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "READ_USER")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true },
    });
    if (!user) {
      return withCors(request, Response.json({ success: false, error: "User not found" }, { status: 404 }));
    }

    return withCors(
      request,
      Response.json(
        {
          success: true,
          user: {
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            roleId: user.role_id,
            role: normalizeRoleName(user.role?.role_name || "employee"),
            isActive: Boolean(user.is_active),
            createdDate: user.created_date ? new Date(user.created_date).toISOString() : null,
            lastLogin: user.last_login ? new Date(user.last_login).toISOString() : null,
          },
        },
        { status: 200 }
      ),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load user" }, { status: 500 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  }
}

export async function PATCH(request, { params }) {
  const prisma = createPrismaClient();
  const userId = parseId(await params);
  if (!userId) {
    return withCors(request, Response.json({ success: false, error: "Invalid user id" }, { status: 400 }));
  }

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "UPDATE_USER")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }

    const payload = await request.json();
    const updateData = {};

    if (payload?.firstName !== undefined) {
      const firstName = String(payload.firstName || "").trim();
      if (!firstName) {
        return withCors(request, Response.json({ success: false, error: "firstName cannot be empty" }, { status: 400 }), [
          "GET",
          "PATCH",
          "DELETE",
          "OPTIONS",
        ]);
      }
      updateData.first_name = firstName;
    }
    if (payload?.lastName !== undefined) {
      const lastName = String(payload.lastName || "").trim();
      if (!lastName) {
        return withCors(request, Response.json({ success: false, error: "lastName cannot be empty" }, { status: 400 }), [
          "GET",
          "PATCH",
          "DELETE",
          "OPTIONS",
        ]);
      }
      updateData.last_name = lastName;
    }
    if (payload?.email !== undefined) {
      const email = String(payload.email || "").trim().toLowerCase();
      if (!email) {
        return withCors(request, Response.json({ success: false, error: "email cannot be empty" }, { status: 400 }), [
          "GET",
          "PATCH",
          "DELETE",
          "OPTIONS",
        ]);
      }
      updateData.email = email;
    }
    if (payload?.roleId !== undefined) {
      const roleId = Number(payload.roleId);
      if (!Number.isInteger(roleId) || roleId <= 0) {
        return withCors(request, Response.json({ success: false, error: "Valid roleId is required" }, { status: 400 }), [
          "GET",
          "PATCH",
          "DELETE",
          "OPTIONS",
        ]);
      }
      const role = await prisma.role.findUnique({ where: { role_id: roleId } });
      if (!role) {
        return withCors(request, Response.json({ success: false, error: "Role not found" }, { status: 404 }), [
          "GET",
          "PATCH",
          "DELETE",
          "OPTIONS",
        ]);
      }
      updateData.role_id = roleId;
    }
    if (payload?.isActive !== undefined) {
      updateData.is_active = Boolean(payload.isActive);
    }

    if (Object.keys(updateData).length === 0) {
      return withCors(
        request,
        Response.json({ success: false, error: "No valid fields provided" }, { status: 400 }),
        ["GET", "PATCH", "DELETE", "OPTIONS"]
      );
    }

    const user = await prisma.user.update({
      where: { user_id: userId },
      data: updateData,
      include: { role: true },
    });

    await logAuditEvent(prisma, {
      action: "UPDATE_USER",
      resourceType: "user",
      resourceId: user.user_id,
      userId: Number(sessionUser.userId),
      summary: `Updated user ${user.first_name} ${user.last_name} (${user.email})`,
    });

    return withCors(
      request,
      Response.json(
        {
          success: true,
          user: {
            userId: user.user_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            roleId: user.role_id,
            role: normalizeRoleName(user.role?.role_name || "employee"),
            isActive: Boolean(user.is_active),
            createdDate: user.created_date ? new Date(user.created_date).toISOString() : null,
            lastLogin: user.last_login ? new Date(user.last_login).toISOString() : null,
          },
        },
        { status: 200 }
      ),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  } catch (error) {
    if (error?.code === "P2025") {
      return withCors(request, Response.json({ success: false, error: "User not found" }, { status: 404 }), [
        "GET",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ]);
    }
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to update user" }, { status: 500 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  }
}

export async function DELETE(request, { params }) {
  const prisma = createPrismaClient();
  const userId = parseId(await params);
  if (!userId) {
    return withCors(request, Response.json({ success: false, error: "Invalid user id" }, { status: 400 }));
  }

  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }));
    }
    if (!hasPermission(sessionUser.role, "DELETE_USER")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }));
    }
    if (Number(sessionUser.userId) === userId) {
      return withCors(
        request,
        Response.json({ success: false, error: "You cannot delete your own account" }, { status: 400 }),
        ["GET", "PATCH", "DELETE", "OPTIONS"]
      );
    }

    const existing = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { user_id: true, first_name: true, last_name: true, email: true },
    });
    if (!existing) {
      return withCors(request, Response.json({ success: false, error: "User not found" }, { status: 404 }), [
        "GET",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ]);
    }

    await prisma.user.update({
      where: { user_id: userId },
      data: { is_active: false },
    });

    await logAuditEvent(prisma, {
      action: "DEACTIVATE_USER",
      resourceType: "user",
      resourceId: userId,
      userId: Number(sessionUser.userId),
      summary: `Deactivated user ${existing.first_name} ${existing.last_name} (${existing.email})`,
    });

    return withCors(
      request,
      Response.json({ success: true, message: "User deactivated successfully" }, { status: 200 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  } catch (error) {
    if (error?.code === "P2025") {
      return withCors(request, Response.json({ success: false, error: "User not found" }, { status: 404 }), [
        "GET",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ]);
    }
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to deactivate user" }, { status: 500 }),
      ["GET", "PATCH", "DELETE", "OPTIONS"]
    );
  }
}
