import { Router } from "express";
import { db } from "@workspace/db";
import { specItemsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Public: list all spec items ordered
router.get("/spec-items", async (_req, res) => {
  const items = await db
    .select()
    .from(specItemsTable)
    .orderBy(specItemsTable.orderNum, specItemsTable.id);
  res.json(items);
});

// Admin: create
router.post("/spec-items", async (req, res) => {
  if (!req.session?.isAdmin) return res.status(401).json({ error: "Unauthorized" });
  const { title, description, imageObjectPath, orderNum } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });
  const [item] = await db
    .insert(specItemsTable)
    .values({ title, description: description ?? "", imageObjectPath: imageObjectPath ?? null, orderNum: orderNum ?? 0 })
    .returning();
  return res.status(201).json(item);
});

// Admin: update
router.put("/spec-items/:id", async (req, res) => {
  if (!req.session?.isAdmin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const { title, description, imageObjectPath, orderNum } = req.body;
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (imageObjectPath !== undefined) updates.imageObjectPath = imageObjectPath;
  if (orderNum !== undefined) updates.orderNum = orderNum;
  const [item] = await db.update(specItemsTable).set(updates).where(eq(specItemsTable.id, id)).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json(item);
});

// Admin: delete
router.delete("/spec-items/:id", async (req, res) => {
  if (!req.session?.isAdmin) return res.status(401).json({ error: "Unauthorized" });
  const id = Number(req.params.id);
  const [item] = await db.delete(specItemsTable).where(eq(specItemsTable.id, id)).returning();
  if (!item) return res.status(404).json({ error: "Not found" });
  return res.json({ ok: true });
});

export default router;
