"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function generateForm(event: React.FormEvent<HTMLFormElement>) {
	event.preventDefault(); // Prevent default form submission

	const formData = new FormData(event.currentTarget); // Extract FormData from the event

	const schema = z.object({
		description: z.string().min(1),
	});

	const parse = schema.safeParse({
		description: formData.get("description"),
	});

	if (!parse.success) {
		console.log(parse.error);
		return {
			message: "Failed to parse data",
		};
	}

	if (!process.env.OPENAI_API_KEY) {
		return {
			message: "No OpenAI API Key found",
		};
	}

	const data = parse.data;
	const promptExplaination =
		"Based on the description, generate a survey with questions array where every element has 2 fields: text and the fieldType and fieldType can be of these options RadioGroup, Select, Input, Textarea, Switch; and return it in json format. For RadioGroup, and Select types also return fieldOptions array with text and value fields. for example, for RadioGroup, and Select types, the field options array can be [{text: 'Yes', value: 'yes'}, {text: 'no', value: 'no'}] and for Input, Textarea, and Switch types, the field options array can be empty. For example, for Input, Textarea, and Switch types, the field options array can be []";

	try {
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
						content: `${data.description} ${promptExplaination}`,
					},
				],
			}),
		});

		if (!response.ok) {
			console.log(`Error: ${response.status} ${response.statusText}`);
			return { message: "Failed to create form" };
		}

		const json = await response.json();

		revalidatePath("/");
		return {
			message: "success",
			data: json,
		};
	} catch (error) {
		console.error("Error creating form:", error);
		return {
			message: "Failed to create form",
		};
	}
}
