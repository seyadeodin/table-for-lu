import { createFileRoute } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/select-role")({
  component: SelectRole,
});

function SelectRole() {
  const selectRole = useMutation(api.roles.selectRole);
  const user = useQuery(api.user.getMe);

  const [role, setRole] = useState("");

  return (
    <div className="bg-gray-950  flex flex-col items-center justify-center h-full">
      <div className="bg-gray-900 gap-4 p-10 rounded-xl border-1 border-gray-700 flex flex-col justify-center items-center">
        <Select onValueChange={setRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione um cargo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="USER">Usuário</SelectItem>
              <SelectItem value="ADMIN">Adminsitrador</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          className="w-full"
          onClick={() =>
            void selectRole({
              email: user?.email!,
              role,
            })
          }
        >
          Salvar Cargo
        </Button>
      </div>
    </div>
  );
}
