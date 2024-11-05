"use client";

import React, { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateForm } from "@/actions/generateForm";
import { useSession, signIn } from "next-auth/react";
import { useFormStatus } from "react-dom";
import { navigate } from "@/actions/navigateToForm";

type Props = {};

type State = {
	message: string;
	data?: any;
};

const initialState: State = {
	message: "",
	data: undefined,
};

export function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button
			type="submit"
			disabled={pending}
		>
			{pending ? "Generating..." : "Generate"}
		</Button>
	);
}

const FormGenerator = (props: Props) => {
	const [state, setState] = useState<State>(initialState);
	const [open, setOpen] = useState(false);
	const { data: session } = useSession();

	useEffect(() => {
		if (state.message === "success") {
			setOpen(false);
			navigate(state.data.formId);
		}
	}, [state.message]);

	const onFormCreate = () => {
		if (session?.user) {
			setOpen(true);
		} else {
			signIn("google");
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const description = formData.get("description") as string;

		try {
			const result = await generateForm(description);
			console.log("Form generation result:", result);
			setState({
				message: result.message,
				data: result.data ?? null,
			});

			if (result.message === "success") {
				console.log("Generated form data:", result.data);
			} else {
				console.error("Form generation failed:", result.message);
			}
		} catch (error) {
			console.error("Error generating form:", error);
			setState({
				message: "error",
				data: null,
			});
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<Button onClick={onFormCreate}>Create Form</Button>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create New Form</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<Textarea
							id="description"
							name="description"
							required
							placeholder="Share what your form is about, who it's for, and what information you would like to collect."
						/>
					</div>
					<DialogFooter>
						<SubmitButton />
						<Button
							type="button"
							variant="link"
						>
							Create Manually
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default FormGenerator;
