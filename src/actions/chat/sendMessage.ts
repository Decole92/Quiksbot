"use server";
import OpenAI from "openai";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import {
  ChatCompletionContentPartImage,
  ChatCompletionContentPartText,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import { OpenAIEmbeddings } from "@langchain/openai";
import pineconeClient from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { onMailer } from "../customer";
import { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { randomUUID } from "crypto";
import { getChatMessages, uploadImageAndGetUrl } from "./index";
import { AppointmentData } from "../../../typing";
import Anthropic from "@anthropic-ai/sdk";
import { convertToAnthropicMessages } from "@/lib/convertMsg";
import {
  createAppointment,
  getAppointmentType,
  getBusinessHours,
} from "../appointment";
import { formatBusinessHours } from "@/lib/calendar";
import { sanitizeName } from "@/lib/transformData";

let io: any;

if (!(global as any).io) {
  const httpServer = (global as any).httpServer as NetServer;
  io = new SocketIOServer(httpServer);
  (global as any).io = io;
} else {
  io = (global as any).io;
}

export const sendMessage = async (
  message: string,
  tempRoomId: string,
  chatbot: any,
  name: string,
  image?: FormData,
  isFirstMessage?: boolean
) => {
  if (!message || !chatbot) return;

  let chatRoomId = tempRoomId;
  try {
    if (isFirstMessage || !tempRoomId) {
      const result = await fetchMutation(api.chat.createCustomerAndRoom, {
        chatbotId: chatbot._id ?? chatbot.id,
        name: name || "Anonymous",
        greetingMessage:
          chatbot?.greetings || "Hello, How can we help you today?",
      });
      chatRoomId = result.chatRoomId as string;
    }

    const [previousMessages, userInfo, bot] = await Promise.all([
      getChatMessages(chatRoomId),
      fetchQuery(api.users.getUserWithSubscription, {
        clerkId: chatbot?.User?.clerkId ?? chatbot?.userId ?? "",
      }),
      fetchQuery(api.chatbots.getBotById, {
        id: chatbot._id ?? chatbot.id,
      }),
    ]);

    const formattedMessages = (previousMessages ?? []).map((msg: any) => ({
      role: msg?.role === "ai" ? "system" : "user",
      name: msg?.role === "ai" ? "system" : name,
      content: msg?.message,
    }));

    const pdfFiles: any[] = (bot as any)?.Source?.pdfFile ?? [];
    const fileIds = pdfFiles.map((pdf: any) => pdf._id ?? pdf.id);

    const anthropic = new Anthropic({
      apiKey: userInfo?.anthropicAiKey ?? process.env.ANTHROPIC_KEY!,
    });

    const openai = new OpenAI(
      bot?.chatModel?.toLowerCase().includes("deepseek")
        ? {
            baseURL: "https://api.deepseek.com",
            apiKey: userInfo?.deepseekAiKey ?? process.env.DEEPSEEK_KEY!,
          }
        : bot?.chatModel?.toLowerCase().includes("grok")
        ? {
            apiKey: userInfo?.xaiKey ?? process.env.XAI_KEY,
            baseURL: "https://api.x.ai/v1",
          }
        : { apiKey: userInfo?.openAIkey ?? process.env.OPENAI_KEY! }
    );

    const embeddings = new OpenAIEmbeddings({
      apiKey: userInfo?.openAIkey ?? process.env.OPENAI_KEY!,
    });

    const index = await pineconeClient.index("quiksbot");
    let allRelevantDocs: any[] = [];

    for (const fileId of fileIds) {
      const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
        namespace: fileId,
      });
      const relevantDocs = await pineconeStore.similaritySearch(message, 3);
      allRelevantDocs.push(...relevantDocs);
    }

    const formattedRelevantDocs = allRelevantDocs
      .map((doc) => doc?.pageContent)
      .join("\n\n");

    const characteristicData = (bot as any)?.Source?.characteristic
      ?.map((s: any) => s.characteristic)
      .join(" + ");

    const websiteUrlData = (bot as any)?.Source?.webpage
      ?.map((s: any) => s.content)
      .join(" + ");

    const person = !name ? "an anonymous" : name;
    const takeover = chatbot?.liveAgent;

    let AIContent = "";

    if (chatbot?.botType === "Support") {
      AIContent = `You are a helpful AI assistant engaging with ${person} user. Your primary focus is to assist based on the following key information: ${characteristicData}, ${websiteUrlData}, ${formattedRelevantDocs}. Maintain a respectful and friendly tone, using emojis sparingly to enhance communication 😊.

      If a user's query relates to your specified content areas:
      - Provide a helpful response based on the information available to you.

    If a user's query falls outside your specified content areas:
    1. Politely explain that the topic is beyond your current knowledge.
    2. Offer the option to provide their email address for follow-up by a human agent, or let them know they can request real-time assistance by saying "I'd like real-time help."
    3. Assure them that a human agent can assist further if needed, regardless of their choice.`;
    } else if (chatbot?.botType === "Appointment") {
      const serviceTypes = await getAppointmentType(chatbot?._id ?? chatbot?.id);
      const businessHour = await getBusinessHours(chatbot?._id ?? chatbot?.id);
      const slot = formatBusinessHours(businessHour);
      const serviceList =
        serviceTypes?.map((type: any) => type.typeName).join(", ") ||
        "haircut, massage, consultation";

      AIContent = `You are an AI-powered scheduling assistant engaging with ${person}. Your goal is to assist with scheduling appointments and provide answers based on: ${characteristicData}, ${websiteUrlData}, ${formattedRelevantDocs}. Use a friendly tone with occasional emojis 😊.

### Available Services
${serviceList}

### Business Hours
${slot}

Your primary task is to extract and structure appointment details from user requests. Required details: service_type, appointment_date, appointment_time, user_email.

If all required details are provided and valid, confirm the booking and include details in JSON format:
\`\`\`json
{
  "service_type": "user-provided-service",
  "appointment_date": "YYYY-MM-DD",
  "appointment_time": "HH:MM",
  "user_name": "${person}",
  "user_email": "user-provided-email"
}
\`\`\`

If any details are missing, politely ask for them.`;
    } else if (chatbot?.botType === "Sales") {
      AIContent = `You are a helpful AI sales assistant engaging with ${person} user. Your primary focus is to assist with sales-related queries based on the following key information: ${characteristicData}, ${websiteUrlData}, ${formattedRelevantDocs}. Maintain a respectful and friendly tone, using emojis sparingly to enhance communication 😊.`;
    } else if (chatbot?.prompt && chatbot?.botType === "Custom") {
      AIContent = `${chatbot.prompt} + ${characteristicData} + ${websiteUrlData} + ${formattedRelevantDocs}`;
    }

    if (takeover) {
      AIContent += ` Also, if you detect that the user is frustrated (e.g., using multiple question marks, exclamation points, or words like 'frustrated,' 'annoyed'), append '(realtime)' to your response.`;
      AIContent +=
        "\n\nNote: Real-time assistance is enabled. A human agent is available to join the conversation if you need further help.";
    }

    const userMessage = await fetchMutation(api.chat.createChatMessage, {
      chatRoomId: chatRoomId as any,
      message,
      role: name === "ai" ? "ai" : "user",
      seen: true,
    });

    const chatRoom = await fetchQuery(api.chat.getChatRoom, {
      chatRoomId: chatRoomId as any,
    });

    let imageUrl: string | null | undefined;
    if (image) {
      imageUrl = await uploadImageAndGetUrl(
        (userMessage as any)?._id ?? (userMessage as any)?.id,
        image
      );
    }

    let userMessageContent: any;
    if (imageUrl && !chatRoom?.live) {
      const imagePart: ChatCompletionContentPartImage = {
        type: "image_url",
        image_url: { url: imageUrl, detail: "high" },
      };
      const textPart: ChatCompletionContentPartText = {
        type: "text",
        text: message,
      };
      userMessageContent = [imagePart, textPart];
    } else {
      userMessageContent = message;
    }

    const messages = [
      { role: "system", content: AIContent },
      ...(formattedMessages as ChatCompletionMessageParam[]).map((msg: any) => {
        const formattedMsg = { ...msg };
        if (formattedMsg.role === "user" && formattedMsg.name) {
          formattedMsg.name = sanitizeName(formattedMsg.name);
        } else {
          if ("name" in formattedMsg) delete formattedMsg.name;
        }
        return formattedMsg;
      }),
      {
        role: "user",
        name: sanitizeName(name),
        content: userMessageContent,
        chatRoomId,
      },
    ];

    // Live agent room — emit socket and return
    if (chatRoom?.live && chatRoom?.mailed) {
      if (io) {
        io.to(chatRoomId).emit("message", {
          id: (userMessage as any)?._id ?? (userMessage as any)?.id,
          chatRoomId,
          seen: true,
          name,
          message,
          role: name === "ai" ? "ai" : "user",
          createdAt: new Date(),
        });
      }
      return {
        id: (userMessage as any)?._id ?? (userMessage as any)?.id,
        message,
        status: 200,
        chatRoomId,
      };
    }

    // Credit check
    if (
      (userInfo?.subscription?.plan === "STANDARD" ||
        !userInfo?.subscription?.plan) &&
      (userInfo?.credits ?? 0) >= 12
    ) {
      return {
        id: randomUUID(),
        message: "You have exceeded your chat credits.",
        status: 404,
        chatRoomId,
      };
    }

    let aiResponse = "";
    const isClaudeModel = bot?.chatModel?.toLowerCase().includes("claude");

    if (isClaudeModel) {
      const anthropicMessages = convertToAnthropicMessages(messages as any);
      const response = await anthropic.messages.create({
        messages: anthropicMessages,
        model: bot!.chatModel!,
        max_tokens: 4096,
      });
      const block = response.content.find((b: any) => "text" in b);
      aiResponse = (block as any)?.text ?? "";
    } else {
      const response = await openai.chat.completions.create({
        messages: messages as any,
        model: bot?.chatModel!,
      });
      aiResponse = response.choices?.[0]?.message.content?.trim() ?? "";
    }

    // Increment credits
    if (
      (userInfo?.subscription?.plan === "STANDARD" ||
        !userInfo?.subscription?.plan) &&
      aiResponse &&
      userInfo?._id
    ) {
      await fetchMutation(api.users.incrementCredits, {
        userId: userInfo._id as any,
      });
    }

    // Appointment booking
    if (chatbot?.botType === "Appointment" && aiResponse) {
      let appointmentData: any;
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try { appointmentData = JSON.parse(jsonMatch[1].trim()); } catch {}
      } else {
        const jsonObjectMatch = aiResponse.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
        if (jsonObjectMatch) {
          try { appointmentData = JSON.parse(jsonObjectMatch[0].trim()); } catch {}
        }
      }

      if (appointmentData) {
        const serviceTypes = await getAppointmentType(chatbot?._id ?? chatbot?.id);
        const validServices = serviceTypes?.map((t: any) => t.typeName) || [];
        if (!validServices.includes(appointmentData.service_type)) {
          aiResponse = `Sorry, '${appointmentData.service_type}' is not a valid service. Available services are: ${validServices.join(", ")}. Please choose one 😊.`;
        } else {
          const appointmentPayload: AppointmentData = {
            appointmentDate: appointmentData.appointment_date,
            selectedTime: appointmentData?.appointment_time,
            appointmentType: appointmentData.service_type,
            status: "PENDING",
            email: appointmentData.user_email,
            name: appointmentData.user_name || person,
          };
          await createAppointment(appointmentPayload, chatbot?._id ?? chatbot?.id);
        }
      }
    }

    // Live agent takeover
    if (aiResponse?.includes("(realtime)")) {
      const botUser = (bot as any)?.User;
      if (botUser?.email) {
        await Promise.all([
          onMailer({ name: chatbot?.name, email: botUser.email }),
          fetchMutation(api.chat.markRoomLive, { chatRoomId: chatRoomId as any }),
        ]);
      }
      aiResponse = aiResponse.replace("(realtime)", "");
    }

    const aiMessageResult = await fetchMutation(api.chat.createChatMessage, {
      chatRoomId: chatRoomId as any,
      message: `${aiResponse}`,
      role: "ai",
      seen: true,
    });

    // Contact form
    const msgCount = await fetchQuery(api.chat.getMessageCount, {
      chatRoomId: chatRoomId as any,
    });
    if (chatbot.getDetails && msgCount <= 3) {
      await fetchMutation(api.chat.createChatMessage, {
        chatRoomId: chatRoomId as any,
        message: "Please provide your contact information:",
        role: "ai",
        type: "contact_form",
        seen: true,
      });
    }

    return {
      id: (aiMessageResult as any)?._id ?? (aiMessageResult as any)?.id,
      message: aiResponse,
      status: 200,
      chatRoomId,
    };
  } catch (err: any) {
    console.warn("error occurs while trying to send message", err);
    try {
      await fetchMutation(api.chat.createChatMessage, {
        chatRoomId: chatRoomId as any,
        message: `${err?.message}`,
        role: "ai",
        seen: true,
      });
    } catch {}
    return { status: 505, chatRoomId };
  }
};
