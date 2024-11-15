export const BASE_URL =
  process.env.NODE_ENV !== "development"
    ? "https://www.quiksbot.com"
    : "http://localhost:3000";
// ? `https://${process.env.VERCEL_URL}`
