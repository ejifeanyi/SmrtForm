import React from "react";
import { db } from "@/db/index";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";
import Form from "../Form";

const page = async ({
	params,
}: {
	params: {
		formId: string;
	};
}) => {
	const formId = params.formId;

	const form = await db.query.forms.findFirst({
		where: eq(forms.id, formId),
		with: {
			questions: {
				with: {
					fieldOptions: true,
				},
			},
		},
	});

	if (!form) {
		return <div>Form not found</div>;
	}

	return (
		<Form
			form={form}
			editMode={false}
		/>
	);
};

export default page;
