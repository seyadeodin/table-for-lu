import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server"



export const getMe = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }
    const user = await ctx.db.
      get(userId)

    if (!user) return null;

    const userWithRole = await ctx.db.query("roles")
      //TODO: fix this
      .withIndex("by_email", q => q.eq("email", user.email ?? ""))
      .first();

    return {
      name: user.name,
      email: user.email,
      image: user.image,
      role: userWithRole?.role ?? null,
    }
  }
})
