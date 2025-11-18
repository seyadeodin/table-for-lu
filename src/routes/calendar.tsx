import { Calendar } from "@/components/ui/calendar";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import z from "zod";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";

const calendarSchema = z.object({
  date: z.string().optional(),
});

export const Route = createFileRoute("/calendar")({
  validateSearch: (search) => calendarSchema.parse(search),
  component: RouteComponent,
});

const reservationSlots = [
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

function getReservationTimestamps(date: string) {
  return reservationSlots.map((item) => ({
    key: item.key,
    from: dayjs(`${date} ${item.from}:00`).toDate().getTime(),
    to: dayjs(`${date} ${item.to}:00`).toDate().getTime(),
  }));
}

function RouteComponent() {
  const navigate = useNavigate();
  const params = Route.useSearch();
  const date = params.date ?? dayjs().format("YYYY-MM-DD");

  const user = useQuery(api.user.getMe);
  const dateReservations = useQuery(api.reserves.getDateReservations, { date });
  const createReservation = useMutation(api.reserves.createReservation);

  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const reservationSlotsTimestamps = getReservationTimestamps(date);
  const otherUsersReservations = dateReservations
    ?.filter((reservation) => user?.email !== reservation.email)
    .reduce(
      (acc, curr) => {
        const key = reservationSlotsTimestamps.find(
          (item) => item.from === curr.from,
        )?.key;

        if (key) acc[key] += 1;

        return acc;
      },
      { "1": 0, "2": 0, "3": 0 },
    );
  console.log(
    "[LS] -> src/routes/calendar.tsx:64 -> otherUsersReservations: ",
    otherUsersReservations,
  );

  function handleChangeDate(newDate: Date) {
    navigate({
      search: (prev) => ({
        ...prev,
        date: dayjs(newDate).format("YYYY-MM-DD"),
      }),
    });
  }

  function handleSelectTime(key: string) {
    const newSelectedTimes = [...selectedTimes];
    const hasKey = newSelectedTimes.findIndex((item) => item === key);
    if (hasKey === -1) {
      if (selectedTimes.length >= 2) return;
      newSelectedTimes.push(key);
    } else {
      newSelectedTimes.splice(hasKey, 1);
    }

    setSelectedTimes(newSelectedTimes);
  }

  function handleCreateReservation() {
    const reservedPeriods = reservationSlotsTimestamps
      .filter((item) => selectedTimes.includes(item.key))
      .map((item) => ({
        from: item.from,
        to: item.to,
      }));

    createReservation({ date, reserves: reservedPeriods, email: user?.email! });
  }

  function handleRemoveReservation() {
    createReservation({ date, reserves: [], email: user?.email! });
  }

  useEffect(() => {
    if (!dateReservations) return;

    const myDates = dateReservations.filter(
      (date) => date.email === user?.email,
    );

    const fromTime = myDates
      .map((date) => {
        const fromString = dayjs(date.from).format("HH:mm");
        const available = reservationSlots.find(
          (item) => item.from === fromString,
        );
        return available?.key;
      })
      .filter((item) => item !== undefined);

    setSelectedTimes(fromTime);
  }, [dateReservations]);

  return (
    <div className="flex items-center h-full">
    <div className="flex gap-16 justify-center m-auto h-[600px]">
      <div className="flex flex-col gap-8">
        <h3 className="text-2xl font-bold">Reserve seus períodos</h3>
        {reservationSlots.map((item) => (
          <Button
            key={item.key}
            disabled={
              otherUsersReservations
                ? otherUsersReservations?.[item.key] >= 6
                : false
            }
            variant={selectedTimes.includes(item.key) ? "default" : "secondary"}
            onClick={() => handleSelectTime(item.key)}
            className="px-4"
          >
            {item.from} - {item.to}
          </Button>
        ))}

        <Button className="mt-4" onClick={() => handleCreateReservation()}>Salvar Reserva</Button>
        <Button variant="ghost" className="-mt-4" onClick={() => handleRemoveReservation()}>Remover Reserva</Button>
      </div>

      <div>
      <Calendar
        required
        mode="single"
        selected={date ? dayjs(date).add(3, "h").toDate() : new Date()}
        onSelect={handleChangeDate}
        className="rounded-lg border [--cell-size:--spacing(11)] md:[--cell-size:--spacing(13)]"
        buttonVariant="ghost"
      />
      </div>
    </div>
    </div>
  );
}
