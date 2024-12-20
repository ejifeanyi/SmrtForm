import {
	timestamp,
	pgTable,
	text,
	primaryKey,
	integer,
	uuid,
	boolean,
	pgEnum,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";
import { relations } from "drizzle-orm";

export const formElements = pgEnum("field_type", [
	"RadioGroup",
	"Select",
	"Input",
	"Textarea",
	"Switch",
]);

export const users = pgTable("user", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name"),
	email: text("email").unique().notNull(),
	password: text("password"),
	emailVerified: timestamp("email_verified", { mode: "date" }),
	image: text("image"),
});

export const accounts = pgTable("account", {
	userId: uuid("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	type: text("type").$type<AdapterAccount["type"]>().notNull(),
	provider: text("provider").notNull(),
	providerAccountId: text("provider_account_id").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text("scope"),
	idToken: text("id_token"),
	sessionState: text("session_state"),
});

export const accountsPrimaryKey = primaryKey({
	columns: [accounts.provider, accounts.providerAccountId],
});

export const sessions = pgTable("session", {
	sessionToken: text("session_token").notNull().primaryKey(),
	userId: uuid("user_id")
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

export const forms = pgTable("forms", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name"),
	description: text("description"),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	published: boolean("published"),
});

export const formsRelations = relations(forms, ({ many, one }) => ({
	questions: many(questions),
	user: one(users, {
		fields: [forms.userId],
		references: [users.id],
	}),
	submissions: many(formSubmissions),
}));

export const questions = pgTable("questions", {
	id: uuid("id").primaryKey().defaultRandom(),
	formId: uuid("form_id")
		.notNull()
		.references(() => forms.id),
	text: text("text"),
	fieldType: formElements("field_type"),
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
	form: one(forms, {
		fields: [questions.formId],
		references: [forms.id],
	}),
	fieldOptions: many(fieldOptions),
	answers: many(answers),
}));

export const fieldOptions = pgTable("field_options", {
	id: uuid("id").primaryKey().defaultRandom(),
	text: text("text"),
	value: text("value"),
	questionId: uuid("question_id")
		.notNull()
		.references(() => questions.id),
});

export const fieldOptionsRelations = relations(fieldOptions, ({ one }) => ({
	question: one(questions, {
		fields: [fieldOptions.questionId],
		references: [questions.id],
	}),
}));

export const formSubmissions = pgTable("form_submissions", {
	id: uuid("id").primaryKey().defaultRandom(),
	formId: uuid("form_id")
		.notNull()
		.references(() => forms.id),
});

export const answers = pgTable("answers", {
	id: uuid("id").primaryKey().defaultRandom(),
	value: text("value"),
	questionId: uuid("question_id")
		.notNull()
		.references(() => questions.id),
	formSubmissionId: uuid("form_submission_id")
		.notNull()
		.references(() => formSubmissions.id),
	fieldOptionsId: uuid("field_options_id").references(() => fieldOptions.id),
});

export const answersRelations = relations(answers, ({ one }) => ({
	question: one(questions, {
		fields: [answers.questionId],
		references: [questions.id],
	}),
	formSubmission: one(formSubmissions, {
		fields: [answers.formSubmissionId],
		references: [formSubmissions.id],
	}),
	fieldOption: one(fieldOptions, {
		fields: [answers.fieldOptionsId],
		references: [fieldOptions.id],
	}),
}));

export const formSubmissionsRelations = relations(
	formSubmissions,
	({ one, many }) => ({
		form: one(forms, {
			fields: [formSubmissions.formId],
			references: [forms.id],
		}),
		answers: many(answers),
	})
);
