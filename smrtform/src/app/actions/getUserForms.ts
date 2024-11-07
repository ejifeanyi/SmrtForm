"use server";

import { db } from "@/db/index";
import { eq } from "drizzle-orm";
import { forms } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function getUserForms() {
	const session = await getServerSession(authOptions);
	const userId = session?.user?.id;

	if (!userId) {
		return [];
	}

	const userForms = await db.query.forms.findMany({
		where: eq(forms.userId, userId),
	});
	return userForms;
}
