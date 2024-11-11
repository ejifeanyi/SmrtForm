"use client";

import React, { useCallback } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type SelectProps = {
	value: string;
	label?: string | null;
};

type FormsPickerProps = {
	options: Array<SelectProps>;
};

const FormsPicker = (props: FormsPickerProps) => {
	const { options } = props;
	return (
		<div className="flex gap-2 items-center">
			<Label className="font-bold">Select a form</Label>
			<Select>
				<SelectTrigger className="w-[180px]">
					<SelectValue placeholder={options[0].label} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{options.map((option) => (
							<SelectItem value={option.value}>{option.label}</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			{options.map((option) => (
				<p>{option.label}</p>
			))}
		</div>
	);
};

export default FormsPicker;
