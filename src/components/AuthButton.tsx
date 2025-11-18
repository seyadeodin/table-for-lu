import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
} from "convex/react";
import { Button } from "./ui/button";
import { api } from "convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { Link } from "@tanstack/react-router";

export default function AuthButton() {
  const { signIn, signOut } = useAuthActions();
  const user = useQuery(api.user.getMe);

  return (
    <div>
      <AuthLoading>Carregando...</AuthLoading>
      <Unauthenticated>
        <Button
          className="px-8"
          type="button"
          onClick={() => void signIn("github")}
        >
          Entrar com GitHub
        </Button>
      </Unauthenticated>
      <Authenticated>
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex gap-2 cursor-pointer">
            <Avatar>
              <AvatarImage src={user?.image} />
              <AvatarFallback>VC</AvatarFallback>
            </Avatar>
            <span className="text-base font-bold">{user?.name?.split(" ")[0]}</span>
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="bg-secondary p-4 rounde-lg flex flex-col">
            <Link to="/select-role">
                Trocar de Cargo
                </Link>
            <Button variant="ghost" className="cursor-pointer" onClick={() => void signOut()}>
              Sair
            </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </Authenticated>
    </div>
  );
}
