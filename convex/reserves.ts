import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import dayjs from "dayjs"


export const getDateReservations = query({
  args: {
    date: v.string()
  },
  handler: async (ctx, args) => {
    const day = dayjs(args.date);
    const dayStart = day.set("h", 0).set("m", 0).toDate().getTime();
    const dayEnd = day.set("h", 23).set("m", 59).toDate().getTime();

    const reserves = await ctx.db.query("reserves")
      .withIndex("by_reserve", q => q.gte("from", dayStart).lte("from", dayEnd))
      .collect()

    return reserves;
  }
})

export const createReservation = mutation({
  args: {
    reserves: v.array(
      v.object({
        from: v.number(),
        to: v.number(),
      })
    ),
    date: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const day = dayjs(args.date);
    const dayStart = day.set("h", 0).set("m", 0).toDate().getTime();
    const dayEnd = day.set("h", 23).set("m", 59).toDate().getTime();

    const dayReserves = await ctx.db.query("reserves")
      .withIndex("by_reserve", q => q.gte("from", dayStart).lte("from", dayEnd))
      .collect()

    const userReserves = dayReserves.filter(reserve => reserve.email === args.email);

    for (const reserve of userReserves) {
      ctx.db.delete(reserve._id);
    }

    for (const reserve of args.reserves)
      ctx.db.insert("reserves", {
        email: args.email,
        from: reserve.from,
        to: reserve.to,
      })


    //1 check if there are slos available to that period
    //2 delete all uses reserves froom that time period
    //3 create a new one wiuth sent reserves
  }
})

const PREV_PERIOD = 30;
const NEXT_PERIOD = 60;
const PERIOD = 90;
export const getStatistics = query({
  args: {
    from: v.number(),
    to: v.number(),
  },
  handler: async (ctx, args) => {
    const reserves = await ctx.db
      .query("reserves")
      .withIndex("by_reserve", (q) => 
        q.gte("from", args.from).lte("from", args.to)
      )
      .collect();

    const dailyCounts: Record<string, number> = {};
    const timeCounts: Record<string, number> = {};
    const weekdayCounts: Record<string, number> = {};

    for (const reserve of reserves) {
      const date = new Date(reserve.from);

      //UTC
      const dayKey = date.toISOString().split("T")[0]; 
      dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;

      const hours = date.getUTCHours().toString().padStart(2, "0");
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");
      const timeKey = `${hours}:${minutes}`;
      timeCounts[timeKey] = (timeCounts[timeKey] || 0) + 1;
      
      const weekday = date.getUTCDay(); // 0 = Sunday
      weekdayCounts[weekday] = (weekdayCounts[weekday] || 0) + 1;
    }

    const dailyStats = [];
    let current = args.from;

    while (current <= args.to) {
      const dateObj = new Date(current);
      const dateKey = dateObj.toISOString().split("T")[0];
      
      dailyStats.push({
        date: dateKey, // X-axis
        reserves: dailyCounts[dateKey] || 0, // Y-axis
      });

      // Add 1 day (86400000 ms)
      current += 86400000; 
    }

    const timeStats = Object.entries(timeCounts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));

    const days = ["Dom", "Seg", "Ter", "Quar", "Qui", "Sex", "Sab"];
    const weekdayStats = days.map((dayName, index) => ({
      day: dayName,
      count: weekdayCounts[index] || 0,
      fill: "var(--color-primary)", // Optional: for custom bar colors
    }));

    return {
      total: reserves.length,
      dailyStats,   // Use with <LineChart> or <BarChart>
      timeStats,    // Use with <BarChart>
      weekdayStats, // Use with <RadarChart> or <BarChart>
    };
  },
});
