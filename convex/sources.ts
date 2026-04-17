import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── source ────────────────────────────────────────────────────────────────────

export const getOrCreateSource = mutation({
  args: { chatBotId: v.id("chatBots") },
  handler: async (ctx, { chatBotId }) => {
    const bot = await ctx.db.get(chatBotId);
    if (!bot) throw new Error("Chatbot not found");

    if (bot.sourceId) return bot.sourceId;

    const sourceId = await ctx.db.insert("sources", { chatBotId });
    await ctx.db.patch(chatBotId, { sourceId });
    return sourceId;
  },
});

// ── PDF files ─────────────────────────────────────────────────────────────────

export const generatePdfUploadUrl = mutation({
  handler: async (ctx) => {
    return ctx.storage.generateUploadUrl();
  },
});

export const createPdfFile = mutation({
  args: {
    fileName: v.string(),
    storageId: v.id("_storage"),
    chatBotId: v.id("chatBots"),
  },
  handler: async (ctx, { fileName, storageId, chatBotId }) => {
    const bot = await ctx.db.get(chatBotId);
    if (!bot) throw new Error("Chatbot not found");

    let sourceId = bot.sourceId;
    if (!sourceId) {
      sourceId = await ctx.db.insert("sources", { chatBotId });
      await ctx.db.patch(chatBotId, { sourceId });
    }

    const id = await ctx.db.insert("pdfFiles", { fileName, storageId, sourceId });
    return ctx.db.get(id);
  },
});

export const getPdfUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return ctx.storage.getUrl(storageId);
  },
});

export const deletePdfFile = mutation({
  args: { id: v.id("pdfFiles") },
  handler: async (ctx, { id }) => {
    const pdf = await ctx.db.get(id);
    if (!pdf) throw new Error("PDF not found");
    await ctx.storage.delete(pdf.storageId);
    await ctx.db.delete(id);
    return { completed: true };
  },
});

export const getPdfsBySourceId = query({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, { sourceId }) => {
    return ctx.db
      .query("pdfFiles")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
      .collect();
  },
});

// ── characteristics ───────────────────────────────────────────────────────────

export const addCharacteristic = mutation({
  args: { chatBotId: v.id("chatBots"), characteristic: v.string() },
  handler: async (ctx, { chatBotId, characteristic }) => {
    const bot = await ctx.db.get(chatBotId);
    if (!bot) throw new Error("Chatbot not found");

    let sourceId = bot.sourceId;
    if (!sourceId) {
      sourceId = await ctx.db.insert("sources", { chatBotId });
      await ctx.db.patch(chatBotId, { sourceId });
    }

    const id = await ctx.db.insert("characteristics", { characteristic, sourceId });
    return ctx.db.get(id);
  },
});

export const removeCharacteristic = mutation({
  args: { id: v.id("characteristics") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ── websites ──────────────────────────────────────────────────────────────────

export const addWebsite = mutation({
  args: {
    chatBotId: v.id("chatBots"),
    weblinks: v.string(),
    content: v.string(),
    length: v.string(),
  },
  handler: async (ctx, { chatBotId, weblinks, content, length }) => {
    const bot = await ctx.db.get(chatBotId);
    if (!bot) throw new Error("Chatbot not found");

    let sourceId = bot.sourceId;
    if (!sourceId) {
      sourceId = await ctx.db.insert("sources", { chatBotId });
      await ctx.db.patch(chatBotId, { sourceId });
    }

    const id = await ctx.db.insert("websites", { weblinks, content, length, sourceId });
    return ctx.db.get(id);
  },
});

export const deleteWebsite = mutation({
  args: { id: v.id("websites") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const getWebsitesBySourceId = query({
  args: { sourceId: v.id("sources") },
  handler: async (ctx, { sourceId }) => {
    return ctx.db
      .query("websites")
      .withIndex("by_sourceId", (q) => q.eq("sourceId", sourceId))
      .collect();
  },
});
