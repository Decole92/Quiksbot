import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run cleanup daily at 2 AM UTC — deletes inactive STANDARD-plan chatbots older than 30 days
crons.daily(
  "cleanup-inactive-chatbots",
  { hourUTC: 2, minuteUTC: 0 },
  internal.cleanup.deleteInactiveChatbots
);

export default crons;
