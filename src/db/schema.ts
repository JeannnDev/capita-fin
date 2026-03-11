import { pgTable, text, timestamp, uuid, real, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const sessions = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
});

// Better Auth accounts table
export const accounts = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

// Financial Tables
export const financialAccounts = pgTable("financial_accounts", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    name: text("name").notNull(),
    balance: real("balance").default(0).notNull(),
    type: text("type").notNull(), // 'checking' | 'savings' | 'credit' | 'wallet' | 'food'
    color: text("color").notNull(),
    institution: text("institution"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    nome: text("nome").notNull(),
    icon: text("icon").default("tag").notNull(),
    color: text("color").default("#8b5cf6").notNull(),
    type: text("type").default("expense").notNull(), // 'income' | 'expense'
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid("account_id").references(() => financialAccounts.id, { onDelete: 'cascade' }),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: 'set null' }),
    valor: real("valor").notNull(),
    descricao: text("descricao"),
    type: text("type").default("expense").notNull(), // 'income' | 'expense'
    date: timestamp("date").defaultNow().notNull(),
    mes: integer("mes").default(new Date().getMonth()).notNull(),
    ano: integer("ano").default(new Date().getFullYear()).notNull(),
    isPaid: boolean("is_paid").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reminders = pgTable("reminders", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    accountId: uuid("account_id").references(() => financialAccounts.id, { onDelete: 'set null' }),
    title: text("title").notNull(),
    amount: real("amount").notNull(),
    dueDate: timestamp("due_date").notNull(),
    frequency: text("frequency").notNull(), // 'once' | 'weekly' | 'monthly' | 'yearly'
    category: text("category").notNull(),
    isPaid: boolean("is_paid").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const budgets = pgTable("budgets", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    category: text("category").notNull(),
    limit: real("limit").notNull(),
    limitType: text("limit_type").default("value").notNull(), // 'value' | 'percentage'
    limitValue: real("limit_value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    name: text("name").notNull(),
    targetAmount: real("target_amount").notNull(),
    currentAmount: real("current_amount").default(0).notNull(),
    deadline: timestamp("deadline"),
    icon: text("icon").notNull(),
    color: text("color").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goalContributions = pgTable("goal_contributions", {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id").references(() => goals.id, { onDelete: 'cascade' }),
    accountId: uuid("account_id").references(() => financialAccounts.id, { onDelete: 'set null' }),
    amount: real("amount").notNull(),
    date: timestamp("date").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    sessions: many(sessions),
    financialAccounts: many(financialAccounts),
    categories: many(categories),
    transactions: many(transactions),
    reminders: many(reminders),
    budgets: many(budgets),
    goals: many(goals),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const financialAccountsRelations = relations(financialAccounts, ({ one, many }) => ({
    user: one(users, { fields: [financialAccounts.userId], references: [users.id] }),
    transactions: many(transactions),
    reminders: many(reminders),
    contributions: many(goalContributions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    user: one(users, { fields: [categories.userId], references: [users.id] }),
    transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    user: one(users, { fields: [transactions.userId], references: [users.id] }),
    account: one(financialAccounts, { fields: [transactions.accountId], references: [financialAccounts.id] }),
    category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
    user: one(users, { fields: [reminders.userId], references: [users.id] }),
    account: one(financialAccounts, { fields: [reminders.accountId], references: [financialAccounts.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
    user: one(users, { fields: [budgets.userId], references: [users.id] }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
    user: one(users, { fields: [goals.userId], references: [users.id] }),
    contributions: many(goalContributions),
}));

export const goalContributionsRelations = relations(goalContributions, ({ one }) => ({
    goal: one(goals, { fields: [goalContributions.goalId], references: [goals.id] }),
    account: one(financialAccounts, { fields: [goalContributions.accountId], references: [financialAccounts.id] }),
}));
