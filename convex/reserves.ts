import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import dayjs from "dayjs"

export const getRole = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("roles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    return user?.role;
  }
})

export const selectRole = mutation({
  args: {
    email: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("roles")
      .withIndex("by_email", q => q.eq("email", args.email))
      .first();

    if (user) {
      await ctx.db.patch(user._id, { role: args.role });
      return
    }

    await ctx.db.insert("roles", {role: args.role, email: args.email});
  }
})

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

    for(const reserve of userReserves) {
      ctx.db.delete(reserve._id);
    }

    for(const reserve of args.reserves)
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
