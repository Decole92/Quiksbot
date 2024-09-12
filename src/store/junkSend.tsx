// "use server";
// import OpenAI from "openai";
// import prisma from "../../../prisma/client";
// import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import pineconeClient from "@/lib/pinecone";
// import { PineconeStore } from "@langchain/pinecone";
// import { onMailer } from "../customer";
// import {
//   User,
//   auth,
//   clerkClient,
//   currentUser,
//   getAuth,
// } from "@clerk/nextjs/server";
// import { serverPusher } from "@/lib/pusher";

// import { BASE_URL } from "../../../constant/url";
// import { ChatBot, PdfFile } from "@prisma/client";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_KEY!,
// });
// type userDetails = {
//   name: string;
//   email: string;
// };
// export const startNewChat = async ({
//   userDetails,
//   id,
// }: {
//   userDetails: userDetails;
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

//     console.log("about to get location here>>>");

//     const response = await fetch(`${BASE_URL}/api/getLocation`, {
//       method: "GET",
//       headers: {
//         "Content-type": "application/json",
//       },
//     });
//     const data = await response.json();

//     console.log("this is data server side", data);
//     const { country, city, lat, lng } = data;

//     const customer = await prisma.customer.create({
//       data: {
//         name: name,
//         email: email,
//         country: country ? country : null,
//         city: city ? city : null,
//         lat: lat ? lat.toString() : null,
//         lng: lng ? lng.toString() : null,

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
//         Customer: true,
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
//   // const { userId } = auth();

//   console.log(
//     `Recieved message from chat session ${chatRoomId}: ${message} from this bot ${chatbot?.name} and client Name ${name}`
//   );
//   if (!message || !chatRoomId || !chatbot) return;

//   // const sanitized_name = name.replace(/[^a-zA-Z0-9_-]/g, "");
//   if (!name || typeof name !== "string") {
//     name = "user";
//   }
//   const sanitized_name = name.replace(/[^a-zA-Z0-9_-]/g, "") || "user";

//   try {
//     const previousMessages = await getChatMessages(chatRoomId);

//     const formattedMessages = previousMessages?.map((message: any) => ({
//       role: message?.role === "ai" ? "system" : "user",
//       name: message?.role === "ai" ? "system" : name,
//       content: message?.message,
//     }));

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

//     const fileIds = bot?.Source?.pdfFile?.map((pdf: PdfFile) => pdf.id);
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
//       ?.map((s: any) => s.characteristic)
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

//     const chatRoom = await prisma.chatRoom.findUnique({
//       where: {
//         id: chatRoomId,
//       },
//     });

//     if (chatRoom?.live && chatRoom?.mailed) {
//       const newMessage = await prisma.chatMessage.create({
//         data: {
//           message: `${message}`,
//           //role: "ai",
//           role: name === "ai" ? "ai" : "user",
//           ChatRoom: {
//             connect: {
//               id: chatRoomId,
//             },
//           },
//           seen: true,
//         },
//       });

//       // Trigger serverPusher for real-time updates
//       serverPusher.trigger("message", "realtime", {
//         id: newMessage.id,
//         chatRoomId,
//         seen: true,
//         name,
//         message,
//         role: name === "ai" ? "ai" : "user",
//         createdAt: newMessage.createdAt,
//         updatedAt: newMessage.createdAt,
//       });

//       return {
//         id: newMessage.id,
//         message: message,
//       };
//     } else {
//       const openaiResponse = await openai.chat.completions.create({
//         messages: messages,
//         model: chatbot?.chatModel!,
//       });

//       const aiResponse1 = openaiResponse.choices?.[0]?.message.content?.trim();
//       let aiResponse;

//       if (!aiResponse1) {
//         console.log("Failed oto generate AI Response");
//       }
//       const aiResponseFilter = aiResponse1?.includes("(realtime)");

//       if (aiResponseFilter) {
//         console.log("live agent required here");
//         const getUser = await prisma?.chatBot.findUnique({
//           where: {
//             id: chatbot?.id!,
//           },
//           include: {
//             User: {
//               select: {
//                 email: true,
//               },
//             },
//           },
//         });

//         getUser && getUser?.User?.email ? onMailer(getUser?.User?.email) : null;
//         await prisma.chatRoom
//           .update({
//             where: {
//               id: chatRoomId,
//             },
//             data: {
//               live: true,
//               mailed: true,
//             },
//           })
//           .then(() => {
//             aiResponse = aiResponse1?.replace("(realtime)", "");
//           });
//       } else {
//         aiResponse = aiResponse1;
//         console.log("live mode not required yet");
//       }

//       await prisma.chatMessage.create({
//         data: {
//           message: `${message}`,
//           role: "user",
//           ChatRoom: {
//             connect: {
//               id: chatRoomId,
//             },
//           },
//           seen: true,
//         },
//       });

//       const aiMessageResult = await prisma.chatMessage.create({
//         data: {
//           message: `${aiResponse}`,
//           role: "ai",
//           ChatRoom: {
//             connect: {
//               id: chatRoomId,
//             },
//           },
//           seen: true,
//         },
//       });

//       return {
//         id: aiMessageResult?.id,
//         message: aiResponse,
//       };
//     }
//   } catch (err) {
//     console.log("error occurs while trying to send message", err);
//   }
// };

// export const getUserById = async (id: string) => {
//   auth().protect();
//   try {
//     const user = await prisma.user.findUnique({
//       where: {
//         clerkId: id,
//       },
//     });
//     return { openAikey: user?.openAIkey };
//   } catch (err) {
//     console.log(
//       "err occurs while getting getUserById from the server action",
//       err
//     );
//   }
// };
