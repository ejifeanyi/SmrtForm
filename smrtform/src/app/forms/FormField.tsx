import React, { ChangeEvent } from "react";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormLabel } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { QuestionSelectModel } from "../../../types/form-types";
import { FieldOptionSelectModel } from "../../../types/form-types";
import { Label } from "@/components/ui/label";

type Props = {
	element: QuestionSelectModel & {
		fieldOptions: Array<FieldOptionSelectModel>;
	};
	value: string | boolean;
	onChange: (value: string | boolean | ChangeEvent<HTMLInputElement>) => void;
};

const FormField = ({ element, value, onChange }: Props) => {
	if (!element) return null;

	const components = {
		Input: () => (
			<Input
				type="text"
				value={value as string}
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
				value={value as string}
				onChange={(e) => onChange(e.target.value)}
			/>
		),
		Select: () => (
			<Select
				value={value as string}
				onValueChange={onChange}
			>
				<SelectTrigger>
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					{element.fieldOptions.map((option) => (
						<SelectItem
							key={`${option.text}_${option.id}`}
							value={`answerId_${option.id}`}
						>
							{option.text}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		),
		RadioGroup: () => (
			<RadioGroup
				value={value as string}
				onValueChange={onChange}
			>
				{element.fieldOptions.map((option) => (
					<div
						key={`${option.text}_${option.id}`}
						className="flex items-center space-x-2"
					>
						<FormControl>
							<RadioGroupItem
								value={`answerId_${option.id}`}
								id={option?.value.toString() || `answerId_${option.id}`}
							>
								{option.text}
							</RadioGroupItem>
						</FormControl>
						<Label className="text-base">{option.text}</Label>
					</div>
				))}
			</RadioGroup>
		),
	};

	return element.fieldType && components[element.fieldType]
		? components[element.fieldType]()
		: null;
};

export default FormField;
