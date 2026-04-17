import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSubscription = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("billings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const getSubscriptionByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return null;

    return ctx.db
      .query("billings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();
  },
});

export const upsertSubscription = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("STANDARD"), v.literal("PRO"), v.literal("ULTIMATE")),
  },
  handler: async (ctx, { userId, plan }) => {
    const existing = await ctx.db
      .query("billings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { plan });
      return ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("billings", { userId, plan });
      return ctx.db.get(id);
    }
  },
});

export const deleteSubscription = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const billing = await ctx.db
      .query("billings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (billing) await ctx.db.delete(billing._id);
  },
});
