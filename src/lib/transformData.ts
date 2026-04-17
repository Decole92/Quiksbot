import {
  createAppointment,
  getAppointmentType,
  getBusinessHours,
} from "@/actions/appointment";
import { formatBusinessHours } from "./calendar";

import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

import { randomUUID } from "crypto";

import { convertToAnthropicMessages } from "@/lib/convertMsg";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

import { OpenAIEmbeddings } from "@langchain/openai";
import pineconeClient from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { getChatMessages } from "@/actions/chat";
import { AppointmentData } from "../../typing";
import { detectCountryFromPhoneNumber } from "./calculateStat";

export const transformData = (data: any) => {
  if (!data) return null;

  return {
    name: data?.chatBot?.[0]?.name,
    botIcon: data.ChatBot?.[0]?.botIcon,
    chatRoom:
      data.ChatBot?.[0]?.customer?.[0]?.chatRoom?.map((room: any) => ({
        id: room.id,
        createdAt: room.createdAt,
        message: room.message.map((msg: any) => ({
          id: msg.id,
          message: msg.message,
          createdAt: msg.createdAt,
        })),
      })) || [],
  };
};

export const generateAIContent = async (
  chatbot: any,
  person: string,
  characteristicData: string,
  websiteUrlData: string,
  formattedRelevantDocs: string
) => {
  let AIContent = "";

  if (chatbot?.botType === "Support") {
    AIContent = `You are a helpful AI assistant engaging with ${person} user. Your primary focus is to assist based on the following key information: ${characteristicData}, ${websiteUrlData}, ${formattedRelevantDocs}. Maintain a respectful and friendly tone, using emojis sparingly to enhance communication 😊.

    If a user's query relates to your specified content areas:
    - Provide a helpful response based on the information available to you.

    If a user's query falls outside your specified content areas:
    1. Politely explain that the topic is beyond your current knowledge.
    2. Offer the option to provide their email address for follow-up by a human agent, or let them know they can request real-time assistance by saying "I'd like real-time help."
    3. Assure them that a human agent can assist further if needed, regardless of their choice.

    Example response for off-topic queries:
    "I'm sorry, but your question is outside my area of expertise. If you'd like, you can provide your email address for a human agent to follow up, or simply say 'I'd like real-time help' if you prefer immediate assistance. Either way, I'll ensure a human assistant can help you soon!"`;
  } else if (chatbot?.botType === "Appointment") {
    const serviceTypes = await getAppointmentType(chatbot?.id);
    const businessHour = await getBusinessHours(chatbot?.id);

    const slot = formatBusinessHours(businessHour);

    const serviceList =
      serviceTypes?.map((type: any) => type.typeName).join(", ") ||
      "haircut, massage, consultation";

    AIContent = `
You are an AI-powered scheduling assistant engaging with ${person}. Your goal is to assist with scheduling appointments and provide answers based on: ${characteristicData}, ${websiteUrlData}, ${formattedRelevantDocs}. Use a friendly tone with occasional emojis 😊.

### Available Services
${serviceList}

### Business Hours
${slot}

The business hours are provided in a format like: 'Monday: 09:00-13:00, 14:00-17:00; Tuesday: 10:00-18:00; ...', where each day may have multiple open slots separated by commas.

### Your Task
Your primary task is to extract and structure appointment details from user requests. The required details are:

- **service_type**: Must match one of: ${serviceList}
- **appointment_date**: A future date (after today) and no more than 6 months from today
- **appointment_time**: Must be within the business hours for the specified date
- **user_email**: Required for confirmation

The user's name is already known as ${person}, so you do not need to ask for it.

#### Steps to Follow

1. **If all required details (service_type, appointment_date, appointment_time, user_email) are provided:**
   - **Verify service_type**: Check if it matches one of the available services: ${serviceList}. If invalid, respond: "Sorry, the provided service type is not valid. Available services are: ${serviceList}. Please choose one 😊."
   - **Validate appointment_date**: Ensure it is a future date (after today) and within 6 months. Convert the date to the correct day of the week (e.g., "20 March 2025" → "Thursday").
   - **Check business hours**:
     - Determine the day of the week from the appointment_date.
     - Look up the business hours for that day in: ${slot}.
     - Validate if the appointment_time falls within any open slots for that day. For example, if Thursday's hours are "09:00-12:00, 12:30-17:00", then 13:00 is valid, but 12:01 is not.
     - If the business is closed on that day, respond: "Sorry, we are closed on [day]. Please choose another date 😊."
     - If the time is outside the hours, respond: "Sorry, the requested time is outside our business hours. On [day], we are open from [list the slots]. Please choose a time within these hours 😊."
   - **If all validations pass**: Confirm the booking with: "Great, I've scheduled your appointment for [service_type] on [appointment_date] at [appointment_time]. A confirmation email will be sent to [user_email]." Include the details in JSON format within a code block:
     \`\`\`json
     {
       "service_type": "user-provided-service",
       "appointment_date": "YYYY-MM-DD",
       "appointment_time": "HH:MM",
       "user_name": "${person}",
       "user_email": "user-provided-email"
     }
     \`\`\`

2. **If any required details are missing:**
   - Politely ask the user to provide the missing information. For example: "I'd love to help! Could you please specify the [missing detail] for your appointment? 😊"

3. **For non-appointment queries:**
   - Respond helpfully based on ${characteristicData}, ${websiteUrlData}, ${formattedRelevantDocs} without including JSON.

### Additional Guidelines
- Parse user inputs for dates (e.g., "20 March 2025", "tomorrow") and times, converting them to "YYYY-MM-DD" and "HH:MM" (24-hour) formats.
- Handle multiple time slots per day when validating appointment_time.
- Ensure a friendly and engaging tone throughout.

### Examples
- **User**: "Book a haircut on 2025-03-01 at 10:00 with email john@example.com"
  - **Response**: "Great, I've scheduled your appointment for haircut on 2025-03-01 at 10:00. A confirmation email will be sent to john@example.com."
    \`\`\`json
    {
      "service_type": "haircut",
      "appointment_date": "2025-03-01",
      "appointment_time": "10:00",
      "user_name": "${person}",
      "user_email": "john@example.com"
    }
    \`\`\`

- **User**: "Book a haircut tomorrow"
  - **Response**: "I'd love to help! Could you please specify the time and your email for your haircut tomorrow? 😊"

- **User**: "What services do you offer?"
  - **Response**: "We offer ${serviceList}! What would you like to book today? 😊"

- **User**: "20 March 2025 at 13:00" (assuming Thursday hours: 09:00-12:00, 12:30-17:00)
  - **Response** (assuming other details are missing): "I'd love to help! I see you'd like an appointment on 20 March 2025 at 13:00. Could you please specify the service type and your email? 😊"`;
  } else if (chatbot?.botType === "Sales") {
    AIContent = `You are a helpful AI sales assistant engaging with ${person} user. Your primary focus is to assist with sales-related queries based on the following key information: ${characteristicData}, ${websiteUrlData}, ${formattedRelevantDocs}. Maintain a respectful and friendly tone, using emojis sparingly to enhance communication 😊.
    If a user's query relates to your specified content areas:
    - Provide a helpful response based on the information available to you.

    If a user's query falls outside your specified content areas:
    1. Politely explain that the topic is beyond your current knowledge.
    2. Offer the option to provide their email address for follow-up by a human agent, or let them know they can request real-time assistance by saying "I'd like real-time help."
    3. Assure them that a human agent can assist further if needed, regardless of their choice.

    Example response for off-topic queries:
    "I'm sorry, but your question is outside my area of expertise. If you'd like, you can provide your email address for a human agent to follow up, or simply say 'I'd like real-time help' if you prefer immediate assistance. Either way, I'll ensure a human assistant can help you soon!"`;
  } else if (chatbot?.prompt && chatbot?.botType === "Custom") {
    AIContent = `${chatbot.prompt} + ${characteristicData} + ${websiteUrlData} + ${formattedRelevantDocs}`;
  }

  return AIContent;
};

export const sanitizeName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9_-]/g, "") || "default_name";
};

export async function processChatMessage(
  chatbot: any,
  name: string,
  from: string,
  message: string
) {
  // Step 1: Check for existing customer and chat room
  const existingRoom = await fetchQuery(api.chat.getChatRoomByCustomerPhone, {
    chatbotId: chatbot?.id as any,
    phone: from,
  });

  let chatRoomId: string;

  // Step 2: If no customer or chat room exists, create them
  if (!existingRoom) {
    const country = detectCountryFromPhoneNumber(`+${from}`);
    const result = await fetchMutation(api.chat.createWhatsAppCustomerAndRoom, {
      chatbotId: chatbot?.id as any,
      phone: from,
      name: name || "user",
      country: country || undefined,
    });

    chatRoomId = result.chatRoomId as string;

    // Create the initial user message
    await fetchMutation(api.chat.createChatMessage, {
      chatRoomId: chatRoomId as any,
      message: message,
      role: "user",
      type: "message_text",
      seen: false,
    });

    if (!chatRoomId) {
      throw new Error(
        "Failed to retrieve chatRoomId from newly created customer"
      );
    }
  } else {
    chatRoomId = existingRoom.id as string;
  }

  // Step 3: Fetch previous messages for the chat room
  const previousMessages = await getChatMessages(chatRoomId);

  // Step 4: Fetch user subscription and API keys
  const userInfo = await fetchQuery(api.users.getUserWithSubscriptionById, {
    userId: chatbot?.userId as any,
  });

  const formattedMessages =
    previousMessages?.map((message: any) => ({
      role: message.role === "ai" ? "system" : "user",
      name: message.role === "ai" ? "system" : name,
      content: message.message,
    })) || [];

  // Step 5: Fetch bot with source data
  const bot = await fetchQuery(api.chatbots.getBotById, {
    id: chatbot?.id as any,
  });

  const fileIds = bot?.Source?.pdfFile?.map((pdf: any) => pdf.id) || [];
  if (!fileIds.length) {
    console.warn("No PDF files found for this chatbot.");
  }

  const anthropic = new Anthropic({
    apiKey:
      userInfo && userInfo?.anthropicAiKey !== null
        ? userInfo?.anthropicAiKey
        : process.env.ANTHROPIC_KEY!,
  });

  const openai = new OpenAI(
    chatbot?.chatModel?.toLowerCase().includes("deepseek")
      ? {
          baseURL: "https://api.deepseek.com",
          apiKey:
            userInfo && userInfo?.deepseekAiKey !== null
              ? userInfo?.deepseekAiKey
              : process.env.DEEPSEEK_KEY!,
        }
      : chatbot?.chatModel?.toLowerCase().includes("grok")
      ? {
          apiKey:
            userInfo && userInfo?.xaiKey !== null
              ? userInfo?.xaiKey
              : process.env.XAI_KEY,
          baseURL: "https://api.x.ai/v1",
        }
      : {
          apiKey:
            userInfo && userInfo?.openAIkey !== null
              ? userInfo?.openAIkey
              : process.env.OPENAI_KEY!,
        }
  );

  const embeddings = new OpenAIEmbeddings({
    apiKey:
      userInfo && userInfo?.openAIkey !== null
        ? userInfo?.openAIkey
        : process.env.OPENAI_KEY!,
  });

  const index = await pineconeClient.index("quiksbot");

  let allRelevantDocs = [];
  for (const fileId of fileIds) {
    const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: fileId,
    });
    const relevantDocs = await pineconeStore.similaritySearch(message, 3);
    allRelevantDocs.push(...relevantDocs);
  }

  const formattedRelevantDocs = allRelevantDocs
    .map((doc) => doc?.pageContent!)
    .join("\n\n");

  const characteristicData =
    bot?.Source?.characteristic?.map((s: any) => s.characteristic).join(" + ") || "";

  const websiteUrlData =
    bot?.Source?.webpage?.map((s: any) => s.content).join(" + ") || "";

  const AIContent = await generateAIContent(
    chatbot,
    name,
    characteristicData,
    websiteUrlData,
    formattedRelevantDocs
  );

  const messagesForAI = [
    {
      role: "system",
      content: AIContent,
    },
    ...(formattedMessages as ChatCompletionMessageParam[]).map((msg) => {
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
      content: message,
    },
  ];

  // Step 6: Save the user message (only when we had an existing room — new rooms already created it above)
  let userMessageId: string;
  if (existingRoom) {
    const userMessage = await fetchMutation(api.chat.createChatMessage, {
      chatRoomId: chatRoomId as any,
      message: message,
      role: "user",
      seen: true,
    });
    userMessageId = (userMessage as any)?._id ?? (userMessage as any)?.id ?? randomUUID();
  } else {
    userMessageId = randomUUID();
  }

  if (
    (userInfo?.subscription?.plan === "STANDARD" ||
      !userInfo?.subscription?.plan) &&
    (userInfo?.credits ?? 0) >= 12
  ) {
    return {
      id: randomUUID(),
      message: "You have exceeded your chat credits.",
      status: 404,
    };
  }

  // Step 7: Generate AI response
  let anthropicResponse;
  let openaiResponse;

  if (chatbot?.chatModel.toLowerCase().includes("claude")) {
    const anthropicMessages = convertToAnthropicMessages(messagesForAI as any);
    anthropicResponse = await anthropic.messages.create({
      messages: anthropicMessages,
      model: chatbot.chatModel,
      max_tokens: 4096,
    });
  } else {
    openaiResponse = await openai.chat.completions.create({
      messages: messagesForAI as any,
      model: chatbot?.chatModel!,
    });
  }

  let aiResponse = chatbot?.chatModel?.toLowerCase().includes("claude")
    ? anthropicResponse?.content.find((block) => "text" in block)?.text
    : openaiResponse?.choices?.[0]?.message.content?.trim();

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

  // Step 8: Handle Appointment logic
  if (chatbot?.botType === "Appointment" && aiResponse) {
    let appointmentData;
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        appointmentData = JSON.parse(jsonMatch[1].trim());
      } catch (error) {
        console.error("Error parsing JSON from Markdown block:", error);
      }
    } else {
      const jsonObjectMatch = aiResponse.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/);
      if (jsonObjectMatch) {
        try {
          appointmentData = JSON.parse(jsonObjectMatch[0].trim());
        } catch (error) {
          console.error("Error parsing raw JSON:", error);
        }
      }
    }

    if (appointmentData) {
      const serviceTypes = await getAppointmentType(chatbot?.id);
      const validServices =
        serviceTypes?.map((type: any) => type.typeName) || [];

      if (!validServices.includes(appointmentData.service_type)) {
        aiResponse = `Sorry, '${
          appointmentData.service_type
        }' is not a valid service. Available services are: ${validServices.join(
          ", "
        )}. Please choose one 😊.`;
      } else {
        const appointmentPayload: AppointmentData = {
          appointmentDate: appointmentData.appointment_date,
          selectedTime: appointmentData.appointment_time,
          appointmentType: appointmentData.service_type,
          status: "PENDING",
          email: appointmentData.user_email,
          name: appointmentData.user_name || name,
        };
        await createAppointment(appointmentPayload, chatbot?.id);
      }
    } else {
      aiResponse =
        aiResponse ||
        "I'd love to help! Could you please specify all required details (service type, date, time, and your email) for your appointment? 😊";
    }
  }

  // Step 9: Save AI response
  await fetchMutation(api.chat.createChatMessage, {
    chatRoomId: chatRoomId as any,
    message: aiResponse!,
    role: "ai",
    seen: true,
  });

  return {
    id: userMessageId,
    message: aiResponse,
    status: 200,
  };
}
