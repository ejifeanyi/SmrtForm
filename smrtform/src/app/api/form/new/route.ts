import { db } from "@/db/index";
import {
	forms,
	formSubmissions,
	answers as dbAnswers,
	questions,
} from "@/db/schema";

export async function POST(request: Request): Promise<Response> {
	const data = await request.json();
	const newFormsubmission = await db
		.insert(formSubmissions)
		.values({
			formId: data.formId,
		})
		.returning({
			insertedId: formSubmissions.id,
		});

	const [{ insertedId }] = newFormsubmission;

	return Response.json({ formSubmissionsId: insertedId }, { status: 200 });
}
