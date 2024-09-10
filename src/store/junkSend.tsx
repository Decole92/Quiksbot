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
// "@clerk/nextjs": "4.29.12",
// "@clerk/nextjs": "^5.3.3",
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
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from 'next/server';
// const isProtectedRoute = createRouteMatcher([
//   "/create-chatbot(.*)",
//   "/dashboard(.*)",
//   "/edit-chatbot(.*)",
//   "/review-session(.*)",
//   "/view-chatbot(.*)",
//   "/analytics",
//   "/chatlogs",
//   "(admin)/(.*)"
// ]);
// // const isPublicRoute = createRouteMatcher(["/chatbot(.*)","/sign-in(.*)", "/sign-up(.*)"]);
// const isPublicRoute = createRouteMatcher([
//   "/chatbot(.*)",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/api/(.*)"
// ]);

// // export default clerkMiddleware();
// export default clerkMiddleware((auth, req) => {
//   if (isProtectedRoute(req)) auth().protect();
//   if (!isPublicRoute(req)) {
//     auth().protect()
//   }
//   if (req.url.includes('/chatbot')) {
//     const response = NextResponse.next();
//     response.headers.set('Content-Security-Policy', "frame-ancestors 'self' *");
//     response.headers.set('X-Frame-Options', 'ALLOW-FROM *');
//     return response;
//   }
// });

// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };

/**
 * v0 by Vercel.
 * @see https://v0.dev/t/PBgbxEXdTr6
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
// "use client"

// import { useState } from "react"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"

// export default function Component() {
//   const [activeTab, setActiveTab] = useState("unread")
//   const [selectedEmail, setSelectedEmail] = useState(null)
//   const emails = [
//     {
//       id: 1,
//       sender: "John Doe",
//       subject: "New project proposal",
//       time: "2 hours ago",
//       read: false,
//       message: "Hi team, I wanted to share a new project proposal with you all. Let me know what you think.",
//     },
//     {
//       id: 2,
//       sender: "Jane Smith",
//       subject: "Upcoming team meeting",
//       time: "1 day ago",
//       read: true,
//       message:
//         "Hello everyone, just a reminder that we have a team meeting scheduled for this Friday at 2pm. Please make every effort to attend.",
//     },
//     {
//       id: 3,
//       sender: "Michael Johnson",
//       subject: "Quarterly sales report",
//       time: "3 days ago",
//       read: false,
//       message: "Attached is the quarterly sales report for your review. Let me know if you have any questions.",
//     },
//     {
//       id: 4,
//       sender: "Emily Davis",
//       subject: "Feedback on presentation",
//       time: "1 week ago",
//       read: true,
//       message:
//         "Hi there, I wanted to provide some feedback on the presentation you gave last week. Overall it was great, but I have a few suggestions for improvement.",
//     },
//     {
//       id: 5,
//       sender: "David Lee",
//       subject: "Update on website project",
//       time: "2 weeks ago",
//       read: true,
//       message:
//         "Good afternoon, I wanted to give you all an update on the website project we've been working on. We're making good progress and are on track to launch by the end of the month.",
//     },
//     {
//       id: 6,
//       sender: "Michael Johnson",
//       subject: "Quarterly sales report",
//       time: "3 days ago",
//       read: false,
//       message: "Attached is the quarterly sales report for your review. Let me know if you have any questions.",
//     },
//     {
//       id: 7,
//       sender: "Emily Davis",
//       subject: "Feedback on presentation",
//       time: "1 week ago",
//       read: true,
//       message:
//         "Hi there, I wanted to provide some feedback on the presentation you gave last week. Overall it was great, but I have a few suggestions for improvement.",
//     },
//     {
//       id: 8,
//       sender: "David Lee",
//       subject: "Update on website project",
//       time: "2 weeks ago",
//       read: true,
//       message:
//         "Good afternoon, I wanted to give you all an update on the website project we've been working on. We're making good progress and are on track to launch by the end of the month.",
//     },
//   ]
//   const filteredEmails =
//     activeTab === "unread" ? emails.filter((email) => !email.read) : emails.filter((email) => email.read)
//   return (
//     <div className="flex h-screen">
//       <div className="w-1/3 border-r bg-muted">
//         <div className="flex items-center justify-between border-b p-4">
//           <h2 className="text-lg font-medium">Inbox</h2>
//           <Tabs defaultValue="unread" value={activeTab} onValueChange={setActiveTab} className="flex">
//             <TabsList>
//               <TabsTrigger value="unread">Unread</TabsTrigger>
//               <TabsTrigger value="read">Read</TabsTrigger>
//             </TabsList>
//           </Tabs>
//         </div>
//         <ScrollArea className="h-[calc(100vh-64px)] p-4">
//           {filteredEmails.map((email) => (
//             <div
//               key={email.id}
//               className={`mb-4 cursor-pointer rounded-lg border p-4 transition-all hover:bg-accent ${
//                 selectedEmail?.id === email.id ? "bg-accent" : ""
//               }`}
//               onClick={() => setSelectedEmail(email)}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="font-medium">{email.sender}</div>
//                 <div className="text-xs text-muted-foreground">{email.time}</div>
//               </div>
//               <div className="mt-2 font-medium">{email.subject}</div>
//               <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{email.message}</div>
//             </div>
//           ))}
//         </ScrollArea>
//       </div>
//       <div className="flex-1 p-8">
//         {selectedEmail ? (
//           <div className="h-full flex flex-col">
//             <div className="flex-1 overflow-y-auto">
//               <div className="flex flex-col gap-4">
//                 <div className="flex items-start gap-4">
//                   <Avatar className="w-10 h-10">
//                     <AvatarImage src="/placeholder-user.jpg" alt={selectedEmail.sender} />
//                     <AvatarFallback>{selectedEmail.sender.charAt(0).toUpperCase()}</AvatarFallback>
//                   </Avatar>
//                   <div className="bg-muted p-4 rounded-lg max-w-[80%]">
//                     <div className="flex items-center justify-between">
//                       <div className="font-medium">{selectedEmail.sender}</div>
//                       <div className="text-xs text-muted-foreground">{selectedEmail.time}</div>
//                     </div>
//                     <div className="mt-2">{selectedEmail.message}</div>
//                   </div>
//                 </div>
//                 <div className="flex items-start gap-4 justify-end">
//                   <div className="bg-primary p-4 rounded-lg max-w-[80%] text-primary-foreground">
//                     <div>This is a sample reply message.</div>
//                   </div>
//                   <Avatar className="w-10 h-10">
//                     <AvatarImage src="/placeholder-user.jpg" alt="You" />
//                     <AvatarFallback>Y</AvatarFallback>
//                   </Avatar>
//                 </div>
//               </div>
//             </div>
//             <div className="mt-4">
//               <form className="flex items-center gap-2">
//                 <Input type="text" placeholder="Type your reply..." className="flex-1" />
//                 <Button type="submit">Send</Button>
//               </form>
//             </div>
//           </div>
//         ) : (
//           <div className="h-full flex items-center justify-center">
//             <p className="text-muted-foreground">Select an email to view the message.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

{
  /* Switch button for using own OpenAI key */
}
//   <div className='pb-2 hidden'>
//   <h3 className='font-bold text-lg'>Use Your Own OpenAI Key</h3>
//   <h5 className='pb-2'>
//     Do you want to use your own OpenAI key for this chatbot?
//   </h5>

//   <div className='flex items-center justify-between space-x-4 border p-3 rounded-md '>
//     <Label htmlFor='use-own-key'>
//       Use Own API Key to enjoy our features with any limitation or
//       restriction
//     </Label>

//     <Switch
//       id='use-own-key'
//       checked={useOwnKey}
//       onCheckedChange={setUseOwnKey}
//     />
//   </div>

//   {useOwnKey && (
//     <div className='mt-4 hidden'>
//       <Label
//         htmlFor='openai-key'
//         className='block text-sm font-medium text-gray-700'
//       >
//         Enter your OpenAI API Key:
//       </Label>
//       <Input
//         id='openai-key'
//         name='openai-key'
//         type='password'
//         placeholder='sk-xxxxxxx'
//         className='mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
//       />
//     </div>
//   )}
// </div>
