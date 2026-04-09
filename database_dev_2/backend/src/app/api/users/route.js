import bcrypt from "bcryptjs";
import { createPrismaClient } from "@/lib/prisma";
import { preflight, withCors } from "@/lib/cors";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { logAuditEvent } from "@/lib/audit";

function normalizeRoleName(input) {
  return String(input || "").trim().toLowerCase();
}

export async function OPTIONS(req) {
  return preflight(req, ["GET", "POST", "OPTIONS"]);
}

export async function GET(request) {
  const prisma = createPrismaClient();
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return withCors(request, Response.json({ success: false, error: "Unauthorized" }, { status: 401 }), [
      "GET",
      "POST",
      "OPTIONS",
    ]);
  }

  if (!hasPermission(sessionUser.role, "READ_USER")) {
    return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }), [
      "GET",
      "POST",
      "OPTIONS",
    ]);
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageParam = Number(searchParams.get("page")) || 1;
    const limitParam = Math.min(Math.max(Number(searchParams.get("limit")) || 20, 1), 100);
    const page = pageParam < 1 ? 1 : pageParam;
    const take = limitParam;
    const skip = (page - 1) * take;

    const [total, users, roles] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        include: { role: true },
        orderBy: { user_id: "desc" },
        skip,
        take,
      }),
      prisma.role.findMany({
        orderBy: { role_name: "asc" },
      }),
    ]);

    const formattedUsers = users.map((user) => ({
      userId: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      roleId: user.role_id,
      role: normalizeRoleName(user.role?.role_name || "employee"),
      isActive: Boolean(user.is_active),
      createdDate: user.created_date ? new Date(user.created_date).toISOString() : null,
      lastLogin: user.last_login ? new Date(user.last_login).toISOString() : null,
    }));

    const formattedRoles = roles.map((role) => ({
      roleId: role.role_id,
      roleName: normalizeRoleName(role.role_name),
      description: role.description,
    }));

    return withCors(
      request,
      Response.json(
        { success: true, users: formattedUsers, roles: formattedRoles, page, limit: take, total },
        { status: 200 }
      ),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to load users" }, { status: 500 }),
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
    if (!hasPermission(sessionUser.role, "CREATE_USER")) {
      return withCors(request, Response.json({ success: false, error: "Forbidden" }, { status: 403 }), [
        "GET",
        "POST",
        "OPTIONS",
      ]);
    }

    const payload = await request.json();
    const firstName = String(payload?.firstName || "").trim();
    const lastName = String(payload?.lastName || "").trim();
    const email = String(payload?.email || "").trim().toLowerCase();
    const roleId = Number(payload?.roleId);
    const rawPassword = String(payload?.password || "").trim();
    const isActive = payload?.isActive !== false;

    if (!firstName || !lastName || !email || !Number.isInteger(roleId) || roleId <= 0) {
      return withCors(
        request,
        Response.json({ success: false, error: "firstName, lastName, email, and roleId are required" }, { status: 400 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (!rawPassword || rawPassword.length < 8) {
      return withCors(
        request,
        Response.json({ success: false, error: "Password must be at least 8 characters" }, { status: 400 }),
        ["GET", "POST", "OPTIONS"]
      );
    }

    const [existingUser, role] = await Promise.all([
      prisma.user.findFirst({ where: { email } }),
      prisma.role.findUnique({ where: { role_id: roleId } }),
    ]);

    if (existingUser) {
      return withCors(
        request,
        Response.json({ success: false, error: "Email already exists" }, { status: 409 }),
        ["GET", "POST", "OPTIONS"]
      );
    }
    if (!role) {
      return withCors(
        request,
        Response.json({ success: false, error: "Role not found" }, { status: 404 }),
        ["GET", "POST", "OPTIONS"]
      );
    }

    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const user = await prisma.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email,
        role_id: roleId,
        password_hash: passwordHash,
        is_active: isActive,
        created_date: new Date(),
      },
      include: { role: true },
    });

    await logAuditEvent(prisma, {
      action: "CREATE_USER",
      resourceType: "user",
      resourceId: user.user_id,
      userId: Number(sessionUser.userId),
      summary: `Created user ${user.first_name} ${user.last_name} (${user.email})`,
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
          },
        },
        { status: 201 }
      ),
      ["GET", "POST", "OPTIONS"]
    );
  } catch (error) {
    return withCors(
      request,
      Response.json({ success: false, error: error.message || "Failed to create user" }, { status: 500 }),
      ["GET", "POST", "OPTIONS"]
    );
  }
}