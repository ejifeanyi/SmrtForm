import React from "react";
import Table from "./Table";
import { forms } from "@/db/schema";
import { db } from "@/db/index";
import { eq } from "drizzle-orm";

type Props = {
	formId: string;
};

const ResultsDisplay = async ({ formId }: Props) => {
	const form = await db.query.forms.findFirst({
		where: eq(forms.id, formId),
		with: {
			questions: {
				with: {
					fieldOptions: true,
				},
			},
			submissions: {
				with: {
					answers: {
						with: {
							fieldOption: true,
						},
					},
				},
			},
		},
	});

	if (!form) return null;
	if (!form.submissions || form.submissions.length === 0) {
		return (
			<p className="text-gray-600 p-4">No submissions on this form yet!</p>
		);
	}

	return (
		<div className="w-full">
			<Table
				data={form.submissions}
				questions={form.questions}
			/>
		</div>
	);
};

export default ResultsDisplay;
