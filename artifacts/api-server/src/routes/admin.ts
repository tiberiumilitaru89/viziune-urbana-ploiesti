import { Router } from "express";

const router = Router();

// POST /admin/login
router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password?: string };
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Parolă incorectă." });
  }
  req.session.isAdmin = true;
  return res.json({ ok: true });
});

// POST /admin/logout
router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// GET /admin/me
router.get("/admin/me", (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

export default router;
