"use server";

import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { saveForm } from "./mutateForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

async function validateInput(description: string) {
	const schema = z.object({
		description: z.string().min(1),
	});

	const parse = schema.safeParse({ description });

	if (!parse.success) {
		console.error("Validation error:", parse.error);
		throw new Error("Failed to parse data");
	}

	return parse.data;
}

async function generateFormContent(description: string) {
	console.log("Generating form content with description:", description);

	const promptExplanation = `Based on the description, generate a survey with 3 fields: name(string) for the form, description(string) for the form, and a JSON object with a 'questions' array for a survey form. Each question should have:
      1. 'text' (string): The question text
      2. 'fieldType' (string): One of: "RadioGroup", "Select", "Input", "Textarea", "Switch"
      3. 'fieldOptions' (array): For RadioGroup and Select, include options like [{text: "Yes", "value": "yes"}]. For other types, use empty array [].
      
      Return ONLY the JSON object, no explanation or markdown formatting. Example format:
      {"name": "The name",
      "description": "the description",
        "questions": [
          {
            "text": "Question text here",
            "fieldType": "RadioGroup",
            "fieldOptions": [{"text": "Option 1", "value": "opt1"}]
          }
        ]
      }`;

	try {
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
		const result = await model.generateContent(
			`${description} ${promptExplanation}`
		);
		const response = await result.response.text();

		const cleanResponse = response.replace(/```json\s*|\s*```/g, "").trim();
		return cleanResponse;
	} catch (error) {
		console.error("Error in form generation:", error);
		throw error;
	}
}

export async function generateForm(description: string) {
	try {
		const session = await getServerSession(authOptions);

		// Retrieve userId from session
		const userId = session?.user?.id;
		if (!userId) {
			throw new Error("User must be authenticated to create a form.");
		}

		const data = await validateInput(description);
		const formContent = await generateFormContent(data.description);

		let parsedContent;
		try {
			parsedContent = JSON.parse(formContent);
		} catch (error) {
			console.error("Error parsing form content:", error);
			throw new Error("Failed to parse form content");
		}

		console.log("parsedContent: ", parsedContent);

		// Save the form with userId included
		const dbFormId = await saveForm({
			name: parsedContent.name,
			description: parsedContent.description,
			questions: parsedContent.questions,
			userId, // Explicitly pass userId here
		});

		console.log("dbFormId: ", dbFormId);

		revalidatePath("/");

		return {
			message: "success",
			data: {
				formId: dbFormId,
				formContent: parsedContent,
			},
		};
	} catch (error) {
		console.error("Error in generateForm:", error);
		if (error instanceof Error) {
			throw new Error(error.message);
		} else {
			throw new Error("An unknown error occurred.");
		}
	}
}
