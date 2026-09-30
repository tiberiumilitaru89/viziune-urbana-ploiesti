import { Router, type IRouter } from "express";
import {
  CreateAuditRequestBody,
  CreateAuditRequestResponse,
  GetAuditSummaryResponse,
  ListAuditRequestsResponse,
} from "@workspace/api-zod";
import { auditRequestsTable } from "@workspace/db";
import { db } from "@workspace/db";
import { desc, gte, sql, eq } from "drizzle-orm";
import { sendNewAuditRequestEmail } from "../lib/email";
import { UpdateAuditRequestBody } from "@workspace/api-zod";

const router: IRouter = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.isAdmin) {
    res.status(401).json({ error: "Neautorizat." });
    return;
  }
  next();
}

router.post("/audit-requests", async (req, res) => {
  const parsed = CreateAuditRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Verifică datele completate și încearcă din nou." });
    return;
  }

  const [created] = await db
    .insert(auditRequestsTable)
    .values(parsed.data)
    .returning();
  res.status(201).json(CreateAuditRequestResponse.parse(created));

  // Fire-and-forget email notification to admin
  sendNewAuditRequestEmail({
    id: created.id,
    name: created.name,
    phone: created.phone,
    building: created.building,
    address: created.address,
    problem: created.problem,
  }).catch((err) => {
    req.log.error({ err }, "[email] Eroare la trimiterea notificării admin");
  });
});

router.get("/audit-requests", async (_req, res) => {
  const requests = await db
    .select()
    .from(auditRequestsTable)
    .orderBy(desc(auditRequestsTable.createdAt));
  res.json(ListAuditRequestsResponse.parse(requests));
});

router.get("/audit-requests/summary", async (_req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditRequestsTable);
  const [monthResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(auditRequestsTable)
    .where(gte(auditRequestsTable.createdAt, startOfMonth));
  res.json(
    GetAuditSummaryResponse.parse({
      total: Number(totalResult?.count ?? 0),
      thisMonth: Number(monthResult?.count ?? 0),
    }),
  );
});

// PUT /audit-requests/:id — admin only, updates progress + status
router.put("/audit-requests/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const parsed = UpdateAuditRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Date invalide." });
    return;
  }
  const { status, formsCollected, formsTarget, fundsCollected, fundsTarget } = parsed.data;

  try {
    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (formsCollected !== undefined) updateData.formsCollected = formsCollected;
    if (formsTarget !== undefined) updateData.formsTarget = formsTarget;
    if (fundsCollected !== undefined) updateData.fundsCollected = fundsCollected;
    if (fundsTarget !== undefined) updateData.fundsTarget = fundsTarget;

    const [updated] = await db
      .update(auditRequestsTable)
      .set(updateData)
      .where(eq(auditRequestsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Cerere negăsită." }); return; }
    res.json(updated);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Eroare server." });
  }
});

export default router;
