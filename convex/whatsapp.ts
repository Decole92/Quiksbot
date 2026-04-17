import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getWhatsAppInfo = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("whatsAppInfos")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const upsertWhatsAppInfo = mutation({
  args: {
    userId: v.id("users"),
    whatsappPhoneId: v.optional(v.string()),
    whatsappToken: v.optional(v.string()),
    whatsappBusinessId: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
  },
  handler: async (ctx, { userId, ...data }) => {
    const existing = await ctx.db
      .query("whatsAppInfos")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("whatsAppInfos", { userId, ...data });
      return ctx.db.get(id);
    }
  },
});

export const deleteWhatsAppInfo = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const info = await ctx.db
      .query("whatsAppInfos")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (info) await ctx.db.delete(info._id);
  },
});
