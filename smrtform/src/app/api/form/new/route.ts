import { db } from "@/db/index";
import { formSubmissions } from "@/db/schema";
import { validate as validateUuid, v4 as uuidv4 } from "uuid";

export async function POST(request: Request): Promise<Response> {
	try {
		const data = await request.json();

		// Check if formId is provided and valid
		let formId = data.formId;
		if (!formId || !validateUuid(formId)) {
			formId = uuidv4();
		}

		// Insert new form submission into the database
		const newFormSubmission = await db
			.insert(formSubmissions)
			.values({ formId })
			.returning({ insertedId: formSubmissions.id });

		const [{ insertedId }] = newFormSubmission;

		return new Response(JSON.stringify({ formSubmissionsId: insertedId }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error inserting form submission:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
