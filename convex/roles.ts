import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

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
