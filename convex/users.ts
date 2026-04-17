import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const getUserWithSubscription = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return null;

    const subscription = await ctx.db
      .query("billings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const mail = user.mailId ? await ctx.db.get(user.mailId) : null;

    return { ...user, subscription, mail };
  },
});

export const getUserWithSubscriptionById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const subscription = await ctx.db
      .query("billings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .first();

    const mail = user.mailId ? await ctx.db.get(user.mailId) : null;
    return { ...user, subscription, mail };
  },
});

export const getUserByStripeId = query({
  args: { stripeId: v.string() },
  handler: async (ctx, { stripeId }) => {
    return ctx.db
      .query("users")
      .withIndex("by_stripeId", (q) => q.eq("stripeId", stripeId))
      .first();
  },
});

export const createUser = mutation({
  args: {
    fullname: v.string(),
    clerkId: v.string(),
    type: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (existing) return existing;

    const id = await ctx.db.insert("users", {
      fullname: args.fullname,
      clerkId: args.clerkId,
      type: args.type,
      email: args.email,
      credits: 0,
    });
    return ctx.db.get(id);
  },
});

export const updateUserStripeId = mutation({
  args: { clerkId: v.string(), stripeId: v.string() },
  handler: async (ctx, { clerkId, stripeId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { stripeId });
  },
});

export const updateApiKey = mutation({
  args: {
    clerkId: v.string(),
    keyType: v.union(
      v.literal("openAIkey"),
      v.literal("anthropicAiKey"),
      v.literal("deepseekAiKey"),
      v.literal("xaiKey")
    ),
    value: v.union(v.string(), v.null()),
  },
  handler: async (ctx, { clerkId, keyType, value }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { [keyType]: value ?? undefined });
  },
});

export const incrementCredits = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(userId, { credits: (user.credits ?? 0) + 1 });
  },
});

export const getUserCredits = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    return user?.credits ?? 0;
  },
});

export const getPdfFileCount = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return 0;

    const chatbots = await ctx.db
      .query("chatBots")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    let total = 0;
    for (const bot of chatbots) {
      if (bot.sourceId) {
        const pdfs = await ctx.db
          .query("pdfFiles")
          .withIndex("by_sourceId", (q) => q.eq("sourceId", bot.sourceId))
          .collect();
        total += pdfs.length;
      }
    }
    return total;
  },
});
