"use server";
import OpenAI from "openai";
import prisma from "../../../prisma/client";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { OpenAIEmbeddings } from "@langchain/openai";
import pineconeClient from "@/lib/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { onMailer } from "../customer";

import { serverPusher } from "@/lib/pusher";

import { ChatBot, PdfFile } from "@prisma/client";
import { randomUUID } from "crypto";
import { getChatMessages } from "./index";
export const sendMessage = async (
  message: string,
  chatRoomId: string,
  chatbot: ChatBot,
  name: string
) => {
  // const { userId } = auth();

  console.log(
    `Recieved message from chat session ${chatRoomId}: ${message} from this bot ${chatbot?.name} and client Name ${name}`
  );
  if (!message || !chatRoomId || !chatbot) return;

  // const sanitized_name = name.replace(/[^a-zA-Z0-9_-]/g, "");
  const sanitizeName = (name: string) => {
    return name.replace(/[^a-zA-Z0-9_-]/g, "") || "default_name";
  };

  try {
    const previousMessages = await getChatMessages(chatRoomId);

    const userInfo = await prisma.user.findFirst({
      where: {
        id: chatbot && chatbot?.userId!,
      },
      include: {
        subscription: true,
      },
    });

    const formattedMessages = previousMessages?.map((message: any) => ({
      role: message?.role === "ai" ? "system" : "user",
      name: message?.role === "ai" ? "system" : name,
      content: message?.message,
    }));

    //characteristic data
    const bot = await prisma.chatBot.findUnique({
      where: {
        id: chatbot?.id,
      },
      include: {
        Source: {
          include: {
            characteristic: true,
            pdfFile: true,
            webpage: true,
          },
        },
      },
    });

    const fileIds = bot?.Source?.pdfFile?.map((pdf: PdfFile) => pdf.id);
    if (!fileIds || fileIds.length === 0) {
      console.log("No PDF files found for this chatbot.");
      //return;
    }

    const openai = new OpenAI({
      // apiKey: process.env.OPENAI_KEY!,
      apiKey:
        userInfo && userInfo?.openAIkey !== null
          ? userInfo?.openAIkey
          : process.env.OPENAI_KEY!,
    });

    const embeddings = new OpenAIEmbeddings({
      apiKey:
        userInfo && userInfo?.openAIkey !== null
          ? userInfo?.openAIkey
          : process.env.OPENAI_KEY!,
    });

    const index = await pineconeClient.index("quiksbot");

    // Initialize an array to hold all relevant documents
    let allRelevantDocs = [];

    // Loop through each fileId (namespace) and perform the similarity search
    for (const fileId of fileIds!) {
      const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: index,
        namespace: fileId,
      });

      const relevantDocs = await pineconeStore.similaritySearch(message);

      allRelevantDocs.push(...relevantDocs);
    }

    const formattedRelevantDocs = allRelevantDocs
      .map((doc) => doc?.pageContent!)
      .join("\n\n");

    //console.log(`this is formattedRelevantDocs ${formattedRelevantDocs}`);

    const characteristicData = bot?.Source?.characteristic
      ?.map((s) => s.characteristic)
      .join(" + ");

    const websiteUrlData = bot?.Source?.webpage
      ?.map((s) => s.content)
      .join(" + ");

    //console.log("this is systemPromptData", systemCharacteristicData);
    const person = !name ? "an anonymous" : name;

    let AIContent = "";

    if (chatbot?.botType === "Defaults") {
      AIContent = `You are a helpful AI assistant engaging with ${person} user. Your primary focus is on the following key information: ${characteristicData}, ${websiteUrlData}, ${formattedRelevantDocs}. Maintain a respectful, friendly tone and use emojis judiciously to enhance communication 😊.
      If a user's query falls within your specified content areas:
       - Respond helpfully based on your knowledge.
       - Do not add the "(realtime)" keyword to your response.
       
       If a user's query falls outside your specified content areas:
       1. Politely inform them that the topic is beyond your current scope.
       2. Ask if they would like to provide their email address for follow-up with a human agent.
       3. Whether they provide an email or not, assure them that a human agent will assist them shortly.
       4. Add the keyword "(realtime)" at the very end of your response.
       
       Example response for off-topic queries:
       "I apologize, but your question is outside my area of expertise. Would you like to provide your email address so a human agent can follow up with you? Regardless of your choice, I'll make sure a human assistant continues this conversation soon. (realtime)"
       
       If they provide an email:
       - Confirm receipt politely: "Thank you for providing your email. A human agent will contact you soon. (realtime)"
       
       If they decline to provide an email:
       - Acknowledge their decision: "I understand. A human agent will continue this conversation shortly. (realtime)"
       
       Always prioritize user privacy and data protection. Be helpful within your defined scope, and gracefully hand off to human support when necessary.`;
    } else if (chatbot?.botType === "Services") {
      AIContent = `You are a helpful AI assistant engaging with a user named ${person}. Your main goal is to address the following specific information: ${characteristicData}, ${websiteUrlData}, ${formattedRelevantDocs}. Maintain a friendly, respectful tone, and enhance communication with occasional emojis 😊.
    If a user's question is relevant to your specified content areas:
   - Provide a thorough, accurate response within your knowledge.
   - **Do not** include the keyword "(realtime)" in your response.
  If a user's question is beyond your content areas:
   1. Politely explain that their question falls outside your current scope.
   2. Offer to collect their email address to connect them with a human agent for a follow-up.
   3. Assure them that a human agent will continue the conversation shortly, whether or not they provide an email address.
   4. **Add "(realtime)" at the end of your response** to signal human assistance is incoming.
  
   Examples of off-topic responses:
   - If they decline to provide an email: 
     - "I understand. A human agent will continue this conversation shortly. (realtime)"
   - If they provide an email: 
     - "Thank you for providing your email. A human agent will be in touch soon. (realtime)"
   - If they neither accept nor decline:
     - "A human agent will follow up shortly to help you further. (realtime)"

**Appointment Requests**: If the user requests to book an appointment, guide them to fill out the appointment form on their screen. Also, include **"(appointment)"** at the end of your response to indicate their booking intent.

Always prioritize user privacy and data protection, assisting within your knowledge boundaries and efficiently passing the conversation to human support when needed.`;
    } else if (chatbot?.prompt && chatbot?.botType === "Custom") {
      AIContent = `You have access to customized information tailored to your specific needs. You can ask me questions about the following topics: ${characteristicData}, ${websiteUrlData}, and I can also assist you with information from these documents: ${formattedRelevantDocs}. Additionally, you have some custom queries or scenarios provided, which are: ${chatbot?.prompt}. Please keep your questions within this framework for the most relevant responses. If a question is outside this scope, I will escalate it to a real user to continue the conversation and add a keyword (realtime) at the end.`;
    }

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        name: "system",
        content: AIContent,
      },

      // ...(formattedMessages as ChatCompletionMessageParam[]),
      ...(formattedMessages as ChatCompletionMessageParam[]).map((msg) => ({
        ...msg,
        name: sanitizeName(msg?.role || "default_name"), // Sanitize name
      })),

      {
        role: "user",
        // name: sanitized_name,
        name: sanitizeName(name),
        content: message,
      },
    ];

    const chatRoom = await prisma.chatRoom.findUnique({
      where: {
        id: chatRoomId,
      },
    });

    if (chatRoom?.live && chatRoom?.mailed) {
      const newMessage = await prisma.chatMessage.create({
        data: {
          message: `${message}`,
          //role: "ai",
          role: name === "ai" ? "ai" : "user",
          ChatRoom: {
            connect: {
              id: chatRoomId,
            },
          },
          seen: true,
        },
      });
      console.log("this is id", newMessage.id);
      // Trigger serverPusher for real-time updates
      serverPusher.trigger("message", "realtime", {
        id: newMessage.id,
        chatRoomId,
        seen: true,
        name,
        message,
        role: name === "ai" ? "ai" : "user",
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.createdAt,
      });

      return {
        id: newMessage.id,
        message: message,
        status: 200,
      };
    } else {
      if (
        (userInfo?.subscription?.plan === "STANDARD" ||
          !userInfo?.subscription?.plan) &&
        userInfo?.credits! >= 25
      ) {
        return {
          id: randomUUID(),
          message: "You have exceed you chat credits.",
          status: 404,
        };
      }

      const openaiResponse = await openai.chat.completions.create({
        messages: messages,
        model: chatbot?.chatModel!,
      });

      const aiResponse1 = openaiResponse.choices?.[0]?.message.content?.trim();
      let aiResponse;

      if (
        (userInfo?.subscription?.plan === "STANDARD" ||
          !userInfo?.subscription?.plan) &&
        aiResponse1
      ) {
        console.log("credited 1 chat");

        const up = await prisma.user.update({
          where: {
            id: userInfo?.id!,
          },
          data: {
            credits: {
              increment: 1,
            },
          },
        });
        console.log("up", up);
      }

      if (!aiResponse1) {
        console.log("Failed to generate AI Response");
      }

      const aiResponseFilter = aiResponse1?.includes("(realtime)");
      const aiResponseFilter2 = aiResponse1?.includes("(appointment)");

      if (aiResponseFilter) {
        console.log("live agent required here");
        const getUser = await prisma?.chatBot.findUnique({
          where: {
            id: chatbot?.id!,
          },
          include: {
            User: {
              select: {
                email: true,
              },
            },
          },
        });

        const sender =
          getUser && getUser?.User?.email
            ? onMailer({
                name: chatbot?.name,
                email: getUser?.User.email!,
              })
            : null;

        if (sender) {
          await prisma.chatRoom
            .update({
              where: {
                id: chatRoomId,
              },
              data: {
                live: true,
                mailed: true,
              },
            })
            .then(() => {
              aiResponse = aiResponse1?.replace("(realtime)", "");
            });
        }
      } else {
        aiResponse = aiResponse1;
        console.log("live mode not required yet");
      }

      await prisma.chatMessage.create({
        data: {
          message: `${message}`,
          role: "user",
          ChatRoom: {
            connect: {
              id: chatRoomId,
            },
          },
          seen: true,
        },
      });

      const aiMessageResult = await prisma.chatMessage.create({
        data: {
          message: `${aiResponse}`,
          role: "ai",
          ChatRoom: {
            connect: {
              id: chatRoomId,
            },
          },
          seen: true,
        },
      });

      if (aiResponseFilter2) {
        await prisma.chatMessage
          .create({
            data: {
              message: "Please book your appointment schedule:",
              role: "user",
              type: "appointment_form",
              ChatRoom: {
                connect: {
                  id: chatRoomId,
                },
              },
              seen: true,
            },
          })
          .then(() => {
            aiResponse = aiResponse1?.replace("(appointment)", "");
          });
      }

      const foundFirstRow = await prisma.chatMessage.findMany({
        where: {
          chatRoomId: chatRoomId,
        },
      });
      console.log("this is foundFirstRow length", foundFirstRow.length);
      if (chatbot.getDetails && foundFirstRow.length <= 3) {
        // console.log("contact_form added");
        await prisma.chatMessage.create({
          data: {
            message: "Please provide your contact information:",
            role: "ai",
            type: "contact_form",
            ChatRoom: {
              connect: {
                id: chatRoomId,
              },
            },
            seen: true,
          },
        });
      }

      return {
        id: aiMessageResult?.id,
        message: aiResponse,
        status: 200,
      };
    }
  } catch (err) {
    console.log("error occurs while trying to send message", err);
    return {
      status: 505,
    };
  }
};
