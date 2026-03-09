import { pgTable, text, timestamp, uuid, real, integer } from "drizzle-orm/pg-core";

export const incomes = pgTable("incomes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  valor: real("valor").notNull(),
  mes: integer("mes").notNull(),
  ano: integer("ano").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  nome: text("nome").notNull(),
  percentual: integer("percentual").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: 'cascade' }),
  valor: real("valor").notNull(),
  descricao: text("descricao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
