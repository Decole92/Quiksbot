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

// "use client";
// import { useState } from "react";

// export default function CreditBar() {
//   const [score, setScore] = useState(10);

//   const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setScore(Number(e.target.value));
//   };

//   const getScoreColor = (score: number) => {
//     if (score <= 4) return "bg-emerald-500"; // Highest score, use green
//     if (score <= 8) return "bg-green-500"; // Slightly lower, use lighter green
//     if (score <= 12) return "bg-yellow-500"; // Mid range, use yellow
//     if (score <= 16) return "bg-orange-500"; // Lower range, use orange
//     return "bg-red-500"; // Lowest range, use red
//   };

//   const getScoreLabel = (score: number) => {
//     if (score <= 4) return "Excellent";
//     if (score <= 8) return "Very Good";
//     if (score <= 12) return "Good";
//     if (score <= 16) return "Fair";
//     return "Poor";
//   };

//   return (
//     <div className='w-full md:max-w-[200px] lg:max-w-[200px] md:mx-auto p-2 space-y-4'>
//       <div className='relative h-3 rounded-full overflow-hidden'>
//         <div className='absolute inset-0 flex'>
//           <div className='flex-1 bg-emerald-500'></div> {/* Highest */}
//           <div className='flex-1 bg-green-500'></div>
//           <div className='flex-1 bg-yellow-500'></div>
//           <div className='flex-1 bg-orange-500'></div>
//           <div className='flex-1 bg-red-500'></div> {/* Lowest */}
//         </div>
//         <div
//           className='absolute top-0 bottom-0 w-1 bg-white'
//           style={{ left: `calc(${(score / 22) * 100}% - 2px)` }}
//         ></div>
//       </div>
//     </div>
//   );
// }

{
  /* <Link
className='dark:bg-gray-900'
key={chatbot?.id}
href={`/edit-chatbot/${chatbot?.id}`}
>
<li className='relative md:p-10 p-5  border rounded-md max-w-2xl bg-white'>
  <div>
    <div className='flex items-center space-x-4'>
      {chatbot?.botIcon ? (
        <Image
          src={chatbot?.botIcon}
          alt={chatbot?.botIcon}
          width={100}
          height={100}
          className='h-24 w-24 rounded-full'
        />
      ) : (
        <Avatar seed={chatbot.name as string} />
      )}
      <h2 className='text-xl font-bold'>{chatbot?.name}</h2>
    </div>

    <p className='absolute top-5 right-5 text-xs text-gray-400'>
      Created: {new Date(chatbot.createdAt).toLocaleString()}
    </p>

    <hr className='mt-2' />
    <h5 className='pb-0 px-4 pt-4 text-[#E1B177] italic'>
      trained
    </h5>

    <div className='p-4 space-y-4'>
      <div className='flex items-center text-sm justify-between w-full  '>
        <h5>Text chars</h5>
        <h5 className=''>
          {
            chatbot?.Source?.characteristic
              ?.map(
                (character: characteristic) =>
                  character?.characteristic
              )
              .join("").length
          }{" "}
          chars
        </h5>
      </div>

      <div className='flex items-start text-sm justify-between  '>
        <h5>Pdf File</h5>
        <div>
          {chatbot?.Source?.pdfFile?.length > 0 ? (
            <>
              {chatbot?.Source?.pdfFile?.map((pdf: PdfFile) => (
                <h5 key={pdf?.id} className='py-1'>
                  {pdf?.fileName}
                </h5>
              ))}
            </>
          ) : (
            <h5>0</h5>
          )}
        </div>
      </div>
      {/* 
      <div className='flex items-center text-sm justify-between  '>
        <h5>Website Url</h5>
        <h5 className='truncate md:w-[240px]'>
          https://portfolio.decolemills.com/#about
        </h5>
      </div> */
}
//       <div className='flex items-center text-sm justify-between  '>
//         <h5>No of Session</h5>
//         <h5>{chatbot?.customer?.length!}</h5>
//       </div>
//     </div>
//   </div>
// </li>
// </Link> */}
