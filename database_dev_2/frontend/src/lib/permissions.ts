/** Central RBAC rules: who can access what. */
export function canAccess(role: string | undefined, action: string) {
  const map: Record<string, string[]> = {
    admin: [
      "CREATE_ITEM",
      "READ_ITEM",
      "UPDATE_ITEM",
      "DELETE_ITEM",
      "CREATE_CUSTOMER",
      "READ_CUSTOMER",
      "UPDATE_CUSTOMER",
      "DELETE_CUSTOMER",
      "CREATE_SOURCE",
      "READ_SOURCE",
      "UPDATE_SOURCE",
      "DELETE_SOURCE",
      "CREATE_ACQUISITION",
      "READ_ACQUISITION",
      "CREATE_SALE",
      "READ_SALE",
      "CREATE_USER",
      "READ_USER",
      "UPDATE_USER",
      "DELETE_USER",
      "READ_AUDIT_LOGS",
    ],
    manager: [
      "CREATE_ITEM",
      "READ_ITEM",
      "UPDATE_ITEM",
      "CREATE_CUSTOMER",
      "READ_CUSTOMER",
      "UPDATE_CUSTOMER",
      "CREATE_SOURCE",
      "READ_SOURCE",
      "UPDATE_SOURCE",
      "CREATE_ACQUISITION",
      "READ_ACQUISITION",
      "CREATE_SALE",
      "READ_SALE",
      "READ_AUDIT_LOGS",
    ],
    employee: ["READ_ITEM", "READ_CUSTOMER", "READ_SOURCE", "READ_ACQUISITION", "READ_SALE"],
  };

  if (!role) return false;
  const normalizedRole = String(role).trim().toLowerCase();

  return map[normalizedRole]?.includes(action) || false;
}