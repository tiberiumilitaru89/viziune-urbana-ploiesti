import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const auditRequestsTable = pgTable("audit_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  building: text("building").notNull(),
  address: text("address").notNull(),
  problem: text("problem").notNull(),
  status: text("status").notNull().default("nou"),
  formsCollected: integer("forms_collected").notNull().default(0),
  formsTarget: integer("forms_target").notNull().default(50),
  fundsCollected: integer("funds_collected").notNull().default(0),
  fundsTarget: integer("funds_target").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAuditRequestSchema = createInsertSchema(auditRequestsTable)
  .omit({ id: true, createdAt: true, status: true, formsCollected: true, formsTarget: true, fundsCollected: true, fundsTarget: true })
  .extend({
    name: z.string().min(2),
    phone: z.string().min(6),
    building: z.string().min(1),
    address: z.string().min(3),
    problem: z.string().min(10),
  });

export type InsertAuditRequest = z.infer<typeof insertAuditRequestSchema>;
export type AuditRequest = typeof auditRequestsTable.$inferSelect;
