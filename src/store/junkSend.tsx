// "use server";
// import OpenAI from "openai";
// import prisma from "../../../prisma/client";
// import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import pineconeClient from "@/lib/pinecone";
// import { PineconeStore } from "@langchain/pinecone";
// import { onMailer } from "../customer";
// import { auth, clerkClient } from "@clerk/nextjs/server";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY!,
// });

// export const startNewChat = async ({
//   userDetails,
//   id,
// }: {
//   userDetails: {
//     name: string;
//     email: string;
//   };
//   id: string;
// }) => {
//   const { name, email } = userDetails;
//   try {
//     const chatbot = await prisma.chatBot.findUnique({
//       where: {
//         id: id,
//       },
//     });

//     if (!chatbot) return;

//     const customer = await prisma.customer.create({
//       data: {
//         name: name,
//         email: email,
//         Chatbot: {
//           connect: { id: id },
//         },
//       },
//     });

//     // Log and return the customer ID
//     console.log("customerId", customer.id, name, email);
//     const customerId = customer?.id;

//     //insert chatRoom

//     const chatSession = await prisma.chatRoom.create({
//       data: {
//         Customer: {
//           connect: {
//             id: customerId,
//           },
//         },
//       },
//     });

//     const chatSessionId = chatSession?.id;

//     //insert initial message

//     await prisma.chatMessage.create({
//       data: {
//         message: `${chatbot?.greetings}  `,
//         role: "ai",
//         ChatRoom: {
//           connect: {
//             id: chatSessionId,
//           },
//         },
//         seen: true,
//       },
//     });

//     return chatSessionId;
//   } catch (err) {
//     console.log("err occurs while creating new chat room ", err);
//   }
// };

// export const getChatMessages = async (chatRoomId: string) => {
//   try {
//     const messages = await prisma.chatMessage.findMany({
//       where: {
//         chatRoomId: chatRoomId,
//       },
//     });

//     // console.log("this is messages", messages);
//     return messages;
//   } catch (err) {
//     console.log("err occurs while getting chat messages", err);
//   }
// };

// export const getChatRoom = async (chatRoomId: string) => {
//   try {
//     const chatroom = await prisma.chatRoom.findUnique({
//       where: {
//         id: chatRoomId,
//       },
//       include: {
//         message: true,
//       },
//     });

//     // console.log("this is messages", messages);
//     return chatroom;
//   } catch (err) {
//     console.log("err occurs while getting chat messages", err);
//   }
// };

// export const sendMessage = async (
//   message: string,
//   chatRoomId: string,
//   chatbot: ChatBot,
//   name: string
// ) => {
//   const { userId } = auth();

//   console.log(
//     `Recieved message from chat session ${chatRoomId}: ${message} from this bot ${chatbot?.name} and client Name ${name}`
//   );
//   if (!message || !chatRoomId || !chatbot) return;

//   const sanitized_name = name.replace(/[^a-zA-Z0-9_-]/g, "");
//   try {
//     const previousMessages = await getChatMessages(chatRoomId);

//     const formattedMessages = previousMessages?.map((message) => ({
//       role: message?.role === "ai" ? "system" : "user",
//       name: message?.role === "ai" ? "system" : name,
//       content: message?.message,
//     }));

//     //TODO

//     //characteristic data
//     const bot = await prisma.chatBot.findUnique({
//       where: {
//         id: chatbot?.id,
//       },
//       include: {
//         Source: {
//           include: {
//             characteristic: true,
//             pdfFile: true,
//           },
//         },
//       },
//     });

//     const fileIds = bot?.Source?.pdfFile?.map((pdf) => pdf.id);
//     if (!fileIds || fileIds.length === 0) {
//       console.log("No PDF files found for this chatbot.");
//       //return;
//     }

//     const embeddings = new OpenAIEmbeddings({
//       apiKey: process.env.OPENAI_KEY!,
//     });

//     const index = await pineconeClient.index("quiksbot");

//     // Initialize an array to hold all relevant documents
//     let allRelevantDocs = [];

//     // Loop through each fileId (namespace) and perform the similarity search
//     for (const fileId of fileIds!) {
//       const pineconeStore = await PineconeStore.fromExistingIndex(embeddings, {
//         pineconeIndex: index,
//         namespace: fileId,
//       });

//       const relevantDocs = await pineconeStore.similaritySearch(message);

//       allRelevantDocs.push(...relevantDocs);
//     }

//     const formattedRelevantDocs = allRelevantDocs
//       .map((doc) => doc?.pageContent!)
//       .join("\n\n");

//     //console.log(`this is formattedRelevantDocs ${formattedRelevantDocs}`);

//     const systemCharacteristicData = bot?.Source?.characteristic
//       ?.map((s) => s.characteristic)
//       .join(" + ");

//     //console.log("this is systemPromptData", systemCharacteristicData);

//     const messages: ChatCompletionMessageParam[] = [
//       {
//         role: "system",
//         name: "system",
//         content: `You are a helpful assistant talking to ${name}. If a generic question is asked which is not relevant or in the same scope or domain as the points in mentioned in the key information section, kindly inform the user they are only allowed to search for the specified content . use Emoji's where possible be respectful. Here is somekey information that you need to be aware of, there are the elements you may be asked about: ${systemCharacteristicData}, ${formattedRelevantDocs}, but if the customer says something out of context or inapporpriate. Simply say this is beyond you and you will get a real user to continue the conversation and add a keyword (realtime) at the end.`,
//       },

//       ...(formattedMessages as ChatCompletionMessageParam[]),
//       {
//         role: "user",
//         name: sanitized_name,
//         content: message,
//       },
//     ];

//     const openaiResponse = await openai.chat.completions.create({
//       messages: messages,
//       model: chatbot?.chatModel!,
//     });

//     const aiResponse1 = openaiResponse.choices?.[0]?.message.content?.trim();
//     let aiResponse;

//     if (!aiResponse1) {
//       console.log("Failed oto generate AI Response");
//     }
//     const aiResponseFilter = aiResponse1?.includes("(realtime)");

//     const user = await clerkClient.users.getUser(userId!);

//     if (aiResponseFilter) {
//       console.log("live agent required here");
//       onMailer(user.emailAddresses[0].emailAddress);
//       await prisma.chatRoom
//         .update({
//           where: {
//             id: chatRoomId,
//           },
//           data: {
//             live: true,
//             mailed: true,
//           },
//         })
//         .then(() => {
//           aiResponse = aiResponse1?.replace("(realtime)", "");
//         });
//     } else {
//       aiResponse = aiResponse1;
//       console.log("live mode not required yet");
//     }

//     await prisma.chatMessage.create({
//       data: {
//         message: `${message}`,
//         role: "user",
//         ChatRoom: {
//           connect: {
//             id: chatRoomId,
//           },
//         },
//         seen: true,
//       },
//     });

//     const aiMessageResult = await prisma.chatMessage.create({
//       data: {
//         message: `${aiResponse}`,
//         role: "ai",
//         ChatRoom: {
//           connect: {
//             id: chatRoomId,
//           },
//         },
//         seen: true,
//       },
//     });

//     return {
//       id: aiMessageResult?.id,
//       message: aiResponse,
//     };
//   } catch (err) {
//     console.log("error occurs while trying to send message", err);
//   }
// };

// setChatRoom(getChatRoom(selectedChatRoomId!), {
//   optimisticData: [...(chatMessages as ChatMessage[]), data],
//   rollbackOnError: true,
//   populateCache: false,
//   revalidate: false,
// });
