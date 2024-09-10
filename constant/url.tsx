export const BASE_URL =
  process.env.NODE_ENV !== "development"
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
