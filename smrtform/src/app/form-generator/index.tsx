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

type Props = {};

const initialState = {
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
	const [state, setState] = useState(initialState);
	const [open, setOpen] = useState(false);
	const { data: session } = useSession();

	useEffect(() => {
		if (state.message === "success") setOpen(false);
	}, [state.message]);

	const onFormCreate = () => {
		if (session?.user) {
			setOpen(true);
		} else {
			signIn("google");
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
				<form onSubmit={generateForm}>
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
						<Button variant="link">Create Manually</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default FormGenerator;
