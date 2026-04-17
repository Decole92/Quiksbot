import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── appointment ────────────────────────────────────────────────────────────────

export const getOrCreateAppointment = mutation({
  args: { chatbotId: v.id("chatBots") },
  handler: async (ctx, { chatbotId }) => {
    const existing = await ctx.db
      .query("appointments")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", chatbotId))
      .first();
    if (existing) return existing;

    const id = await ctx.db.insert("appointments", { chatbotId });
    return ctx.db.get(id);
  },
});

// ── appointment types ──────────────────────────────────────────────────────────

export const getAppointmentTypes = query({
  args: { chatbotId: v.id("chatBots") },
  handler: async (ctx, { chatbotId }) => {
    const appt = await ctx.db
      .query("appointments")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", chatbotId))
      .first();
    if (!appt) return [];

    return ctx.db
      .query("appointmentTypes")
      .withIndex("by_appointmentId", (q) => q.eq("appointmentId", appt._id))
      .collect();
  },
});

export const addAppointmentType = mutation({
  args: {
    chatbotId: v.id("chatBots"),
    typeName: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { chatbotId, typeName, description }) => {
    let appt = await ctx.db
      .query("appointments")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", chatbotId))
      .first();

    if (!appt) {
      const id = await ctx.db.insert("appointments", { chatbotId });
      appt = await ctx.db.get(id);
    }

    const typeId = await ctx.db.insert("appointmentTypes", {
      typeName,
      description,
      appointmentId: appt!._id,
    });
    return ctx.db.get(typeId);
  },
});

export const deleteAppointmentType = mutation({
  args: { id: v.id("appointmentTypes") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ── business hours ────────────────────────────────────────────────────────────

export const getBusinessHours = query({
  args: { chatbotId: v.id("chatBots") },
  handler: async (ctx, { chatbotId }) => {
    const appt = await ctx.db
      .query("appointments")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", chatbotId))
      .first();
    if (!appt) return [];

    return ctx.db
      .query("businessHours")
      .withIndex("by_appointmentId", (q) => q.eq("appointmentId", appt._id))
      .collect();
  },
});

export const updateBusinessHours = mutation({
  args: {
    chatbotId: v.id("chatBots"),
    hours: v.array(
      v.object({
        day: v.string(),
        startTime: v.string(),
        endTime: v.string(),
        isOpen: v.boolean(),
      })
    ),
  },
  handler: async (ctx, { chatbotId, hours }) => {
    let appt = await ctx.db
      .query("appointments")
      .withIndex("by_chatbotId", (q) => q.eq("chatbotId", chatbotId))
      .first();

    if (!appt) {
      const id = await ctx.db.insert("appointments", { chatbotId });
      appt = await ctx.db.get(id);
    }

    // Delete existing hours
    const existing = await ctx.db
      .query("businessHours")
      .withIndex("by_appointmentId", (q) => q.eq("appointmentId", appt!._id))
      .collect();
    await Promise.all(existing.map((h) => ctx.db.delete(h._id)));

    // Insert new hours
    await Promise.all(
      hours.map((h) =>
        ctx.db.insert("businessHours", { ...h, appointmentId: appt!._id })
      )
    );
    return { success: true };
  },
});

// ── appointment clients ────────────────────────────────────────────────────────

export const createAppointmentClient = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    status: v.union(
      v.literal("PENDING"),
      v.literal("CONFIRMED"),
      v.literal("CANCELLED"),
      v.literal("COMPLETED")
    ),
    confirmationToken: v.string(),
    tokenExpiry: v.number(),
    tokenUsed: v.boolean(),
    selectedDate: v.number(),
    appointmentId: v.id("appointments"),
    appointmentType: v.string(),
    selectedTime: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("appointmentClients", args);
    return ctx.db.get(id);
  },
});

export const getAppointmentClientByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    return ctx.db
      .query("appointmentClients")
      .withIndex("by_confirmationToken", (q) => q.eq("confirmationToken", token))
      .first();
  },
});

export const updateAppointmentStatus = mutation({
  args: {
    id: v.id("appointmentClients"),
    status: v.union(
      v.literal("PENDING"),
      v.literal("CONFIRMED"),
      v.literal("CANCELLED"),
      v.literal("COMPLETED")
    ),
    tokenUsed: v.boolean(),
  },
  handler: async (ctx, { id, status, tokenUsed }) => {
    await ctx.db.patch(id, { status, tokenUsed });
    return ctx.db.get(id);
  },
});

export const getAppointmentById = query({
  args: { id: v.id("appointments") },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});
