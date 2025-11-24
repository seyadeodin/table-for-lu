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
    if(args.reserves.length > 3) throw new Error("Apenas dois períodos podem ser reservados por dia");

    const day = dayjs(args.date);
    const dayStart = day.startOf("day").valueOf();
    const dayEnd = day.endOf("day").valueOf();

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
  }
})

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
        date: dateKey,
        reserves: dailyCounts[dateKey] || 0,
      });

      current += 86400000; 
    }

    const timeStats = Object.entries(timeCounts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => a.time.localeCompare(b.time));

    const days = ["Dom", "Seg", "Ter", "Quar", "Qui", "Sex", "Sab"];
    const weekdayStats = days.map((dayName, index) => ({
      day: dayName,
      count: weekdayCounts[index] || 0,
      fill: "var(--color-primary)", 
    }));

    return {
      total: reserves.length,
      dailyStats,   
      timeStats,    
      weekdayStats, 
    };
  },
});


export const getPeriodReservations = query({
  args: {
    month: v.string(),
    email: v.string(),
  },

  handler: async (ctx, args) => {
    const month = dayjs(args.month);
    const monthStart = month.startOf("month").startOf("day").valueOf();
    console.log("[LS] -> convex/reservations.ts:135 -> monthStart: ", monthStart)
    const monthEnd = month.endOf("month").endOf("day").valueOf();
    console.log("[LS] -> convex/reservations.ts:136 -> monthEnd: ", monthEnd)

    const periodReservations = ctx.db.query("reserves")
      .withIndex("by_reserve", q => q.gte("from", monthStart).lte("from", monthEnd))
      .filter(q => q.eq(q.field("email"), args.email))
      .collect()

    return periodReservations;
  }
})
