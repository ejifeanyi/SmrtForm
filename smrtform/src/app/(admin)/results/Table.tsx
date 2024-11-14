"use client";

import * as React from "react";
import { InferSelectModel } from "drizzle-orm";
import { answers, questions, formSubmissions, fieldOptions } from "@/db/schema";

import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";

type FieldOption = InferSelectModel<typeof fieldOptions>;

type Answer = InferSelectModel<typeof answers> & {
	fieldOption?: FieldOption | null;
};

// Updated Question type to match your database schema
type Question = InferSelectModel<typeof questions> & {
	fieldOptions: FieldOption[];
	text: string | null;
	fieldType: "RadioGroup" | "Select" | "Input" | "Textarea" | "Switch" | null;
	formId: string;
};

type FormSubmission = InferSelectModel<typeof formSubmissions> & {
	answers: Answer[];
};

interface TableProps {
	data: FormSubmission[];
	questions: Question[];
}

const columnHelper = createColumnHelper<FormSubmission>();

const Table: React.FC<TableProps> = ({ data, questions }) => {
	const columns = React.useMemo(
		() => [
			columnHelper.accessor("id", {
				cell: (info) => info.getValue(),
				header: "ID",
			}),
			...questions.map((question) =>
				columnHelper.accessor(
					(row) => {
						const answer = row.answers.find(
							(a) => a.questionId === question.id
						);
						if (!answer) return "N/A";

						return answer.fieldOption?.text ?? answer.value ?? "N/A";
					},
					{
						header: () => question.text ?? "Untitled Question",
						id: question.id.toString(),
						cell: (info) => info.getValue(),
					}
				)
			),
		],
		[questions]
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="p-2 mt-4">
			<div className="shadow overflow-hidden border border-gray-200 sm:rounded-lg">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-6 py-3 text-left font-bold text-xs text-gray-500 uppercase tracking-wider"
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext()
											  )}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{table.getRowModel().rows.map((row) => (
							<tr key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<td
										key={cell.id}
										className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Table;
