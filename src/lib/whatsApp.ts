// import { createHmac } from "crypto";

// export function verifyWebhookSignature(
//   body: string,
//   signature: string
// ): boolean {
//   const APP_SECRET = process.env.WHATSAPP_APP_SECRET || "your-app-secret";

//   if (!signature) return false;

//   const expectedSignature = signature.replace("sha256=", "");
//   const hmac = createHmac("sha256", APP_SECRET);
//   hmac.update(body);
//   const calculatedSignature = hmac.digest("hex");

//   return calculatedSignature === expectedSignature;
// }

// lib/whatsApp.ts
import { createHmac } from "crypto";

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const APP_SECRET = process.env.WHATSAPP_APP_SECRET!;
  if (!signature) return false;

  const expectedSignature = signature.replace("sha256=", "");
  const hmac = createHmac("sha256", APP_SECRET);
  hmac.update(body);
  return hmac.digest("hex") === expectedSignature;
}
