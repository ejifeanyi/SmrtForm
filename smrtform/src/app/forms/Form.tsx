"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
	FormSelectModel,
	FieldOptionSelectModel,
} from "../../../types/form-types";
import {
	Form as FormComponent,
	FormField as ShadcnFormField,
	FormItem,
	FormLabel,
	FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import FormField from "./FormField";
import { publishForm } from "../actions/mutateForm";
import FormPublishSuccess from "./FormPublishSuccess";

type Props = {
	form: Form;
	editMode?: boolean;
};

type QuestionWithOptions = {
	id: string;
	text: string | null;
	formId: string;
	fieldType: "RadioGroup" | "Select" | "Input" | "Textarea" | "Switch" | null;
	fieldOptions: Array<FieldOptionSelectModel>;
};

interface Form extends FormSelectModel {
	questions: Array<QuestionWithOptions>;
}

// Define the form values type
type FormValues = {
	[key: string]: string;
};

// Define the formatted data type
type FormattedData = {
	[key: string]: {
		questionText: string;
		fieldType: string;
		value:
			| string
			| {
					optionId: string;
					value: string;
			  };
	};
};

const Form = (props: Props) => {
	const form = useForm<FormValues>({
		defaultValues: props.form.questions.reduce(
			(acc, question) => ({
				...acc,
				[`question_${question.id}`]: "",
			}),
			{} as FormValues
		),
	});

	const router = useRouter();
	const { editMode } = props;
	const [successDialogOpen, setSuccessDialogOpen] = useState(false);

	const handleDialogChange = (open: boolean) => {
		setSuccessDialogOpen(open);
	};

	const onSubmit = async (data: FormValues) => {
		if (editMode) {
			await publishForm(props.form.id);
			setSuccessDialogOpen(true);
		} else {
			// Transform the form data into a more structured format
			const formattedData = Object.entries(data).reduce<FormattedData>(
				(acc, [key, value]) => {
					const questionId = key.replace("question_", "");
					const question = props.form.questions.find(
						(q) => q.id === questionId
					);

					// Handle different field types
					let formattedValue: string | { optionId: string; value: string } =
						value;
					if (
						question?.fieldType === "RadioGroup" ||
						question?.fieldType === "Select"
					) {
						// For radio/select, if the value starts with answerId_, keep just the ID
						if (typeof value === "string" && value.startsWith("answerId_")) {
							const optionId = value.replace("answerId_", "");
							const option = question.fieldOptions.find(
								(opt) => opt.id === optionId
							);
							formattedValue = {
								optionId,
								value: option?.text || value,
							};
						}
					}

					return {
						...acc,
						[questionId]: {
							questionText: question?.text || "",
							fieldType: question?.fieldType || "",
							value: formattedValue,
						},
					};
				},
				{}
			);

			console.log("Formatted Form Data:", formattedData);
		}
	};

	return (
		<div className="text-center">
			<h1 className="text-lg font-bold py-3">{props.form.name}</h1>
			<h3 className="text-md">{props.form.description}</h3>
			<FormComponent {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="grid w-full max-w-3xl items-center gap-6 my-4 text-left"
				>
					{props.form.questions.map(
						(question: QuestionWithOptions, index: number) => (
							<ShadcnFormField
								control={form.control}
								name={`question_${question.id}`}
								key={`${question.text}_${index}`}
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-base mt-3">
											{index + 1}. {question.text}
										</FormLabel>
										<FormControl>
											<FormField
												element={question}
												key={index}
												value={field.value}
												onChange={field.onChange}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						)
					)}
					<Button type="submit">{editMode ? "Publish" : "Submit"}</Button>
				</form>
			</FormComponent>
			<FormPublishSuccess
				formId={props.form.id}
				open={successDialogOpen}
				onOpenChange={handleDialogChange}
			/>
		</div>
	);
};

export default Form;
