import { useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useConvex, useConvexAuth } from "convex/react";

export function useAuthRedirect() {
	const navigate = useNavigate();
	const convex = useConvex();

	async function redirectUser() {
		const user = await convex.query(api.user.getMe);

		if (!user) {
			return navigate({ to: "/sign-in", replace: true });
		}

		if (!user.role) {
			return navigate({ to: "/select-role", replace: true });
		}

		if (user.role === "USER") {
			return navigate({ to: "/calendar", replace: true });
		}

		if (user.role === "ADMIN") {
			return navigate({ to: "/dashboard", replace: true });
		}
	}

	return { redirectUser };
}
