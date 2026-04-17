export const BASE_URL =
  process.env.NODE_ENV !== "development"
    ? "https://www.quiksbot.com"
    : "http://localhost:3000";

export const STANDARD_LIMIT = 2;
export const PRO_LIMIT = 10;
export const ULTIMATE_LIMIT = 20;
export const STANDARD_CREDITS = 12;
export const STANDARD_CHATBOT_LIMIT = 1;
export const PRO_CHATBOT_LIMIT = 5;
export const ULTIMATE_CHATBOT_LIMIT = 12;
