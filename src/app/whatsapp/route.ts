import axios from "axios";
import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { processChatMessage } from "@/lib/transformData";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

const sendAutoReply = async (
  to: string,
  message: string,
  accessToken: string,
  phoneNumberId: string
) => {
  try {
    const response = await axios({
      url: `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
      method: "post",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      },
    });

    return response;
  } catch (error) {
    console.error(
      "❌ Error sending WhatsApp message:",
      (error as any).response?.data || (error as any).message
    );
    throw error;
  }
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.log("❌ Verification failed. Invalid token or mode.");
  return NextResponse.json(
    { error: "Verification failed or invalid request" },
    { status: 403 }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const value = body.entry?.[0]?.changes?.[0]?.value;

    if (value?.messages?.[0]) {
      const message = value.messages[0];
      const from = message.from;
      const text = message.text?.body;
      const to = value.metadata?.display_phone_number;
      const phoneNumberId = value?.metadata?.phone_number_id;

      const chatBot = await fetchQuery(api.chatbots.getBotByWhatsAppNumber, {
        whatsappNumber: to,
      });

      if (!chatBot) {
        console.error("⚠️ No ChatBot found for this Phone Number ID:", to);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      const res = await processChatMessage(chatBot as any, "user", from, text);
      if (res.status === 200) {
        await sendAutoReply(
          from,
          res?.message!,
          chatBot?.whatsappToken!,
          phoneNumberId
        );
      }

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
