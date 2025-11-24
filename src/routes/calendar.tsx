import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ptBR } from "date-fns/locale";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const calendarSchema = z.object({
	date: z.string().optional(),
});

export const Route = createFileRoute("/calendar")({
	validateSearch: (search) => calendarSchema.parse(search),
	component: RouteComponent,
});

const SLOT_CONFIG = [
	{
		key: "1",
		from: "12:00",
		to: "12:30",
	},
	{
		key: "2",
		from: "12:30",
		to: "13:00",
	},
	{
		key: "3",
		from: "13:00",
		to: "13:30",
	},
] as const;

function getSlotTimestamps(
	dateStr: string,
	slot: (typeof SLOT_CONFIG)[number],
) {
	// Parse specifically as YYYY-MM-DD HH:mm to ensure local time consistency
	const start = dayjs(`${dateStr} ${slot.from}`, "YYYY-MM-DD HH:mm");
	const end = dayjs(`${dateStr} ${slot.to}`, "YYYY-MM-DD HH:mm");

	return {
		from: start.toDate().getTime(),
		to: end.toDate().getTime(),
	};
}

function RouteComponent() {
	const navigate = useNavigate({ from: Route.fullPath });
	const params = Route.useSearch();
	const date = params.date ?? dayjs().format("YYYY-MM-DD");

	const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

	const user = useQuery(api.user.getMe);
	const dateReservations = useQuery(api.reservations.getDateReservations, { date });
	const  monthReservations = useQuery(api.reservations.getPeriodReservations, { month: selectedMonth.toDateString(), email: user?.email! });
  console.log("[LS] -> src/routes/calendar.tsx:62 -> monthReservations: ", monthReservations)
	const createReservation = useMutation(api.reservations.createReservation);


	const slotsData =
		(() => {
			if (!dateReservations || !user) return null;

			return SLOT_CONFIG.map((slot) => {
				const { from, to } = getSlotTimestamps(date, slot);

				const relevantReserves = dateReservations.filter(
					(r) => r.from === from && r.to === to,
				);

				const othersCount = relevantReserves.filter(
					(r) => r.email !== user.email,
				).length;
				const isBookedByMe = relevantReserves.some(
					(r) => r.email === user.email,
				);
				const isFull = othersCount >= 6;

				return {
					...slot,
					timestamp: { from, to },
					isBookedByMe,
					isFull,
				};
			});
		})() ?? [];

	function handleChangeDate(newDate: Date | undefined) {
		if (!newDate) return;
		navigate({
			search: (prev) => ({
				...prev,
				date: dayjs(newDate).format("YYYY-MM-DD"),
			}),
		});
	}

	function handleSelectTime(key: string) {
		setSelectedTimes((prev) => {
			const isSelected = prev.includes(key);
			if (isSelected) {
				return prev.filter((k) => k !== key);
			}
			if (prev.length >= 2) return prev;
			return [...prev, key];
		});
	}

	async function handleCreateReservation() {
		if (!slotsData || !user?.email) return;

		const reservedPeriods = slotsData
			.filter((item) => selectedTimes.includes(item.key))
			.map((item) => ({
				from: item.timestamp.from,
				to: item.timestamp.to,
			}));

		await createReservation({
			date,
			reserves: reservedPeriods,
			email: user.email,
		});
		toast.success("Seus horários foram reservados com sucesso.");
	}

	async function handleRemoveReservation() {
    if(!user?.email) return;

		await createReservation({ date, reserves: [], email: user.email });
		toast.success("Sua reserva foi removida com sucesso");
	}

	useEffect(() => {
		if (!dateReservations) return;

		const myDates = dateReservations.filter(
			(date) => date.email === user?.email,
		);

		const fromTime = myDates
			.map((date) => {
				const fromString = dayjs(date.from).format("HH:mm");
				const available = SLOT_CONFIG.find((item) => item.from === fromString);
				return available?.key;
			})
			.filter((item) => item !== undefined);

		setSelectedTimes(fromTime);
	}, [dateReservations]);

	return (
		<div className="flex items-center just h-full">
			<div className="mt-32 md:mt-auto flex  md:flex-row flex-col-reverse gap-16 justify-center m-auto h-[600px]">
				<div className="flex flex-col gap-8">
					<h3 className="text-2xl font-bold">Reserve seus horários</h3>
					{slotsData.map((item) => (
						<Button
							key={item.key}
							disabled={item.isFull}
							variant={
								selectedTimes.includes(item.key) ? "default" : "secondary"
							}
							onClick={() => handleSelectTime(item.key)}
							className="px-4"
						>
							{item.from} - {item.to}
						</Button>
					))}

					<Button className="mt-4" onClick={() => handleCreateReservation()}>
						Salvar Reserva
					</Button>
					<Button
						variant="ghost"
						className="-mt-4"
						onClick={() => handleRemoveReservation()}
					>
						Remover Reserva
					</Button>
				</div>

				<div>
					<Calendar
						required
            locale={ptBR}
						mode="single"
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
						selected={date ? dayjs(date).add(3, "h").toDate() : new Date()}
						onSelect={handleChangeDate}
						className="rounded-lg border [--cell-size:--spacing(9)] md:[--cell-size:--spacing(13)]"
						buttonVariant="ghost"
            components={{
              DayButton: ({ day, ...props  }) => {
                const dayStart = dayjs(day.date).startOf("day").valueOf();
                const dayEnd = dayjs(day.date).endOf("day").valueOf();
                const dayReservations = monthReservations?.filter(reservation =>
                reservation.from > dayStart && reservation.from < dayEnd ) ?? [];
                const isSelectedDay = dayjs(date).isSame(day.date, "day");

                return(
                  <button {...props} className={cn(props.className, "px-4 py-3 relative", isSelectedDay && "bg-primary rounded-lg text-background")}>
                    <span>{day.date.getDate()}</span>
                    <div className="flex justify-between mt-1 transition-all h-1">
                    {dayReservations.map((item) => (
                      <div key={item._id} className="w-1 h-1 bg-chart-5 rounded-full transition-all "/>
                    ))}
                    </div>
                  </button>
                )
              }
            }}
					/>
				</div>
			</div>
		</div>
	);
}
