import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export const Route = createFileRoute("/select-role")({
	component: SelectRole,
});

function SelectRole() {
	const selectRole = useMutation(api.roles.selectRole);
	const { redirectUser } = useAuthRedirect();
	const user = useQuery(api.user.getMe);

	const [role, setRole] = useState("");

	async function handleSelectRole() {
    if(!user?.email) return;

		await selectRole({
			email: user.email,
			role,
		});
		toast.success("Cargo atualizado com sucesso");
		redirectUser();
	}
	return (
		<div className="bg-background  flex flex-col items-center justify-center h-full">
			<div className="bg-card gap-4 p-10 rounded-xl border-2 border-border flex flex-col justify-center items-center">
				<Select onValueChange={setRole}>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Selecione um cargo" />
					</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="USER">Usuário</SelectItem>
							<SelectItem value="ADMIN">Admnistrador</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>

				<Button className="w-full" onClick={() => handleSelectRole()}>
					Salvar Cargo
				</Button>
			</div>
		</div>
	);
}
