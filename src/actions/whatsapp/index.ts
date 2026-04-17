"use server";

import { revalidatePath } from "next/cache";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";

export async function updateChatbotWhatsApp(
  chatbotId: string,
  data: {
    enableWhatsApp?: boolean;
    whatsappPhoneId?: string | null;
    whatsappNumber?: string | null;
    whatsappBusinessId?: string | null;
    whatsappToken?: string | null;
  }
) {
  try {
    await fetchMutation(api.chatbots.updateWhatsApp, {
      id: chatbotId as any,
      enableWhatsApp: data.enableWhatsApp ?? false,
      whatsappPhoneId: data.whatsappPhoneId ?? undefined,
      whatsappNumber: data.whatsappNumber ?? undefined,
      whatsappBusinessId: data.whatsappBusinessId ?? undefined,
      whatsappToken: data.whatsappToken ?? undefined,
    });
    revalidatePath(`/dashboard/chatbots/${chatbotId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as any).message };
  }
}

export async function fetchWhatsAppDetails(code: string) {
  try {
    const tokenResponse = await fetch(
      "https://graph.facebook.com/v22.0/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_META_APP_ID!,
          client_secret: process.env.WHATSAPP_APP_SECRET!,
          code: code,
          scope:
            "business_management,whatsapp_business_management,public_profile",
        }),
        cache: "no-store",
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      throw new Error(`Token Error: ${JSON.stringify(errorData)}`);
    }

    const { access_token } = await tokenResponse.json();

    return {
      success: true,
      data: {
        accessToken: access_token,
      },
    };
  } catch (error) {
    console.error("WhatsApp Details Error:", error);
    return {
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack,
    };
  }
}

export async function getWhatsAppPhoneNumber(
  phoneNumberId: string,
  accessToken: string
) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/${phoneNumberId}?fields=verified_name,display_phone_number&access_token=${accessToken}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Phone Number Error: ${JSON.stringify(errorData)}`);
    }

    const phoneData = await response.json();

    return phoneData.display_phone_number || null;
  } catch (error) {
    console.error("Error fetching WhatsApp phone number:", error);
    return null;
  }
}
