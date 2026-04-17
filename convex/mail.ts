import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMailByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("mails")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});

export const upsertMail = mutation({
  args: {
    userId: v.id("users"),
    host: v.string(),
    port: v.number(),
    secure: v.boolean(),
    userEmail: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { userId, ...data }) => {
    const existing = await ctx.db
      .query("mails")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, data);
      // Keep mailId on user in sync
      const user = await ctx.db.get(userId);
      if (user && !user.mailId) {
        await ctx.db.patch(userId, { mailId: existing._id });
      }
      return ctx.db.get(existing._id);
    } else {
      const id = await ctx.db.insert("mails", { userId, ...data });
      await ctx.db.patch(userId, { mailId: id });
      return ctx.db.get(id);
    }
  },
});

export const deleteMail = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const mail = await ctx.db
      .query("mails")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (mail) {
      await ctx.db.delete(mail._id);
      await ctx.db.patch(userId, { mailId: undefined });
    }
  },
});
