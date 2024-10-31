"use client";

import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./button";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <div>Loading...</div>;
	}

	console.log("session", session);

	return (
		<header className="border-b">
			<nav className="bg-white border-gray-200 px-4 py-2.5">
				<div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
					<h1>smrtForm</h1>
					{session?.user ? (
						<div className="flex items-center gap-4">
							{session.user.image && (
								<Image
									src={session.user.image}
									alt={session.user.name || "User"}
									width={32}
									height={32}
									className="rounded-full"
								/>
							)}
							<Button onClick={() => signOut()}>Sign out</Button>
						</div>
					) : (
						<Button
							onClick={() => signIn("google")}
							variant="link"
						>
							Sign in
						</Button>
					)}
				</div>
			</nav>
		</header>
	);
};

export default Header;
