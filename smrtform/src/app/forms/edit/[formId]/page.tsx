import React from "react";
import { db } from "@/db/index";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Form from "../../Form";

const page = async ({
	params,
}: {
	params: {
		formId: string;
	};
}) => {
	const session = await getServerSession(authOptions);
	const formId = params.formId;

	const userId = session?.user?.id;
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

	if (userId !== form?.userId) {
		return <div>You are not authorized to view this page</div>;
	}

	if (!form) {
		return <div>Form not found</div>;
	}

	return <Form form={form} editMode="Publish" />;
};

export default page;
