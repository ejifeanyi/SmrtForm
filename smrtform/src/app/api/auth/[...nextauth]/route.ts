import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db/index";

export const { handlers, auth, signIn, signOut } = NextAuth({
	session: { strategy: "jwt" },
	adapter: DrizzleAdapter(db),
	pages: {
		signIn: "/login",
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			allowDangerousEmailAccountLinking: true,
		}),
	],
	callbacks: {
		jwt: ({ token, user }: { token: any; user?: any }) => {
			if (user) {
				const u = user as any;
				return {
					...token,
					id: u.id,
					randomKey: u.randomKey,
				};
			}
			return token;
		},
		session({ session, token }: { session: any; token: any }) {
			return {
				...session,
				user: {
					...session.user,
					id: token.id as string,
					randomKey: token.randomKey,
				},
			};
		},
	},
});
