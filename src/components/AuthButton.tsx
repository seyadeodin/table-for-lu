import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
} from "convex/react";
import { Button } from "./ui/button";


export default function AuthButton() {
  const { signIn, signOut } = useAuthActions();
  const token = useAuthToken();
  console.log("[LS] -> src/components/Auth.tsx:10 -> token: ", token);

  return (
    <div>
      <AuthLoading>Carregando...</AuthLoading>
      <Unauthenticated>
        <Button className="px-8" type="button" onClick={() => void signIn("github")}>
          Entrar com GitHub
        </Button>
      </Unauthenticated>
      <Authenticated>
        <Button variant="ghost" onClick={() => void signOut()}>
          Sair
        </Button>
      </Authenticated>
    </div>
  );
}
