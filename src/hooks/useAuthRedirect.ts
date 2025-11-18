import { useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useConvexAuth, useQuery } from "convex/react";
import { useEffect } from "react";

export function useAuthRedirect(
  //state: 'authenticated' | 'unauthenticated'
  //redirectTo: string
) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();

  const user = useQuery(api.user.getMe);

  useEffect(() => {
    async function redirectUser() {
      if (isLoading) {
        return;
      }

      if (!isAuthenticated || !user) {
        navigate({ to: "/sign-in", replace: true });
        return;
      }

      if(isAuthenticated && !user.role) {
        navigate({ to: "/select-role", replace: true});
        return;
      }

      if (isAuthenticated) {
        navigate({ to: "/calendar", replace: true });
        return;
      }
    }

    redirectUser();
    console.log("rodei")
  }, [user]);
}
