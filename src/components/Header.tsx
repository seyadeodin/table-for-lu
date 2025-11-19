import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import AuthButton from "./AuthButton";

export default function Header() {
  const { redirectUser } = useAuthRedirect();
  const user = useQuery(api.user.getMe);

  useEffect(() => {
    redirectUser();
  }, [user]);

  return (
    <header className="py-4 px-4 md:px-16 flex items-center bg-secondary text-white shadow-lg justify-between">
      <button
        type="button"
        className="cursor-pointer"
        onClick={() => redirectUser()}
      >
        <h1 className="ml-4 text-xl font-semibold">Tables for Lu</h1>
      </button>
      <AuthButton />
    </header>
  );
}
