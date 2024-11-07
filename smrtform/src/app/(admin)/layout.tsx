"use client";

import Header from "@/components/ui/header";
import DashboardNav from "@/components/navigation/navbar";
import { SessionProvider } from "next-auth/react";
import FormGenerator from "../form-generator";
import { SidebarNavItem } from "../../../types/nav-types";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const dashboardConfig: {
		sidebarNav: SidebarNavItem[];
	} = {
		sidebarNav: [
			{
				title: "My Forms",
				href: "/view-forms",
				icon: "library",
				disabled: false,
				external: false,
			},
			{
				title: "Results",
				href: "/results",
				icon: "list",
				disabled: false,
				external: false,
			},
			{
				title: "Analytics",
				href: "/analytics",
				icon: "lineChart",
				disabled: false,
				external: false,
			},
			{
				title: "Charts",
				href: "/charts",
				icon: "pieChart",
				disabled: false,
				external: false,
			},
			{
				title: "Settings",
				href: "/settings",
				icon: "settings",
				disabled: false,
				external: false,
			},
		],
	};

	return (
		<div className="flex min-h-screen flex-col space-y-6">
			<Header />
			<div className="container grid gap-12 md:grid-cols-[200px_1fr] flex-1">
				<aside className="hidden w-[200px] flex-col md:flex pr-2 border-r justify-between">
					<DashboardNav items={dashboardConfig.sidebarNav} />
				</aside>
				<main className="flex w-full flex-1 flex-col overflow-hidden">
					<header className="flex items-center">
						<h1 className="text-4xl m-5 p-4 font-semibold">Dashboard</h1>
						<SessionProvider>
							<FormGenerator />
						</SessionProvider>
					</header>
					<hr className="my-2" />
					{children}
				</main>
			</div>
		</div>
	);
}
