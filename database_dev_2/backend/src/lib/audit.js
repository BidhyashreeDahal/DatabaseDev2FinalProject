export async function logAuditEvent(prisma, { action, resourceType, resourceId, userId, summary }) {
  // Best-effort: ensure table exists (id SERIAL, fields, created_at TIMESTAMPTZ)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS audit_event (
      id SERIAL PRIMARY KEY,
      action VARCHAR(50) NOT NULL,
      resource_type VARCHAR(50) NOT NULL,
      resource_id INTEGER,
      user_id INTEGER,
      summary VARCHAR(400),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await prisma.$executeRawUnsafe(
    `INSERT INTO audit_event (action, resource_type, resource_id, user_id, summary)
     VALUES ($1, $2, $3, $4, $5)`,
    action,
    resourceType,
    resourceId ?? null,
    userId ?? null,
    summary ?? null
  );
}
