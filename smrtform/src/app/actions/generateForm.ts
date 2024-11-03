"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

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

	if (!process.env.OPENAI_API_KEY) {
		console.log("Missing OpenAI API Key");
		return {
			message: "No OpenAI API Key found",
		};
	}

	const data = parse.data;
	const promptExplanation =
		"Based on the description, generate a survey with questions array where every element has 2 fields: text and the fieldType and fieldType can be of these options RadioGroup, Select, Input, Textarea, Switch; and return it in json format. For RadioGroup, and Select types also return fieldOptions array with text and value fields. for example, for RadioGroup, and Select types, the field options array can be [{text: 'Yes', value: 'yes'}, {text: 'no', value: 'no'}] and for Input, Textarea, and Switch types, the field options array can be empty. For example, for Input, Textarea, and Switch types, the field options array can be []";

	try {
		console.log("Sending request to OpenAI...");
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
			method: "POST",
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "system",
						content: `${data.description} ${promptExplanation}`,
					},
				],
			}),
		});

		if (!response.ok) {
			console.error("OpenAI API Error:", {
				status: response.status,
				statusText: response.statusText,
			});
			return { message: "Failed to create form" };
		}

		const json = await response.json();
		console.log("OpenAI Response:", JSON.stringify(json, null, 2));

		if (json.choices && json.choices[0]) {
			console.log("Generated Content:", json.choices[0].message.content);
			try {
				const parsedContent = JSON.parse(json.choices[0].message.content);
				console.log("Parsed JSON Content:", parsedContent);
			} catch (e) {
				console.log("Content is not valid JSON:", e);
			}
		}

		revalidatePath("/");
		return {
			message: "success",
			data: json,
		};
	} catch (error) {
		console.error("Error in form generation:", error);
		return {
			message: "Failed to create form",
		};
	}
}
