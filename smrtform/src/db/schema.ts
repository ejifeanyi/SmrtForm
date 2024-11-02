import {
	timestamp,
	pgTable,
	text,
	primaryKey,
	integer,
	uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const users = pgTable("user", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name"),
	email: text("email").unique().notNull(),
	password: text("password"),
	email_verified: timestamp("email_verified", { mode: "date" }),
	image: text("image"),
});

export const accounts = pgTable(
	"account",
	{
		user_id: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		type: text("type").$type<AdapterAccount["type"]>().notNull(),
		provider: text("provider").notNull(),
		provider_account_id: text("provider_account_id").notNull(),
		refresh_token: text("refresh_token"),
		access_token: text("access_token"),
		expires_at: integer("expires_at"),
		token_type: text("token_type"),
		scope: text("scope"),
		id_token: text("id_token"),
		session_state: text("session_state"),
	},
	(account) => ({
		compound_key: primaryKey({
			columns: [account.provider, account.provider_account_id],
		}),
	})
);

export const sessions = pgTable("session", {
	session_token: text("session_token").notNull().primaryKey(),
	user_id: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
	"verification_token",
	{
		identifier: text("identifier").notNull(),
		token: text("token").notNull(),
		expires: timestamp("expires", { mode: "date" }).notNull(),
	},
	(vt) => ({
		compound_key: primaryKey({
			columns: [vt.identifier, vt.token],
		}),
	})
);
