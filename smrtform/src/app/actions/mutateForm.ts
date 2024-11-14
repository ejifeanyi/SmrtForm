"use server";

import { forms, questions as dbQuestions, fieldOptions } from "@/db/schema";
import { db } from "@/db/index";
import { eq } from "drizzle-orm";

// Define types for the form data structure
interface FieldOption {
	text: string;
	value: string;
}

interface Question {
	text: string;
	fieldType: "RadioGroup" | "Select" | "Input" | "Textarea" | "Switch";
	fieldOptions: FieldOption[];
}

interface FormData {
	name: string;
	description: string;
	questions: Question[];
	userId: string;
}

export async function saveForm(data: FormData) {
	const { name, description, questions, userId } = data;

	if (!userId) {
		throw new Error("User ID is required to save the form.");
	}

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

	const newQuestions = questions.map((question: Question) => ({
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
					question.fieldOptions.map((option: FieldOption) => ({
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

export async function publishForm(formId: string) {
	await db.update(forms).set({ published: true }).where(eq(forms.id, formId));
}
