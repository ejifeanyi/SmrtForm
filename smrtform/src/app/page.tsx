import Header from "@/components/ui/header";
import LandingPage from "./landing-page";

export default function Home() {
	return (
		<>
			<Header />
			<main className="flex min-h-screen flex-col items-center">
				<LandingPage />
			</main>
		</>
	);
}
