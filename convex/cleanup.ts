import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const deleteInactiveChatbots = internalAction({
  handler: async (ctx) => {
    // Convex scheduled cleanup — runs inside Convex runtime
    // Full implementation would query chatbots older than 30 days
    // and delete those with no recent messages on STANDARD plans.
    // This is a placeholder — add query logic matching your business rules.
    console.log("Cleanup cron ran at", new Date().toISOString());
  },
});
