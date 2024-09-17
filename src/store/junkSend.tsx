// "use client";

// import { getBot } from "@/actions/bot";
// import { getChatMessages, getChatRoom, startNewChat } from "@/actions/chat";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// import { cn } from "@/lib/utils";
// import Image from "next/image";
// import React, { useEffect, useState, useTransition } from "react";
// import useSWR from "swr";
// import logo from "../../../../public/golden.png";
// import ChatbotHeader from "@/components/ChatbotComponent/ChatbotHeader";
// import ChatbotMessages from "@/components/ChatbotMessages";
// import SuggestItems from "@/components/ChatbotComponent/SuggestItems";
// import ChatbotInput from "@/components/ChatbotComponent/chatbotInput";
// import { useGlobalStore } from "@/store/globalStore";

// import axios from "axios";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { postToParent } from "@/lib/parseToParent";
// import { clientPusher } from "@/lib/pusher";
// import { XCircleIcon } from "lucide-react";
// import type { ChatBot, ChatMessage, ChatRoom } from "@prisma/client";

// type Props = {};

// const ChatBot = (props: Props) => {
//   const [botOpened, setBotOpened] = useState(false);
//   const [botId, setBotId] = useState<string>("");
//   const [userDetails, setUserDetails] = useState({
//     name: "",
//     email: "",
//   });
//   const [chatId, setChatId] = useState<string>("");
//   const [isLoading, startTransition] = useTransition();
//   const [isPending, startChatting] = useTransition();
//   const [isOpen, setIsOpen] = useGlobalStore((state) => [
//     state.isOpen,
//     state.setIsOpen,
//   ]);

//   const { data: bot, mutate: setBot } = useSWR(
//     botId ? `/getbot/${botId}` : null,
//     async () => await getBot(botId)
//   );

//   const { data: chatMessages, mutate } = useSWR(
//     chatId ? `/getMessages` : null,
//     async () => (chatId ? await getChatMessages(chatId) : null)
//   );

//   const { data: chatRoom, mutate: setChatRoom } = useSWR(
//     chatId ? `/getChatRoom/${chatId}` : null,
//     async () => (chatId ? await getChatRoom(chatId) : null)
//   );

//   const onOpenChatBot = () => {
//     setBotOpened(!botOpened);
//   };

//   const handleInformationSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await axios.get("/api/getlocation");
//       console.log("Country:", response.data.country);
//     } catch (err) {
//       console.log("Error while getting location:", err);
//     }
//     startTransition(async () => {
//       const chatRoomId = await startNewChat({ userDetails, id: botId });
//       setChatId(chatRoomId!);
//       setIsOpen(false);
//     });
//   };
//   const loading = false;
//   useEffect(() => {
//     if (chatId) {
//       mutate(getChatMessages(chatId));
//       setChatRoom(getChatRoom(chatId));
//     }
//   }, [chatId, mutate, setChatRoom]);

//   useEffect(() => {
//     if (!chatRoom?.live) return;
//     const channel = clientPusher.subscribe("message");
//     channel.bind("realtime", async (data: ChatMessage) => {
//       if (chatMessages?.some((message: any) => message.id === data.id)) return;

//       if (!chatMessages) {
//         await mutate(getChatMessages(chatId));
//       } else {
//         mutate(getChatMessages(chatId), {
//           optimisticData: [...(chatMessages as any[]), data],
//           rollbackOnError: true,
//           populateCache: false,
//           revalidate: false,
//         });
//       }
//     });

//     return () => {
//       channel.unbind("realtime");
//       clientPusher.unsubscribe("message");
//     };
//   }, [chatMessages, mutate, chatId, chatRoom?.live]);

//   useEffect(() => {
//     postToParent(
//       JSON.stringify({
//         width: botOpened ? 400 : 100,
//         height: botOpened ? 700 : 100,
//       })
//     );
//   }, [botOpened]);

//   useEffect(() => {
//     const handleMessage = (e: MessageEvent) => {
//       if (typeof e.data === "string") {
//         setBotId(e.data);
//       }
//       console.log("handleMessge", e.data as any);
//     };

//     window.addEventListener("message", handleMessage);

//     return () => {
//       window.removeEventListener("message", handleMessage);
//     };
//   }, []);

//   useEffect(() => {
//     if (botId) {
//       setBot(getBot(botId));
//     }
//     if (bot) {
//       setIsOpen(bot?.getDetails!);
//       console.log("isOpen", isOpen);
//     }
//   }, [botId]);

//   useEffect(() => {
//     const startChatAutomatically = async () => {
//       if (bot && !bot?.getDetails) {
//         startChatting(async () => {
//           const chatRoomId = await startNewChat({ userDetails, id: botId });
//           setChatId(chatRoomId!);
//         });
//       }
//     };

//     startChatAutomatically(); // Start chat on component mount
//   }, [botId, bot]);

//   console.log("this is userDetails", userDetails);
//   return (
//     <div className='h-screen flex flex-col justify-end items-end gap-4 bg-white'>
//       {botOpened && isOpen && (
//         <Dialog open={isOpen} onOpenChange={setIsOpen}>
//           <DialogContent className='sm:w-[200px] sm:mx-auto   '>
//             <form onSubmit={handleInformationSubmit}>
//               <DialogHeader>
//                 <DialogTitle>Lets help you out!</DialogTitle>
//                 <DialogDescription>
//                   I just need a few details to get started.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className='grid gap-4 py-4'>
//                 <div className='grid grid-cols-4 items-center gap-4'>
//                   <Label htmlFor='name' className='text-right'>
//                     Name
//                   </Label>
//                   <Input
//                     required
//                     placeholder='John Doe'
//                     className='col-span-3'
//                     value={userDetails.name}
//                     onChange={(e) =>
//                       setUserDetails((values) => ({
//                         ...values,
//                         name: e.target.value,
//                       }))
//                     }
//                   />
//                 </div>
//                 <div className='grid grid-cols-4 items-center gap-4'>
//                   <Label htmlFor='email' className='text-right'>
//                     Email
//                   </Label>
//                   <Input
//                     required
//                     type='email'
//                     placeholder='abc@test.com'
//                     className='col-span-3'
//                     value={userDetails.email}
//                     onChange={(e) =>
//                       setUserDetails((values) => ({
//                         ...values,
//                         email: e.target.value,
//                       }))
//                     }
//                   />
//                 </div>
//               </div>
//               <DialogFooter>
//                 <Button disabled={isLoading} type='submit'>
//                   {!isLoading ? "Continue" : "Loading..."}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       )}

//       {botOpened && (
//         <div className='h-screen w-[400px] flex flex-col bg-white rounded-xl border-[1px] overflow-hidden shadow-md'>
//           <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />
//           <div className='flex-1 overflow-y-auto'>
//             <ChatbotMessages
//               chatbot={bot as ChatBot}
//               messages={chatMessages as ChatMessage[]}
//             />
//           </div>
//           <div className='sticky bottom-0 z-30 bg-white'>
//             <SuggestItems
//               firstQuestion={bot?.firstQuestion as any}
//               userDetails={userDetails}
//               chatbot={bot!}
//               chatId={chatId!}
//             />
//             <ChatbotInput
//               userDetails={userDetails}
//               chatRoomId={chatId!}
//               chatbot={bot as ChatBot}
//               type='user'
//               isPageLoading={isPending}
//             />
//           </div>
//         </div>
//       )}

//       {botOpened ? (
//         <div>
//           <XCircleIcon
//             onClick={() => setBotOpened(!botOpened)}
//             className='fill-white text-[#E1B177] h-9 w-9 cursor-pointer'
//           />
//         </div>
//       ) : (
//         <div
//           className={cn(
//             " relative rounded-full  cursor-pointer  w-24 h-24 flex items-center justify-center bg-white",
//             loading ? "invisible" : "visible"
//           )}
//           onClick={onOpenChatBot}
//         >
//           {bot?.icon ? (
//             <Image src={bot.icon} alt='bot' fill className='rounded-full' />
//           ) : (
//             <Image
//               src={logo}
//               alt='bot'
//               className='rounded-full h-16 w-16'
//               width={100}
//               height={100}
//             />
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatBot;
// import { NextResponse } from "next/server";

// export async function GET() {
//   const jsContent = `
//     (function() {

//             const existingIframe = document.querySelector('.chat-frame');
//             if (existingIframe) {
//                 console.log("iframe already existing")
//                  return;
//           }

//           if (window.location.pathname.startsWith('/chatbot') || window.location.pathname.endsWith('/')
//         ) {
//             return;
//         }

//       const script = document.currentScript;
//       const name = script?.getAttribute("data-name");
//       const address = script?.getAttribute("data-address");
//       const id = script?.getAttribute("data-id");
//       const widgetSize = script?.getAttribute("data-widget-size");
//       const widgetButtonSize = script?.getAttribute("data-widget-button-size");

//       const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
//     //  const chatbotUrl = isProduction ? \`\${address}/chatbot\` : 'http://localhost:3000/chatbot';
//      const chatbotUrl = isProduction ? address : 'http://localhost:3000';

//       const iframeStyles = (styleString) => {
//         const style = document.createElement('style');
//         style.textContent = styleString;
//         document.head.append(style);
//       };

//       iframeStyles(\`
//         .chat-frame {
//           position: fixed;
//           bottom: 10px;
//           right: 10px;
//           border: none;
//           width: 50px;
//           height: 50px;
//           transition: width 0.3s ease, height 0.3s ease;
//         }
//       \`);

//       const iframe = document.createElement("iframe");
//       iframe.src = chatbotUrl;
//       iframe.classList.add("chat-frame");
//       document.body.appendChild(iframe);

//       window.addEventListener("message", (e) => {

//         if (e.origin !== new URL(chatbotUrl).origin) return;

//         try {

//             let data;
//             console.log("this is id from api", id)
//             if (typeof e.data === 'string') {
//               try {
//                 // Try to parse if it's a JSON string
//                 data = JSON.parse(e.data);
//               } catch (parseError) {
//                 // If it's not JSON, we treat it as a simple string message (likely the UUID)
//                 data = e.data;  // This could be your botId or other simple message
//               }
//             } else {
//               // If it's an object (could be already parsed), use it as is
//               data = e.data;
//             }

//             if (data && data.width && data.height) {
//                 iframe.style.width = \`\${data.width}px\`;
//                 iframe.style.height = \`\${data.height}px\`;
//               }

//               // Send the ID back to the iframe (no need to stringify simple strings)
//               iframe.contentWindow.postMessage(id, chatbotUrl);

//         } catch (error) {
//           console.error("Error parsing message data:", error);
//         }
//       });
//     })();

//   `;

//   return new NextResponse(jsContent, {
//     headers: {
//       "Content-Type": "application/javascript",
//     },
//   });
// }

// NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y3J1Y2lhbC1tdWxsZXQtNzQuY2xlcmsuYWNjb3VudHMuZGV2JA
// CLERK_SECRET_KEY=sk_test_Tzsu67GQ6hIJFVxYhnpSooGwWwW5oCgkcyifGpv0P3
// NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
// NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
// NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_URL=/
// NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_URL=/
// NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
// NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
// OPENAI_KEY=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
// EDGE_STORE_ACCESS_KEY=dGFGVt9YYMfylTw0HV4FY09wFP85bNbc
// EDGE_STORE_SECRET_KEY=AqPXTVLcejf9xQhoYIocyS5FW1g6Bcf9K4ndQ9jKsOuWeLsK
// PINECONE_API_KEY=3f9b02d1-61d4-4144-8dcd-d28bd9ba8ae3
// NODE_MAILER_EMAIL=okpoka92@gmail.com
// NODE_MAILER_GMAIL_APP_PASSWORD=nymu chxf frrh wfzs
// PUSHER_APPID=1820532
// PUSHER_KEY=88c6b069946bb754a6b3
// PUSHER_SECRET=de30a5e9dc83bb13786b
// IP_KEY=57008ce40452182a39f7af7e203094dabab8f177e028140c470e9cf1
// NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyBmcVRSEA7YXe6ksPllKP9UgkLfSJNJfPo
// PRO_PRICING_ID=price_1PxEGZGxwPgIIb5AAUXbWlIi
// ULTIMATE_PRICING_ID=price_1PxEJyGxwPgIIb5AWEQEmQaP
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51LuuK0GxwPgIIb5A7u8fu00WUnwtFvwQ7IuoXtUJ3NosbUpgrasyMLbixeTaKcsCoafbZFwxpb3fr4IfH0nW9bj000lFv5COCm
// STRIPE_API_KEY=sk_test_51LuuK0GxwPgIIb5AF7KFMMMGbZmRzQFpVbEgN5NlYdkisMcRuzBl4fg2LXYwVhESCqg2F0eav5BpjxXfnClHO6WR00awFNXwmo

// # STRIPE_API_KEY=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

// STRIPE_WEBHOOK_KEY=whsec_0q2cMv0MzD8jieqwRKpc73tg3NuGRfnZ
