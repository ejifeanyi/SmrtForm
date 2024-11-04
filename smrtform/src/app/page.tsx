import FormGenerator from "./form-generator";
import Header from "@/components/ui/header";
import { db } from "@/db/index";
import { forms } from "@/db/schema";
import FormsList from "./forms/FormsList";

export default async function Home() {
	const formsData = await db.select().from(forms);
	console.log(formsData);
	return (
		<>
			<Header />
			<div className="flex min-h-screen flex-col items-center p-24">
				<FormGenerator />
				<FormsList forms={formsData} />
			</div>
		</>
	);
}
