import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.isAdmin) {
    res.status(401).json({ error: "Neautorizat." });
    return;
  }
  next();
}

// GET /projects  — public
router.get("/projects", async (req, res) => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.createdAt));
    res.json(projects);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Eroare server." });
  }
});

// POST /projects  — admin only
router.post("/projects", requireAdmin, async (req, res) => {
  const { title, description, status, imageObjectPath, beforeImageObjectPath, afterImageObjectPath } = req.body as {
    title?: string; description?: string; status?: string;
    imageObjectPath?: string; beforeImageObjectPath?: string; afterImageObjectPath?: string;
  };
  if (!title) { res.status(400).json({ error: "Titlul este obligatoriu." }); return; }
  try {
    const [project] = await db
      .insert(projectsTable)
      .values({
        title: title.trim(),
        description: description?.trim() ?? "",
        status: (status as "in_progress" | "completed") ?? "in_progress",
        imageObjectPath: imageObjectPath ?? null,
        beforeImageObjectPath: beforeImageObjectPath ?? null,
        afterImageObjectPath: afterImageObjectPath ?? null,
      })
      .returning();
    res.status(201).json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Eroare server." });
  }
});

// PUT /projects/:id  — admin only
router.put("/projects/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, description, status, imageObjectPath, beforeImageObjectPath, afterImageObjectPath } = req.body as {
    title?: string; description?: string; status?: string;
    imageObjectPath?: string; beforeImageObjectPath?: string; afterImageObjectPath?: string;
  };
  if (!title) { res.status(400).json({ error: "Titlul este obligatoriu." }); return; }
  try {
    const [project] = await db
      .update(projectsTable)
      .set({
        title: title.trim(),
        description: description?.trim() ?? "",
        status: (status as "in_progress" | "completed") ?? "in_progress",
        imageObjectPath: imageObjectPath ?? null,
        beforeImageObjectPath: beforeImageObjectPath ?? null,
        afterImageObjectPath: afterImageObjectPath ?? null,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, id))
      .returning();
    if (!project) { res.status(404).json({ error: "Proiect negăsit." }); return; }
    res.json(project);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Eroare server." });
  }
});

// DELETE /projects/:id  — admin only
router.delete("/projects/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [deleted] = await db
      .delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .returning();
    if (!deleted) { res.status(404).json({ error: "Proiect negăsit." }); return; }
    res.json({ ok: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Eroare server." });
  }
});

export default router;
