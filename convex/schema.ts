import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fullname: v.string(),
    clerkId: v.string(),
    type: v.string(),
    email: v.string(),
    stripeId: v.optional(v.string()),
    openAIkey: v.optional(v.string()),
    anthropicAiKey: v.optional(v.string()),
    credits: v.optional(v.number()),
    deepseekAiKey: v.optional(v.string()),
    xaiKey: v.optional(v.string()),
    mailId: v.optional(v.id("mails")),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_stripeId", ["stripeId"]),

  whatsAppInfos: defineTable({
    userId: v.optional(v.id("users")),
    whatsappPhoneId: v.optional(v.string()),
    whatsappToken: v.optional(v.string()),
    whatsappBusinessId: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
  }).index("by_userId", ["userId"]),

  mails: defineTable({
    host: v.string(),
    port: v.number(),
    secure: v.boolean(),
    userEmail: v.string(),
    password: v.string(),
    userId: v.optional(v.id("users")),
  }).index("by_userId", ["userId"]),

  sources: defineTable({
    chatBotId: v.optional(v.id("chatBots")),
  }).index("by_chatBotId", ["chatBotId"]),

  websites: defineTable({
    weblinks: v.string(),
    content: v.string(),
    length: v.string(),
    sourceId: v.optional(v.id("sources")),
  }).index("by_sourceId", ["sourceId"]),

  characteristics: defineTable({
    characteristic: v.string(),
    sourceId: v.optional(v.id("sources")),
  }).index("by_sourceId", ["sourceId"]),

  pdfFiles: defineTable({
    fileName: v.string(),
    storageId: v.id("_storage"),
    sourceId: v.optional(v.id("sources")),
  }).index("by_sourceId", ["sourceId"]),

  chatBots: defineTable({
    greetings: v.optional(v.string()),
    botIcon: v.optional(v.string()),
    icon: v.optional(v.string()),
    iconPosition: v.string(),
    theme: v.union(
      v.literal("light"),
      v.literal("dark"),
      v.literal("system")
    ),
    watermark: v.boolean(),
    userMessageBgColor: v.optional(v.string()),
    chatModel: v.string(),
    botType: v.union(
      v.literal("Sales"),
      v.literal("Appointment"),
      v.literal("Support"),
      v.literal("Custom")
    ),
    getDetails: v.boolean(),
    prompt: v.optional(v.string()),
    role: v.optional(v.string()),
    name: v.string(),
    sourceId: v.optional(v.id("sources")),
    userId: v.optional(v.id("users")),
    enableWhatsApp: v.boolean(),
    whatsappPhoneId: v.optional(v.string()),
    whatsappToken: v.optional(v.string()),
    whatsappBusinessId: v.optional(v.string()),
    whatsappNumber: v.optional(v.string()),
    liveAgent: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_sourceId", ["sourceId"])
    .index("by_whatsappNumber", ["whatsappNumber"]),

  firstQuestions: defineTable({
    question: v.string(),
    chatbotId: v.optional(v.id("chatBots")),
  }).index("by_chatbotId", ["chatbotId"]),

  blockPages: defineTable({
    address: v.string(),
    chatbotId: v.optional(v.id("chatBots")),
  }).index("by_chatbotId", ["chatbotId"]),

  appointments: defineTable({
    chatbotId: v.optional(v.id("chatBots")),
  }).index("by_chatbotId", ["chatbotId"]),

  businessHours: defineTable({
    day: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    isOpen: v.boolean(),
    appointmentId: v.optional(v.id("appointments")),
  }).index("by_appointmentId", ["appointmentId"]),

  appointmentTypes: defineTable({
    typeName: v.string(),
    description: v.optional(v.string()),
    appointmentId: v.optional(v.id("appointments")),
  }).index("by_appointmentId", ["appointmentId"]),

  appointmentClients: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    status: v.union(
      v.literal("PENDING"),
      v.literal("CONFIRMED"),
      v.literal("CANCELLED"),
      v.literal("COMPLETED")
    ),
    notes: v.optional(v.string()),
    confirmationToken: v.string(),
    tokenExpiry: v.number(),
    tokenUsed: v.boolean(),
    selectedDate: v.number(),
    appointmentId: v.optional(v.id("appointments")),
    appointmentType: v.string(),
    selectedTime: v.string(),
  })
    .index("by_appointmentId", ["appointmentId"])
    .index("by_confirmationToken", ["confirmationToken"]),

  billings: defineTable({
    plan: v.union(
      v.literal("STANDARD"),
      v.literal("PRO"),
      v.literal("ULTIMATE")
    ),
    userId: v.optional(v.id("users")),
  }).index("by_userId", ["userId"]),

  customers: defineTable({
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    name: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    lat: v.optional(v.string()),
    lng: v.optional(v.string()),
    chatbotId: v.optional(v.id("chatBots")),
  }).index("by_chatbotId", ["chatbotId"]),

  chatRooms: defineTable({
    live: v.boolean(),
    mailed: v.boolean(),
    customerId: v.optional(v.id("customers")),
  }).index("by_customerId", ["customerId"]),

  chatMessages: defineTable({
    message: v.string(),
    role: v.optional(v.union(v.literal("user"), v.literal("ai"))),
    type: v.optional(
      v.union(
        v.literal("message_text"),
        v.literal("contact_form"),
        v.literal("appointment_form")
      )
    ),
    chatRoomId: v.optional(v.id("chatRooms")),
    seen: v.boolean(),
    imageRef: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
  }).index("by_chatRoomId", ["chatRoomId"]),

  campaigns: defineTable({
    subject: v.string(),
    customers: v.array(v.string()),
    template: v.optional(v.string()),
    userId: v.string(),
    from: v.string(),
  }).index("by_userId", ["userId"]),

  filterQuestions: defineTable({
    question: v.string(),
    answered: v.optional(v.string()),
  }),
});
