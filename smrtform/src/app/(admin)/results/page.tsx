import React from "react";
import { getUserForms } from "@/app/actions/getUserForms";
import { InferSelectModel } from "drizzle-orm";
import { forms } from "@/db/schema";
import FormsPicker from "./FormsPicker";
import ResultsDisplay from "./ResultsDisplay";

interface PageProps {
	params: { [key: string]: string };
	searchParams: Record<string, string | string[] | undefined>;
}

const Page = async ({ searchParams }: PageProps) => {
	const userForms: Array<InferSelectModel<typeof forms>> = await getUserForms();

	if (!userForms || userForms.length === 0) {
		return <div>No forms found</div>;
	}

	const selectOptions = userForms.map((form) => ({
		label: form.name,
		value: form.id,
	}));

	// Parse `id` from `searchParams`
	const formId = searchParams.id ? String(searchParams.id) : userForms[0].id;

	return (
		<div>
			<FormsPicker options={selectOptions} />
			<ResultsDisplay formId={formId} />
		</div>
	);
};

export default Page;
