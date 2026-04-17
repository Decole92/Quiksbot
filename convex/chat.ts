import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── queries ──────────────────────────────────────────────────────────────────

export const getChatMessages = query({
  args: { chatRoomId: v.id("chatRooms") },
  handler: async (ctx, { chatRoomId }) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_chatRoomId", (q) => q.eq("chatRoomId", chatRoomId))
      .order("asc")
      .collect();
    return messages.map((m) => ({
      ...m,
      id: m._id,
      createdAt: m._creationTime,
    }));
  },
});

export const getChatRoom = query({
  args: { chatRoomId: v.id("chatRooms") },
  handler: async (ctx, { chatRoomId }) => {
    const room = await ctx.db.get(chatRoomId);
    if (!room) return null;
    const customer = room.customerId ? await ctx.db.get(room.customerId) : null;
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_chatRoomId", (q) => q.eq("chatRoomId", chatRoomId))
      .collect();
    return {
      ...room,
      id: room._id,
      createdAt: room._creationTime,
      Customer: customer ? { ...customer, id: customer._id, createdAt: customer._creationTime } : null,
      message: messages.map((m) => ({ ...m, id: m._id, createdAt: m._creationTime })),
    };
  },
});

export const getChatRoomsByBotId = query({
  args: { chatbotId: v.id("chatBots") },
  handler: async (ctx, { chatbotId }) => {
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", chatbotId))
      .collect();

    const result = [];
    for (const customer of customers) {
      const rooms = await ctx.db
        .query("chatRooms")
        .withIndex("by_customerId", (q) => q.eq("customerId", customer._id))
        .collect();
      for (const room of rooms) {
        const messages = await ctx.db
          .query("chatMessages")
          .withIndex("by_chatRoomId", (q) => q.eq("chatRoomId", room._id))
          .collect();
        result.push({
          ...room,
          id: room._id,
          createdAt: room._creationTime,
          Customer: { ...customer, id: customer._id, createdAt: customer._creationTime },
          message: messages.map((m) => ({ ...m, id: m._id, createdAt: m._creationTime })),
        });
      }
    }
    return result;
  },
});

export const getAllChatRoomsForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const bots = await ctx.db
      .query("chatBots")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const result = [];
    for (const bot of bots) {
      const customers = await ctx.db
        .query("customers")
        .withIndex("by_chatbotId", (q) => q.eq("chatbotId", bot._id))
        .collect();
      for (const customer of customers) {
        const rooms = await ctx.db
          .query("chatRooms")
          .withIndex("by_customerId", (q) => q.eq("customerId", customer._id))
          .collect();
        for (const room of rooms) {
          const messages = await ctx.db
            .query("chatMessages")
            .withIndex("by_chatRoomId", (q) => q.eq("chatRoomId", room._id))
            .collect();
          result.push({
            ...room,
            id: room._id,
            createdAt: room._creationTime,
            Customer: { ...customer, id: customer._id, createdAt: customer._creationTime },
            message: messages.map((m) => ({ ...m, id: m._id, createdAt: m._creationTime })),
            bot: { ...bot, id: bot._id, createdAt: bot._creationTime },
          });
        }
      }
    }
    return result;
  },
});

// ── mutations ─────────────────────────────────────────────────────────────────

export const createCustomerAndRoom = mutation({
  args: {
    chatbotId: v.id("chatBots"),
    name: v.string(),
    greetingMessage: v.string(),
  },
  handler: async (ctx, { chatbotId, name, greetingMessage }) => {
    const customerId = await ctx.db.insert("customers", {
      name,
      chatbotId,
      email: "Anonymous",
    });

    const chatRoomId = await ctx.db.insert("chatRooms", {
      live: false,
      mailed: false,
      customerId,
    });

    await ctx.db.insert("chatMessages", {
      message: greetingMessage,
      role: "ai",
      chatRoomId,
      seen: true,
    });

    return { customerId, chatRoomId };
  },
});

export const createChatMessage = mutation({
  args: {
    chatRoomId: v.id("chatRooms"),
    message: v.string(),
    role: v.union(v.literal("user"), v.literal("ai")),
    type: v.optional(
      v.union(
        v.literal("message_text"),
        v.literal("contact_form"),
        v.literal("appointment_form")
      )
    ),
    seen: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("chatMessages", {
      chatRoomId: args.chatRoomId,
      message: args.message,
      role: args.role,
      type: args.type,
      seen: args.seen ?? true,
    });
    return ctx.db.get(id);
  },
});

export const updateMessageImage = mutation({
  args: {
    messageId: v.id("chatMessages"),
    imageRef: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { messageId, imageRef, imageUrl, imageStorageId }) => {
    await ctx.db.patch(messageId, { imageRef, imageUrl, imageStorageId });
  },
});

export const markRoomLive = mutation({
  args: { chatRoomId: v.id("chatRooms") },
  handler: async (ctx, { chatRoomId }) => {
    await ctx.db.patch(chatRoomId, { live: true, mailed: true });
  },
});

export const markRoomInactive = mutation({
  args: { chatRoomId: v.id("chatRooms") },
  handler: async (ctx, { chatRoomId }) => {
    await ctx.db.patch(chatRoomId, { live: false });
  },
});

export const markMessagesSeen = mutation({
  args: { chatRoomId: v.id("chatRooms") },
  handler: async (ctx, { chatRoomId }) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_chatRoomId", (q) => q.eq("chatRoomId", chatRoomId))
      .collect();
    await Promise.all(
      messages.filter((m) => !m.seen).map((m) => ctx.db.patch(m._id, { seen: true }))
    );
  },
});

export const deleteChatRoom = mutation({
  args: { chatRoomId: v.id("chatRooms") },
  handler: async (ctx, { chatRoomId }) => {
    const room = await ctx.db.get(chatRoomId);
    if (!room) throw new Error("Chat room not found");

    // Delete messages (and their Convex storage files)
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_chatRoomId", (q) => q.eq("chatRoomId", chatRoomId))
      .collect();
    for (const msg of messages) {
      if (msg.imageStorageId) {
        await ctx.storage.delete(msg.imageStorageId);
      }
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(chatRoomId);

    // Delete customer
    if (room.customerId) {
      await ctx.db.delete(room.customerId);
    }

    return { completed: true };
  },
});

export const updateCustomerDetails = mutation({
  args: {
    chatRoomId: v.id("chatRooms"),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { chatRoomId, name, email }) => {
    const room = await ctx.db.get(chatRoomId);
    if (!room?.customerId) throw new Error("No customer for this room");
    await ctx.db.patch(room.customerId, { name, email });
    return ctx.db.get(room.customerId);
  },
});

export const updateCustomerLocation = mutation({
  args: {
    customerId: v.id("customers"),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    lat: v.optional(v.string()),
    lng: v.optional(v.string()),
  },
  handler: async (ctx, { customerId, ...data }) => {
    await ctx.db.patch(customerId, data);
  },
});

// Generate a Convex upload URL for images
export const generateImageUploadUrl = mutation({
  handler: async (ctx) => {
    return ctx.storage.generateUploadUrl();
  },
});

export const getMessageCount = query({
  args: { chatRoomId: v.id("chatRooms") },
  handler: async (ctx, { chatRoomId }) => {
    const msgs = await ctx.db
      .query("chatMessages")
      .withIndex("by_chatRoomId", (q) => q.eq("chatRoomId", chatRoomId))
      .collect();
    return msgs.length;
  },
});

export const getChatRoomByCustomerPhone = query({
  args: {
    chatbotId: v.id("chatBots"),
    phone: v.string(),
  },
  handler: async (ctx, { chatbotId, phone }) => {
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", chatbotId))
      .collect();
    const customer = customers.find((c) => c.phone === phone);
    if (!customer) return null;

    const room = await ctx.db
      .query("chatRooms")
      .withIndex("by_customerId", (q) => q.eq("customerId", customer._id))
      .first();
    if (!room) return null;

    return {
      ...room,
      id: room._id,
      createdAt: room._creationTime,
      customerId: customer._id,
    };
  },
});

export const createWhatsAppCustomerAndRoom = mutation({
  args: {
    chatbotId: v.id("chatBots"),
    phone: v.string(),
    name: v.string(),
    country: v.optional(v.string()),
  },
  handler: async (ctx, { chatbotId, phone, name, country }) => {
    const customerId = await ctx.db.insert("customers", {
      phone,
      email: "Anonymous",
      country,
      name: name || "user",
      chatbotId,
    });

    const chatRoomId = await ctx.db.insert("chatRooms", {
      live: false,
      mailed: false,
      customerId,
    });

    return {
      customerId,
      chatRoomId,
    };
  },
});
