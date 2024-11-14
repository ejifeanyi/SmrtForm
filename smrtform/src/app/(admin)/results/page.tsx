import React from "react";
import { getUserForms } from "@/app/actions/getUserForms";
import { InferSelectModel } from "drizzle-orm";
import { forms } from "@/db/schema";
import FormsPicker from "./FormsPicker";
import ResultsDisplay from "./ResultsDisplay";

const Page = async ({
	searchParams,
}: {
	searchParams: Record<string, string | string[] | undefined>;
}) => {
	const userForms: Array<InferSelectModel<typeof forms>> = await getUserForms();

	if (!userForms || userForms.length === 0) {
		return <div>No forms found</div>;
	}

	const selectOptions = userForms.map((form) => ({
		label: form.name,
		value: form.id,
	}));

	return (
		<div>
			<FormsPicker options={selectOptions} />
			<ResultsDisplay
				formId={searchParams.id ? (searchParams.id as string) : userForms[0].id}
			/>
		</div>
	);
};

export default Page;
