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

    const systemCharacteristicData = bot?.Source?.characteristic
      ?.map((s: any) => s.characteristic)
      .join(" + ");

    //console.log("this is systemPromptData", systemCharacteristicData);

    let AIContent = "";

    if (chatbot?.getDetails && chatbot?.botType === "SalesBot") {
      AIContent = `You are a helpful assistant talking to ${name}. If a generic question is asked which is not relevant or in the same scope or domain as the points in mentioned in the key information section, kindly inform the user they are only allowed to search for the specified content . use Emoji's where possible be respectful. Here is somekey information that you need to be aware of, there are the elements you may be asked about: ${systemCharacteristicData}, ${formattedRelevantDocs}, but if the customer says something out of context or inapporpriate. Simply say this is beyond you and you will get a real user to continue the conversation and add a keyword (realtime) at the end.`;
    } else if (chatbot?.botType === "ChatPdf") {
      // AIContent = `Given the above conversation, generate a serach query to look up inorder to get information relevant to the conversation`
      // AIContent = `Answer users questions based on the contexts:  ${systemCharacteristicData}, ${formattedRelevantDocs}`;
      AIContent = `I can help you with information extracted from our available documents. My responses will be based on these key contexts: ${systemCharacteristicData}, along with relevant document details: ${formattedRelevantDocs}. Please focus your questions on the content of these documents, and I'll do my best to provide accurate answers!.`;
    } else if (chatbot?.prompt && chatbot?.botType === "Custom") {
      // AIContent = `You have some customized questions ${chatbot?.prompt}  regarding this ${systemCharacteristicData}, ${formattedRelevantDocs} `;
      AIContent = `You have access to customized information tailored to your specific needs. You can ask me questions about the following topics: ${systemCharacteristicData}, and I can also assist you with information from these documents: ${formattedRelevantDocs}. Additionally, you have some custom queries or scenarios provided, which are: ${chatbot?.prompt}. Please keep your questions within this framework for the most relevant responses. If a question is outside this scope, I will escalate it to a real user to continue the conversation and add a keyword (realtime) at the end.`;
    } else if (!chatbot?.getDetails && chatbot?.botType === "SalesBot") {
      AIContent = `You are a helpful assistant speaking with an anonymous user. If a user asks a question that is outside the topics you're trained to cover, politely inform them that they are limited to the specified content. Stay respectful, friendly, and use emojis where appropriate 😊.
  
        Here is the key information you should be focusing on: ${systemCharacteristicData}, ${formattedRelevantDocs}. If the user asks something off-topic or inappropriate, kindly explain that the query is beyond your scope, and let them know a real person will assist them shortly.
        
        Before proceeding, ask if they would like to provide their email address so that we can follow up with a human agent. For example, you could say: 'It seems your question is beyond my expertise. I can connect you with a human assistant. Could you please provide your email address so we can get back to you?  and add a keyword (realtime) at the end.
        
        If they provide their email, confirm it politely. If they refuse, simply acknowledge and inform them that a human agent will continue the conversation shortly`;
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
            ? onMailer(getUser?.User?.email, chatbot?.name)
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
