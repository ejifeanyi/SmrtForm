// FormField.tsx
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	QuestionSelectModel,
	FieldOptionSelectModel,
} from "../../../types/form-types";

interface FormFieldProps {
	element: QuestionSelectModel & {
		fieldOptions: Array<FieldOptionSelectModel>;
	};
	value: string | boolean;
	onChange: (value: string | boolean) => void;
}

const FormField: React.FC<FormFieldProps> = ({ element, value, onChange }) => {
	if (!element?.fieldType) return null;

	const fieldComponents: Record<string, () => JSX.Element | null> = {
		Input: () => (
			<Input
				type="text"
				value={String(value)}
				onChange={(e) => onChange(e.target.value)}
			/>
		),
		Switch: () => (
			<Switch
				checked={Boolean(value)}
				onCheckedChange={(checked) => onChange(checked)}
			/>
		),
		Textarea: () => (
			<Textarea
				value={String(value)}
				onChange={(e) => onChange(e.target.value)}
			/>
		),
		Select: () => (
			<Select
				value={String(value)}
				onValueChange={onChange}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					{element.fieldOptions.map((option) => (
						<SelectItem
							key={option.id}
							value={`answerId_${option.id}`}
						>
							{option.text || ""}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		),
		RadioGroup: () => (
			<RadioGroup
				value={String(value)}
				onValueChange={onChange}
			>
				{element.fieldOptions.map((option) => (
					<div
						key={option.id}
						className="flex items-center space-x-2"
					>
						<RadioGroupItem
							value={`answerId_${option.id}`}
							id={`answerId_${option.id}`}
						/>
						<Label
							htmlFor={`answerId_${option.id}`}
							className="text-base"
						>
							{option.text || ""}
						</Label>
					</div>
				))}
			</RadioGroup>
		),
	};

	return fieldComponents[element.fieldType]?.() || null;
};

export default FormField;
