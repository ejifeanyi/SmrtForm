"use server";

import { forms, questions as dbQuestions, fieldOptions } from "@/db/schema";
import NextAuth from "next-auth";
import { db } from "@/db/index";
import { authOptions } from "../api/auth/[...nextauth]/route";

export async function saveForm(data: any) {
	const { name, description, questions } = data;
	const session = await NextAuth(authOptions);
	const userId = session?.user?.id;

	const newForm = await db
		.insert(forms)
		.values({
			name,
			description,
			userId,
			published: false,
		})
		.returning({ insertedId: forms.id });
	const formId = newForm[0].insertedId;

	const newQuestions = questions.map((question: any) => ({
		text: question.text,
		fieldType: question.fieldType,
		fieldOptions: question.fieldOptions,
		formId,
	}));

	await db.transaction(async (tx) => {
		for (const question of newQuestions) {
			const [{ questionId }] = await tx
				.insert(dbQuestions)
				.values(question)
				.returning({ questionId: dbQuestions.id });

			if (question.fieldOptions && question.fieldOptions.length > 0) {
				await tx.insert(fieldOptions).values(
					question.fieldOptions.map((option: any) => ({
						text: option.text,
						value: option.value,
						questionId,
					}))
				);
			}
		}
	});

	return formId;
}
