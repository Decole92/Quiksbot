import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCampaignsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("campaigns")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const createCampaign = mutation({
  args: {
    subject: v.string(),
    customers: v.array(v.string()),
    template: v.optional(v.string()),
    userId: v.string(),
    from: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("campaigns", args);
    return ctx.db.get(id);
  },
});

export const deleteCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
