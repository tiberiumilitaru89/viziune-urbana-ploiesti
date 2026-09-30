import { Router, type IRouter } from "express";
import healthRouter from "./health";
import auditRequestsRouter from "./audit-requests";
import adminRouter from "./admin";
import projectsRouter from "./projects";
import storageRouter from "./storage";
import specItemsRouter from "./spec-items";

const router: IRouter = Router();

router.use(healthRouter);
router.use(auditRequestsRouter);
router.use(adminRouter);
router.use(projectsRouter);
router.use(storageRouter);
router.use(specItemsRouter);

export default router;
