import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const specItemsTable = pgTable("spec_items", {
  id: serial("id").primaryKey(),
  orderNum: integer("order_num").notNull().default(0),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  imageObjectPath: text("image_object_path"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSpecItemSchema = createInsertSchema(specItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSpecItem = z.infer<typeof insertSpecItemSchema>;
export type SpecItem = typeof specItemsTable.$inferSelect;
