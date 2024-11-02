import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql", // Specify the database type as "postgresql"
	dbCredentials: {
		host: process.env.DB_HOST!,
		port: Number(process.env.DB_PORT!),
		user: process.env.DB_USER!,
		password: process.env.DB_PASSWORD!,
		database: process.env.DB_NAME!,
		ssl: { rejectUnauthorized: false }, // Ignore self-signed certificate errors
	},
} satisfies Config;
