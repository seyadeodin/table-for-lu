import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in")({
  component: SignIn,
});

function SignIn() {
  const { signIn, signOut } = useAuthActions();
  return (
    <div className="bg-zinc-800  w-full h-screen flex justify-center items-center">
      <Button
        className="px-8"
        type="button"
        onClick={() => void signIn("github")}
      >
        Entrar com GitHub
      </Button>
    </div>
  );
}
