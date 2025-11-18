import { defineSchema, defineTable } from 'convex/server'
import { authTables } from "@convex-dev/auth/server";
import { v } from 'convex/values'

export default defineSchema({
  ...authTables,
  roles: defineTable({
    email: v.string(),
    role: v.string(),
  }).index("by_email", ["email"]),
  reserves: defineTable({
    from: v.number(),
    to: v.number(),
    email: v.string(),
  }).index("by_reserve", ["from", "to"]),
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),

})
