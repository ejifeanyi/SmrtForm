"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { SubmitAnswers } from "../actions/submitAnswers";
import FormPublishSuccess from "./FormPublishSuccess";
import FormField from "./FormField";
import {
	Form as FormComponent,
	FormField as ShadcnFormField,
	FormItem,
	FormLabel,
	FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type {
	FormSelectModel,
	FieldOptionSelectModel,
} from "../../../types/form-types";
import { publishForm } from "../actions/mutateForm";

interface QuestionWithOptions {
	id: string;
	text: string | null;
	formId: string;
	fieldType: "RadioGroup" | "Select" | "Input" | "Textarea" | "Switch" | null;
	fieldOptions: Array<FieldOptionSelectModel>;
}

interface FormProps {
	form: {
		id: string;
		name: string;
		description: string;
		questions: QuestionWithOptions[];
	} & FormSelectModel;
	editMode?: boolean;
}

interface FormValues {
	[key: string]: string;
}

const Form = ({ form: initialForm, editMode = false }: FormProps) => {
	const { questions, name, description, id: formId } = initialForm;
	const form = useForm<FormValues>({
		defaultValues: createDefaultValues(questions),
	});
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [successDialogOpen, setSuccessDialogOpen] = useState(false);

	const formatAnswers = (data: FormValues) => {
		return Object.entries(data)
			.map(([key, value]) => {
				const questionId = key.replace("question_", "");
				const question = questions.find((q) => q.id === questionId);

				if (!question) return null;

				if (
					question.fieldType === "RadioGroup" ||
					question.fieldType === "Select"
				) {
					if (value.startsWith("answerId_")) {
						return {
							questionId,
							fieldOptionsId: value.replace("answerId_", ""),
							value:
								question.fieldOptions.find(
									(opt) => opt.id === value.replace("answerId_", "")
								)?.text || null,
						};
					}
				}

				return {
					questionId,
					fieldOptionsId: null,
					value:
						question.fieldType === "Switch" ? String(value === "true") : value,
				};
			})
			.filter(
				(answer): answer is NonNullable<typeof answer> => answer !== null
			);
	};

	const onSubmit = async (data: FormValues) => {
		try {
			setSubmitting(true);
			if (editMode) {
				await publishForm(formId);
				setSuccessDialogOpen(true);
			} else {
				const answers = formatAnswers(data);
				const result = await SubmitAnswers({ formId, answers });

				if (result.success) {
					router.push(`/forms/${formId}/success`);
				} else {
					throw new Error("Submission failed");
				}
			}
		} catch (error) {
			console.error("Error submitting form:", error);
			alert("An error occurred. Please try again later.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="text-center">
			<h1 className="text-lg font-bold py-3">{name}</h1>
			<h3 className="text-md">{description}</h3>
			<FormComponent {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="grid w-full max-w-3xl gap-6 my-4 text-left"
				>
					{questions.map((question, index) => (
						<ShadcnFormField
							key={question.id}
							control={form.control}
							name={`question_${question.id}`}
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-base mt-3">
										{index + 1}. {question.text}
									</FormLabel>
									<FormControl>
										<FormField
											element={question}
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					))}
					<Button
						type="submit"
						disabled={submitting}
					>
						{submitting ? "Submitting..." : editMode ? "Publish" : "Submit"}
					</Button>
				</form>
			</FormComponent>
			<FormPublishSuccess
				formId={formId}
				open={successDialogOpen}
				onOpenChange={setSuccessDialogOpen}
			/>
		</div>
	);
};

export default Form;

const createDefaultValues = (questions: QuestionWithOptions[]) =>
	questions.reduce((acc, question) => {
		acc[`question_${question.id}`] = "";
		return acc;
	}, {} as FormValues);
