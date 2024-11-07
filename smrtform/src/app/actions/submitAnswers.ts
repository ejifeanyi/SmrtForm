"use server";

import { db } from "@/db/index";
import { formSubmissions, answers as dbAnswers } from "@/db/schema";

interface SubmitAnswersData {
	formId: string;
	answers: Answer[];
}

export type Answer = {
	questionId: string;
	value?: string | null;
	fieldOptionsId?: string | null;
};

export async function SubmitAnswers(data: SubmitAnswersData) {
	const { formId, answers } = data;

	try {
		return await db.transaction(async (tx) => {
			// Create form submission first
			const [formSubmission] = await tx
				.insert(formSubmissions)
				.values({ formId })
				.returning({ insertedId: formSubmissions.id });

			const answerPromises = answers.map((answer) =>
				tx
					.insert(dbAnswers)
					.values({
						formSubmissionId: formSubmission.insertedId,
						...answer,
					})
					.returning({ answerId: dbAnswers.id })
			);

			await Promise.all(answerPromises);

			return { success: true, submissionId: formSubmission.insertedId };
		});
	} catch (error) {
		console.error("Error submitting answers:", error);
		throw new Error("Failed to submit answers");
	}
}
