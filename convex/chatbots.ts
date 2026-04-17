import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ── helpers ──────────────────────────────────────────────────────────────────

function withIdAndCreatedAt<T extends { _id: any; _creationTime: number }>(doc: T) {
  return { ...doc, id: doc._id, createdAt: doc._creationTime };
}

async function enrichBot(ctx: any, bot: any) {
  const source = bot.sourceId ? await ctx.db.get(bot.sourceId) : null;
  const [pdfFiles, characteristics, webpages, firstQuestions, customers] = await Promise.all([
    source
      ? ctx.db.query("pdfFiles").withIndex("by_sourceId", (q: any) => q.eq("sourceId", source._id)).collect()
      : [],
    source
      ? ctx.db.query("characteristics").withIndex("by_sourceId", (q: any) => q.eq("sourceId", source._id)).collect()
      : [],
    source
      ? ctx.db.query("websites").withIndex("by_sourceId", (q: any) => q.eq("sourceId", source._id)).collect()
      : [],
    ctx.db.query("firstQuestions").withIndex("by_chatbotId", (q: any) => q.eq("chatbotId", bot._id)).collect(),
    ctx.db.query("customers").withIndex("by_chatbotId", (q: any) => q.eq("chatbotId", bot._id)).collect(),
  ]);
  const user = bot.userId ? await ctx.db.get(bot.userId) : null;
  const appointment = await ctx.db
    .query("appointments")
    .withIndex("by_chatbotId", (q: any) => q.eq("chatbotId", bot._id))
    .first();

  return {
    ...withIdAndCreatedAt(bot),
    Source: source
      ? {
          ...withIdAndCreatedAt(source),
          pdfFile: pdfFiles.map(withIdAndCreatedAt),
          characteristic: characteristics.map(withIdAndCreatedAt),
          webpage: webpages.map(withIdAndCreatedAt),
        }
      : null,
    firstQuestion: firstQuestions.map(withIdAndCreatedAt),
    customer: customers.map(withIdAndCreatedAt),
    User: user ? withIdAndCreatedAt(user) : null,
    appointment: appointment ? withIdAndCreatedAt(appointment) : null,
  };
}

// ── queries ──────────────────────────────────────────────────────────────────

export const getBotById = query({
  args: { id: v.id("chatBots") },
  handler: async (ctx, { id }) => {
    const bot = await ctx.db.get(id);
    if (!bot) return null;
    return enrichBot(ctx, bot);
  },
});

export const getBotByWhatsAppNumber = query({
  args: { whatsappNumber: v.string() },
  handler: async (ctx, { whatsappNumber }) => {
    const bot = await ctx.db
      .query("chatBots")
      .withIndex("by_whatsappNumber", (q) => q.eq("whatsappNumber", whatsappNumber))
      .first();
    if (!bot) return null;
    return enrichBot(ctx, bot);
  },
});

export const getBotsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const bots = await ctx.db
      .query("chatBots")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return Promise.all(bots.map((bot) => enrichBot(ctx, bot)));
  },
});

export const getChatbotCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const bots = await ctx.db
      .query("chatBots")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return bots.length;
  },
});

export const getBotPosition = query({
  args: { id: v.id("chatBots") },
  handler: async (ctx, { id }) => {
    const bot = await ctx.db.get(id);
    return bot?.iconPosition ?? "right";
  },
});

// ── mutations ─────────────────────────────────────────────────────────────────

export const createChatbot = mutation({
  args: {
    name: v.string(),
    userId: v.id("users"),
    greetings: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("chatBots", {
      name: args.name,
      userId: args.userId,
      greetings: args.greetings ?? "Hey 👋 , How can we help you today?",
      role: args.role ?? "Customer support agent",
      iconPosition: "right",
      theme: "light",
      watermark: true,
      chatModel: "gpt-3.5-turbo",
      botType: "Support",
      getDetails: false,
      enableWhatsApp: false,
      liveAgent: false,
    });
    const bot = await ctx.db.get(id);
    return bot ? enrichBot(ctx, bot) : null;
  },
});

export const updateBotName = mutation({
  args: {
    id: v.id("chatBots"),
    name: v.string(),
    role: v.string(),
    botIcon: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, role, botIcon }) => {
    await ctx.db.patch(id, { name, role, botIcon });
  },
});

export const updateGreetings = mutation({
  args: { id: v.id("chatBots"), greetings: v.string() },
  handler: async (ctx, { id, greetings }) => {
    await ctx.db.patch(id, { greetings });
  },
});

export const updateColor = mutation({
  args: { id: v.id("chatBots"), color: v.string() },
  handler: async (ctx, { id, color }) => {
    await ctx.db.patch(id, { userMessageBgColor: color });
  },
});

export const updateWatermark = mutation({
  args: { id: v.id("chatBots"), watermark: v.boolean() },
  handler: async (ctx, { id, watermark }) => {
    await ctx.db.patch(id, { watermark });
  },
});

export const updateChatbotPosition = mutation({
  args: {
    id: v.id("chatBots"),
    position: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, { id, position, icon }) => {
    await ctx.db.patch(id, { iconPosition: position, icon });
  },
});

export const updateChatModel = mutation({
  args: { id: v.id("chatBots"), chatModel: v.string() },
  handler: async (ctx, { id, chatModel }) => {
    await ctx.db.patch(id, { chatModel });
  },
});

export const updateLiveAgent = mutation({
  args: { id: v.id("chatBots"), liveAgent: v.boolean() },
  handler: async (ctx, { id, liveAgent }) => {
    await ctx.db.patch(id, { liveAgent });
  },
});

export const updateGetDetails = mutation({
  args: { id: v.id("chatBots"), getDetails: v.boolean() },
  handler: async (ctx, { id, getDetails }) => {
    await ctx.db.patch(id, { getDetails });
  },
});

export const updateBotType = mutation({
  args: {
    id: v.id("chatBots"),
    botType: v.union(
      v.literal("Sales"),
      v.literal("Appointment"),
      v.literal("Support"),
      v.literal("Custom")
    ),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, { id, botType, prompt }) => {
    const update: Record<string, any> = { botType };
    if (prompt !== undefined) update.prompt = prompt;
    await ctx.db.patch(id, update);
  },
});

export const updateWhatsApp = mutation({
  args: {
    id: v.id("chatBots"),
    enableWhatsApp: v.boolean(),
    whatsappPhoneId: v.optional(v.string()),
    whatsappToken: v.optional(v.string()),
    whatsappBusinessId: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...data }) => {
    await ctx.db.patch(id, data);
  },
});

export const deleteBot = mutation({
  args: { id: v.id("chatBots") },
  handler: async (ctx, { id }) => {
    const bot = await ctx.db.get(id);
    if (!bot) throw new Error("Chatbot not found");

    // Delete first questions
    const questions = await ctx.db
      .query("firstQuestions")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", id))
      .collect();
    await Promise.all(questions.map((q) => ctx.db.delete(q._id)));

    // Delete block pages
    const blocks = await ctx.db
      .query("blockPages")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", id))
      .collect();
    await Promise.all(blocks.map((b) => ctx.db.delete(b._id)));

    // Delete customers and their chat rooms / messages
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", id))
      .collect();
    for (const customer of customers) {
      const rooms = await ctx.db
        .query("chatRooms")
        .withIndex("by_customerId", (q) => q.eq("customerId", customer._id))
        .collect();
      for (const room of rooms) {
        const msgs = await ctx.db
          .query("chatMessages")
          .withIndex("by_chatRoomId", (q) => q.eq("chatRoomId", room._id))
          .collect();
        await Promise.all(msgs.map((m) => ctx.db.delete(m._id)));
        await ctx.db.delete(room._id);
      }
      await ctx.db.delete(customer._id);
    }

    // Delete appointment
    const appt = await ctx.db
      .query("appointments")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", id))
      .first();
    if (appt) {
      const types = await ctx.db
        .query("appointmentTypes")
        .withIndex("by_appointmentId", (q) => q.eq("appointmentId", appt._id))
        .collect();
      await Promise.all(types.map((t) => ctx.db.delete(t._id)));

      const hours = await ctx.db
        .query("businessHours")
        .withIndex("by_appointmentId", (q) => q.eq("appointmentId", appt._id))
        .collect();
      await Promise.all(hours.map((h) => ctx.db.delete(h._id)));

      const clients = await ctx.db
        .query("appointmentClients")
        .withIndex("by_appointmentId", (q) => q.eq("appointmentId", appt._id))
        .collect();
      await Promise.all(clients.map((c) => ctx.db.delete(c._id)));

      await ctx.db.delete(appt._id);
    }

    // Delete source and its children
    if (bot.sourceId) {
      const pdfs = await ctx.db
        .query("pdfFiles")
        .withIndex("by_sourceId", (q) => q.eq("sourceId", bot.sourceId!))
        .collect();
      for (const pdf of pdfs) {
        await ctx.storage.delete(pdf.storageId);
        await ctx.db.delete(pdf._id);
      }

      const chars = await ctx.db
        .query("characteristics")
        .withIndex("by_sourceId", (q) => q.eq("sourceId", bot.sourceId!))
        .collect();
      await Promise.all(chars.map((c) => ctx.db.delete(c._id)));

      const webs = await ctx.db
        .query("websites")
        .withIndex("by_sourceId", (q) => q.eq("sourceId", bot.sourceId!))
        .collect();
      await Promise.all(webs.map((w) => ctx.db.delete(w._id)));

      await ctx.db.delete(bot.sourceId);
    }

    await ctx.db.delete(id);
    return { completed: true };
  },
});

// ── first questions ──────────────────────────────────────────────────────────

export const addFirstQuestion = mutation({
  args: { chatbotId: v.id("chatBots"), question: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("firstQuestions", args);
    return ctx.db.get(id);
  },
});

export const removeFirstQuestion = mutation({
  args: { id: v.id("firstQuestions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ── block pages ──────────────────────────────────────────────────────────────

export const addBlockPage = mutation({
  args: { chatbotId: v.id("chatBots"), address: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("blockPages", args);
    return ctx.db.get(id);
  },
});

export const removeBlockPage = mutation({
  args: { id: v.id("blockPages") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const getBlockPagesByChatbotId = query({
  args: { chatbotId: v.id("chatBots") },
  handler: async (ctx, { chatbotId }) => {
    return ctx.db
      .query("blockPages")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", chatbotId))
      .collect();
  },
});
