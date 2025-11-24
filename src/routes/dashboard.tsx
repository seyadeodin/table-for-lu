import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export const Route = createFileRoute("/dashboard")({
	component: Dashboard,
});

const chartConfig = {
	reserves: {
		label: "Reservations",
		color: "var(--color-chart-2)",
	},
	count: {
		label: "Bookings",
		color: "var(--color-chart-5))",
	},
} satisfies ChartConfig;

export default function Dashboard() {
	const from = dayjs().subtract(30, "day").startOf("day");
	const to = dayjs().add(60, "day").endOf("day");

	const stats = useQuery(api.reservations.getStatistics, {
		from: from.valueOf(),
		to: to.valueOf(),
	});

	if (!stats) return <div>Loading...</div>;

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 p-8">
			<Card className="col-span-2 md:col-span-1 max-w-64 gap-2 p-4 ">
				<p className="text-lg font-bold">Total de Reservas </p>
				<p className="italic">
					{from.format("DD/MM")} - {to.format("DD/MM")}
				</p>
				<span className="text-5xl font-bold">{stats.total}</span>
			</Card>
			<Card className="col-span-2">
				<CardHeader>
					<CardTitle>Reservas por Data</CardTitle>
					<CardDescription>
						Mostrando dados do período de {from.format("DD/MM")} a{" "}
						{to.format("DD/MM")}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer
						config={chartConfig}
						className="min-h-[200px] w-full max-h-[300px]"
					>
						<AreaChart data={stats.dailyStats} margin={{ left: 12, right: 12 }}>
							<defs>
								<linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
									<stop
										offset="5%"
										stopColor="var(--color-chart-5)"
										stopOpacity={0.8}
									/>
									<stop
										offset="95%"
										stopColor="var(--color-chart-5)"
										stopOpacity={0.2}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="date"
								axisLine={false}
								tickMargin={8}
								tickFormatter={(value) => {
									const date = new Date(value);
									return date.toLocaleDateString("pt-BR", {
										month: "short",
										day: "numeric",
									});
								}}
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel />}
							/>
							<Area
								dataKey="reserves"
								fill="url(#fillDesktop)"
								type="natural"
								stroke="var(--color-accent)"
								stackId="a"
								fillOpacity={0.5}
								strokeWidth={2}
								dot={false}
							/>
						</AreaChart>
					</ChartContainer>
				</CardContent>
			</Card>

			<Card className="col-span-2 md:col-span-1">
				<CardHeader>
					<CardTitle>Reservas por Horário</CardTitle>
					<CardDescription>Distribuição por período do dia</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={chartConfig}>
						<BarChart data={stats.timeStats}>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="time"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent indicator="dashed" />}
							/>
							<Bar
								dataKey="count"
								fill="var(--color-chart-5)"
								fillOpacity={0.4}
								radius={4}
							/>
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>

			<Card className="col-span-2 md:col-span-1">
				<CardHeader>
					<CardTitle>Por dia da Semaana</CardTitle>
					<CardDescription>Reservas por dia da semana</CardDescription>
				</CardHeader>
				<CardContent>
					<ChartContainer config={chartConfig}>
						<BarChart data={stats.weekdayStats}>
							<CartesianGrid vertical={false} />
							<XAxis
								dataKey="day"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
							/>
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent indicator="dashed" />}
							/>
							<Bar
								dataKey="count"
								fill="var(--color-chart-5)"
								fillOpacity={0.7}
								radius={4}
							/>
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>
	);
}
