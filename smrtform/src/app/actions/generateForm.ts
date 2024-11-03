"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateForm(description: string) {
	console.log("Starting form generation with description:", description);

	const schema = z.object({
		description: z.string().min(1),
	});

	const parse = schema.safeParse({
		description,
	});

	if (!parse.success) {
		console.log("Validation error:", parse.error);
		return {
			message: "Failed to parse data",
		};
	}

	if (!process.env.GEMINI_API_KEY) {
		console.log("Missing Google Gemini API Key");
		return {
			message: "No Google Gemini API Key found",
		};
	}

	const data = parse.data;
	// Modified prompt to be more explicit about JSON structure
	const promptExplanation = `Generate a JSON object with a 'questions' array for a survey form. Each question should have:
  1. 'text' (string): The question text
  2. 'fieldType' (string): One of: "RadioGroup", "Select", "Input", "Textarea", "Switch"
  3. 'fieldOptions' (array): For RadioGroup and Select, include options like [{text: "Yes", value: "yes"}]. For other types, use empty array [].
  
  Return ONLY the JSON object, no explanation or markdown formatting. Example format:
  {
    "questions": [
      {
        "text": "Question text here",
        "fieldType": "RadioGroup",
        "fieldOptions": [{"text": "Option 1", "value": "opt1"}]
      }
    ]
  }`;

	try {
		console.log("Setting up Google Gemini client...");
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

		console.log("Sending request to Google Gemini...");
		const result = await model.generateContent(
			`${data.description} ${promptExplanation}`
		);

		const response = result.response.text();
		console.log("Raw response:", response); // Debug log

		try {
			// Enhanced cleaning of the response
			let cleanResponse = response
				.replace(/```json\s*|\s*```/g, "") // Remove JSON code blocks
				.replace(/^\s*\{\s*/, "{") // Clean start
				.replace(/\s*\}\s*$/, "}") // Clean end
				.trim();

			// Debug log
			console.log("Cleaned response:", cleanResponse);

			// Additional validation to ensure we have a JSON object
			if (!cleanResponse.startsWith("{") || !cleanResponse.endsWith("}")) {
				throw new Error("Response is not a JSON object");
			}

			const parsedContent = JSON.parse(cleanResponse);

			// Validate basic structure
			if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
				throw new Error("Invalid response structure - missing questions array");
			}

			console.log("Successfully parsed JSON:", parsedContent);

			revalidatePath("/");
			return {
				message: "success",
				data: parsedContent,
			};
		} catch (e) {
			console.error("JSON parsing error:", e);
			console.error("Failed response:", response); // Log the failed response
			return {
				message: "Failed to parse JSON response",
				error: e instanceof Error ? e.message : "Unknown parsing error",
			};
		}
	} catch (error) {
		console.error("Error in form generation:", error);
		return {
			message: "Failed to create form",
		};
	}
}
