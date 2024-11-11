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
	labal?: string | null;
};

type FormsPickerProps = {
	options: Array<SelectProps>;
};

const FormsPicker = (props: FormsPickerProps) => {
	const { options } = props;
	return (
		<div>
			{options.map((option) => (
				<p>{option.label}</p>
			))}
		</div>
	);
};

export default FormsPicker;
