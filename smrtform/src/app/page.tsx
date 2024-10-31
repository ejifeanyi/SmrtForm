import { Button } from "@/components/ui/button";
import FormGenerator from "./form-generator";
import Header from "@/components/ui/header";

export default function Home() {
	return (
		<>
			<Header />
			<div className="flex min-h-screen flex-col items-center justify-between p-24">
				<FormGenerator />
			</div>
		</>
	);
}
