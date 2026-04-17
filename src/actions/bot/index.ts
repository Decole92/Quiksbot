"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import {
  BASE_URL,
  PRO_CHATBOT_LIMIT,
  STANDARD_CHATBOT_LIMIT,
  ULTIMATE_CHATBOT_LIMIT,
} from "../../../constant/url";

import pineconeClient from "@/lib/pinecone";
import { indexName } from "@/lib/langchain";
import { onMailer } from "../customer";
import { getUserSub } from "../user";

export const updateBotName = async (
  id: string,
  name: string,
  role: string,
  imageUrl: string
) => {
  try {
    await fetchMutation(api.chatbots.updateBotName, {
      id: id as any,
      name,
      role,
      botIcon: imageUrl || undefined,
    });
    revalidatePath(`/edit-chatbot/${id}`);
    return { completed: true };
  } catch (err) {
    console.error("error occur while updating bot name and tagline", err);
  }
};

export const updateFirstQuestion = async (
  chatbotId: string,
  question: string
) => {
  if (!question && !chatbotId) return;

  try {
    const newFirstQuestion = await fetchMutation(api.chatbots.addFirstQuestion, {
      chatbotId: chatbotId as any,
      question,
    });

    revalidatePath(`${BASE_URL}/edit-chat/${chatbotId}`);
    return newFirstQuestion;
  } catch (err) {
    console.error("error occur while add questions to the chatbot", err);
  }
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const getBot = async (id: string) => {
  if (!id || UUID_RE.test(id)) return null;
  try {
    const bot = await fetchQuery(api.chatbots.getBotById, { id: id as any });
    return bot;
  } catch (err) {
    console.error("err occurs while fetching bot", err);
    return null;
  }
};

export const RemoveSuggestionId = async (id: string) => {
  if (!id) return;

  try {
    const remove = await fetchMutation(api.chatbots.removeFirstQuestion, {
      id: id as any,
    });
    return remove;
  } catch (err) {
    throw new Error("error has occur while removing suggestion question");
  }
};

export const RemoveCharacteristicId = async (id: string) => {
  if (!id) return;

  try {
    const remove = await fetchMutation(api.sources.removeCharacteristic, {
      id: id as any,
    });
    revalidatePath(`/edit-chatbot/${id}`);
    return remove;
  } catch (err) {
    console.error("error has occur while removing suggestion question");
  }
};

export const updateGreetings = async (id: string, greetings: string) => {
  if (!id) return;

  try {
    const updated = await fetchMutation(api.chatbots.updateGreetings, {
      id: id as any,
      greetings,
    });
    return updated;
  } catch (err) {
    console.error("error has occur while updating greetings ");
  }
};

export const updateColor = async (id: string, color: string) => {
  if (!id) return;

  try {
    const updated = await fetchMutation(api.chatbots.updateColor, {
      id: id as any,
      color,
    });
    return updated;
  } catch (err) {
    console.error("error has occur while updating userBgcolorPallete ");
  }
};

export const updateTheme = async (id: string, watermark: boolean) => {
  if (!id) return;
  try {
    const updated = await fetchMutation(api.chatbots.updateWatermark, {
      id: id as any,
      watermark,
    });
    return updated;
  } catch (err) {
    console.error("error has occur while updating theme ");
  }
};

export const getChatBotByUser = async (id: string) => {
  const getUser = await currentUser();
  if (!id) {
    console.error("No ID provided");
    return null;
  }

  try {
    let user = await fetchQuery(api.users.getUserByClerkId, { clerkId: id });

    if (!user) {
      user = await fetchMutation(api.users.createUser, {
        fullname: getUser?.fullName!,
        clerkId: getUser?.id!,
        type: "owner",
        email: getUser?.emailAddresses[0].emailAddress!,
      });

      const welcomeMail = {
        from: process.env.NODE_MAILER_EMAIL,
        to: user?.email,
        subject: "🎉 Welcome to QUIKSBOT – Let's Get Started!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to QUIKSBOT</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  color: #555;
                  background-color: #f4f4f4;
                }
                .container {
                  background-color: #ffffff;
                  border-radius: 10px;
                  padding: 20px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .header h1 {
                  color: #333;
                  font-size: 24px;
                  margin-top: 0;
                }
                .button {
                  background-color: #E1B177;
                  color: white;
                  padding: 12px 25px;
                  text-decoration: none;
                  border-radius: 5px;
                  display: inline-block;
                  font-weight: bold;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  margin: 20px 0;
                }
                .footer {
                  font-size: 14px;
                  color: #777;
                  border-top: 1px solid #eee;
                  padding-top: 15px;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to QUIKSBOT, ${getUser?.firstName}!</h1>
                </div>
                <p>We're thrilled to have you join our community! At QUIKSBOT, we're committed to helping you connect with your customers in real-time, offering seamless chat support and making every interaction count.</p>

                <p>Here's a quick overview of what you can do:</p>
                 <ul>
                 <li><strong>Secure PDF Storage:</strong> Safely store and access important PDF files for chatbot training and reference.</li>
                 <li><strong>Customizable Website Chatbots:</strong> Seamlessly embed AI chatbots on your website to engage visitors and capture leads.</li>
                 <li><strong>WhatsApp Integration:</strong> Connect your chatbot via WhatsApp to expand reach and enhance real-time engagement.</li>
                 <li><strong>Effortless Appointment Scheduling:</strong> Use Quiksbot to quickly schedule appointments and manage bookings with ease.</li>
                 <li><strong>Detailed Analytics:</strong> Track chatbot performance, user interactions, and engagement metrics with in-depth analytics.</li>
                 <li><strong>Flexible AI Models:</strong> Switch between ChatGPT, Claude, Grok, Deepseek, and more to suit your use case.</li>
                 <li><strong>Live Agent Handoff:</strong> Let users transition from chatbot to human support when needed for a seamless experience.</li>
                 <li><strong>API Key Integration:</strong> Use your own OpenAI, XAI, Deepseek, or Anthropic API keys for full control and customization.</li>
                 <li><strong>Chat Memory:</strong> Maintain conversation history to enable more personalized and context-aware interactions.</li>
                  <li><strong>Prompt Customization:</strong> Tailor chatbot responses by customizing prompts to reflect your brand and business logic.</li>
                  <li><strong>Role-Based Bot Deployment:</strong> Deploy Sales, Support, or Appointment bots to drive conversions and assist users effectively.</li>
                  <li><strong>Downloadable Chat Logs:</strong> Export complete conversations in PDF format for record-keeping and analysis.</li>
                  <li><strong>Knowledge Empowerment:</strong> Train bots using your website content, context, and PDF files for accurate, informed responses.</li>
                  <li><strong>Email Marketing Tools:</strong> Create targeted campaigns with customizable content, audience management, and performance tracking.</li>
</ul>


                <div style="text-align: center;">
                  <a href="https://quiksbot.com/dashboard" class="button">Go to Your Dashboard</a>
                </div>

                <p>If you have any questions or need assistance getting started, our support team is just a click away. Feel free to reach out anytime!</p>

                <div class="footer">
                  <p>Thank you for choosing QUIKSBOT. We're excited to be part of your journey!</p>
                  <p>© 2023 QUIKSBOT. All rights reserved.</p>
                  <p><small>This email was sent automatically. Please do not reply.</small></p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await onMailer({}, welcomeMail as any);
    }

    const getBotByUser = await fetchQuery(api.chatbots.getBotsByUserId, {
      userId: user!._id as any,
    });

    return getBotByUser;
  } catch (err) {
    console.error("An error occurred while getting chatbot by user: ", err);
    return null;
  }
};

export const getUserChatbots = async (id: string) => {
  if (!id) throw new Error("no valid id found");

  try {
    const getUser = await fetchQuery(api.users.getUserByClerkId, { clerkId: id });
    if (!getUser) throw new Error("no user fetched...");

    const chatbotLength = await fetchQuery(api.chatbots.getChatbotCount, {
      userId: getUser._id as any,
    });

    return chatbotLength;
  } catch (err) {
    throw new Error(
      "occur occurs while trying to fetch chatbot size",
      (err as any).message
    );
  }
};

export const updateChatbotPosition = async (
  id: string,
  position: string,
  icon: string
) => {
  const { userId } = await auth();
  if (!userId && !id) return;

  try {
    const updated = await fetchMutation(api.chatbots.updateChatbotPosition, {
      id: id as any,
      position,
      icon: icon || undefined,
    });
    return updated;
  } catch (err) {
    console.error(
      "An error occurred while update icon and iconPosition ",
      err as any
    );
    return null;
  }
};

export const createNewChatbot = async (botName: string, fullName: string) => {
  const getUser = await currentUser();
  const { userId } = await auth();
  try {
    if (!userId || !botName) throw new Error("no valid userId found!!");
    const hasActiveMembership = await getUserSub(userId);
    const chatbotlength = await getUserChatbots(userId);

    let user = await fetchQuery(api.users.getUserByClerkId, { clerkId: userId });

    const chatbotLimitValue =
      hasActiveMembership === "STANDARD"
        ? STANDARD_CHATBOT_LIMIT
        : hasActiveMembership === "PRO"
        ? PRO_CHATBOT_LIMIT
        : ULTIMATE_CHATBOT_LIMIT;

    if (!user) {
      user = await fetchMutation(api.users.createUser, {
        fullname: fullName,
        clerkId: userId,
        type: "owner",
        email: getUser?.emailAddresses[0]?.emailAddress!,
      });
    }
    if (!chatbotLimitValue) throw new Error("didn't get chatbot length");

    if (chatbotlength !== undefined && chatbotlength >= chatbotLimitValue) return;

    const chatbot = await fetchMutation(api.chatbots.createChatbot, {
      name: botName,
      userId: user!._id as any,
      greetings: "Hey 👋 , How can we help you today?",
      role: "Customer support agent",
    });
    revalidatePath("/dashboard");

    return {
      chatbot,
      completed: true,
    };
  } catch (err: any) {
    console.error(
      "There is a unique constraint violation, a new user cannot be created with this email"
    );

    return { err, status: 500, completed: false };
  }
};

export const addCharacteristic = async (
  chatbotId: string,
  characteristic: string
) => {
  try {
    const { userId } = await auth();

    if (!userId || !characteristic || !chatbotId) return;

    const newCharacteristic = await fetchMutation(api.sources.addCharacteristic, {
      chatBotId: chatbotId as any,
      characteristic,
    });

    revalidatePath(`/edit-chatbot/${chatbotId}`);

    return newCharacteristic;
  } catch (err) {
    throw new Error(
      "error occurs while trying to add new characteristics",
      err as any
    );
  }
};

export const deleteWebsiteUrl = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!id) throw new Error("invalid id");
  try {
    const del = await fetchMutation(api.sources.deleteWebsite, { id: id as any });
    return del;
  } catch (err) {
    throw new Error(
      "error occurs while trying to delete website url",
      err as any
    );
  }
};

export const deletePdf = async (id: string, chatbotId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!id) return;

  try {
    const Id = id;

    await fetchMutation(api.sources.deletePdfFile, { id: id as any });
    const index = await pineconeClient.index(indexName);
    await index.namespace(Id).deleteAll();
    revalidatePath(`/edit-chatbot/${chatbotId}`);
    return {
      completed: true,
    };
  } catch (err) {
    console.error("error has occur while trying to delete pdfFile", err);
    return { completed: false };
  }
};

export const deleteBot = async (sourceId: string, chatbot: any) => {
  const { userId } = await auth();

  if (!userId || !chatbot?.id) {
    console.error("Invalid parameters provided");
  }

  try {
    const index = await pineconeClient.index(indexName);

    // Get pdf files from bot's source to delete pinecone vectors
    const bot = await fetchQuery(api.chatbots.getBotById, { id: chatbot.id as any });
    const pdfFiles = bot?.Source?.pdfFile || [];

    for (const pdf of pdfFiles) {
      try {
        await index.namespace(pdf.id).deleteAll();
      } catch (deleteError) {
        console.error(
          `Failed to delete vectors for PDF: ${pdf.id}`,
          deleteError
        );
      }
    }

    // Skip image deletion (backendClient removed)

    await fetchMutation(api.chatbots.deleteBot, { id: chatbot.id as any });

    revalidatePath("/dashboard");

    return { chatbot, completed: true };
  } catch (err) {
    return { completed: false, error: "Failed to delete bot" };
  }
};
