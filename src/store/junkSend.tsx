// => good code

// const jsContent = `
// (function() {
//   let chatFrame = null;

//   const isPathBlocked = (path) => {
//     const blockedPages = ${JSON.stringify(blockedPagesArray)};
//     return blockedPages.some(page => path.startsWith(page)) || path.startsWith('/chatbot');
//   };

//   const createChatbotIframe = () => {
//     if (chatFrame) return;

//     const script = document.querySelector('script[data-address][data-id]');
//     const address = script?.getAttribute("data-address");
//     const position = script?.getAttribute("data-position") || "right";
//     const id = script?.getAttribute("data-id");

//     if (!address || !id) {
//       console.error('Missing data attributes in the script tag.');
//       return;
//     }

//     const isProduction = !['localhost', '127.0.0.1'].includes(window.location.hostname);
//     const chatbotUrl = isProduction ? \`\${address}/chatbot\` : 'http://localhost:3000/chatbot';

//     const style = document.createElement('style');
//     style.textContent = \`
//       .chat-frame {
//         position: fixed;
//         bottom: 10px;
//         \${position}: \${position === "center" ? "50%" : "10px"};
//         \${position === "center" ? "transform: translateX(50%);" : ""}
//         border: none;
//         width: 80px;
//         height: 80px;
//         z-index: 999;
//         transition: width 0.3s ease, height 0.3s ease;
//       }
//     \`;
//     document.head.appendChild(style);

//     chatFrame = document.createElement("iframe");
//     chatFrame.src = chatbotUrl;
//     chatFrame.classList.add("chat-frame");
//     document.body.appendChild(chatFrame);

//     const handleMessage = (e) => {
//       if (e.origin !== new URL(chatbotUrl).origin) return;

//       try {
//         const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

//         if (data && data.width && data.height) {
//           chatFrame.style.width = \`\${data.width}px\`;
//           chatFrame.style.height = \`\${data.height}px\`;
//         }

//         if (chatFrame && chatFrame.contentWindow) {
//           chatFrame.contentWindow.postMessage(id, chatbotUrl);
//         }
//       } catch (error) {
//         console.error("Error processing message data:", error);
//       }
//     };

//     window.addEventListener("message", handleMessage);
//   };

//   const removeChatbotIframe = () => {
//     if (chatFrame) {
//       chatFrame.remove();
//       chatFrame = null;
//     }
//   };

//   const updateChatbotVisibility = () => {
//     const currentPath = window.location.pathname;
//     if (isPathBlocked(currentPath)) {
//       removeChatbotIframe();
//     } else {
//       createChatbotIframe();
//     }
//   };

//   // Initial check
//   updateChatbotVisibility();

//   // Listen for navigation changes
//   const observer = new MutationObserver(() => {
//     updateChatbotVisibility();
//   });
//   observer.observe(document.body, { childList: true, subtree: true });

//   // Listen for popstate events (back/forward navigation)
//   window.addEventListener('popstate', updateChatbotVisibility);
// })();
// `;

// => bad codes

// const jsContent = `
//   (function() {
//     let chatFrame = null;

//     const isPathBlocked = (path) => {
//       const blockedPages = ${JSON.stringify(blockedPagesArray)};
//       return blockedPages.some(page => path.startsWith(page)) || path.startsWith('/chatbot');
//     };

//     const createChatbotIframe = () => {
//       if (chatFrame) return;

//       const script = document.querySelector('script[data-address][data-id]');
//       const address = script?.getAttribute("data-address");
//       const position = script?.getAttribute("data-position") || "right";
//       const id = script?.getAttribute("data-id");

//       if (!address || !id) {
//         console.error('Missing data attributes in the script tag.');
//         return;
//       }

//       const isProduction = !['localhost', '127.0.0.1'].includes(window.location.hostname);
//       const chatbotUrl = isProduction ? \`\${address}/chatbot\` : 'http://localhost:3000/chatbot';

//       const style = document.createElement('style');
//       style.textContent = \`
//         .chat-frame {
//           position: fixed;
//           bottom: 10px;
//           \${position}: \${position === "center" ? "50%" : "10px"};
//           \${position === "center" ? "transform: translateX(50%);" : ""}
//           border: none;
//           width: 80px;
//           height: 80px;
//           z-index: 999;
//           transition: width 0.3s ease, height 0.3s ease;
//         }
//       \`;
//       document.head.appendChild(style);

//       chatFrame = document.createElement("iframe");
//       chatFrame.src = chatbotUrl;
//       chatFrame.classList.add("chat-frame");
//       document.body.appendChild(chatFrame);

//       window.addEventListener("message", (e) => {
//         if (e.origin !== new URL(chatbotUrl).origin) return;

//         try {
//           const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

//           if (data && data.width && data.height) {
//             chatFrame.style.width = \`\${data.width}px\`;
//             chatFrame.style.height = \`\${data.height}px\`;
//           }

//           chatFrame.contentWindow.postMessage(id, chatbotUrl);
//         } catch (error) {
//           console.error("Error processing message data:", error);
//         }
//       });
//     };

//     const removeChatbotIframe = () => {
//       if (chatFrame) {
//         chatFrame.remove();
//         chatFrame = null;
//       }
//     };

//     const updateChatbotVisibility = () => {
//       const currentPath = window.location.pathname;
//       if (isPathBlocked(currentPath)) {
//         removeChatbotIframe();
//       } else {
//         createChatbotIframe();
//       }
//     };

//     // Initial check
//     updateChatbotVisibility();

//     // Listen for navigation changes
//     const observer = new MutationObserver(() => {
//       updateChatbotVisibility();
//     });
//     observer.observe(document.body, { childList: true, subtree: true });

//     // Listen for popstate events (back/forward navigation)
//     window.addEventListener('popstate', updateChatbotVisibility);
//   })();

// `;

// import { NextResponse } from "next/server";
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import type { NextRequest } from "next/server";

// // Define route matchers for protected and public routes
// const isProtectedRoute = createRouteMatcher([
//   "(admin)/(.*)",
//   "/create-chatbot(.*)",
//   "/dashboard(.*)",
//   "/edit-chatbot(.*)",
//   "/review-session(.*)",
//   "/analytic(.*)",
//   "/chatlogs(.*)",
//   "/pricing(.*)",
//   "/settings(.*)",
// ]);

// const isPublicRoute = createRouteMatcher([
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/api/(.*)",
//   "/chatbot/(.*)",
//   "/",
//   "/api/webhook",
// ]);

// // Custom middleware function
// async function middleware(request: NextRequest, event: any) {
//   const { pathname } = request.nextUrl;

//   if (pathname.startsWith("/chatbot")) {
//     const response = NextResponse.next();
//     response.headers.set("Content-Security-Policy", "frame-ancestors 'self' *");
//     response.headers.set("X-Frame-Options", "SAMEORIGIN");
//     return response;
//   }

//   return clerkMiddleware((auth) => {
//     if (isProtectedRoute(request)) {
//       auth().protect();
//     } else if (!isPublicRoute(request)) {
//       auth().protect();
//     }
//   })(request, event); // Pass both `request` and `event` here
// }

// export default middleware;

// export const config = {
//   matcher: [
//     "/((?!.*\\..*|_next).*)", // Match all pages except files and _next paths
//     "/", // Match the root path
//     "/(api|trpc)(.*)", // Match API and TRPC routes
//   ],
// };

// <div className='flex flex-col py-2 overflow-y-auto px-2 md:px-4 lg:px-5 space-y-4 md:space-y-5'>
//   {messages?.map((message: ChatMessage) => {
//     const isSender = message?.role !== "user";

//     return (
//       <div
//         key={message?.id!}
//         className={`chat ${
//           isSender ? "chat-start" : "chat-end"
//         } relative py-3 md:py-4 dark:text-gray-200`}
//       >
//         <p className='absolute -bottom-2 text-[10px] md:text-xs text-gray-300'>
//           Sent {new Date(message?.createdAt).toLocaleString()}
//         </p>

//         <div
//           className={`chat-image avatar w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 ${
//             !isSender && "-mr-2 md:-mr-3 lg:-mr-4"
//           }`}
//         >
//           {isSender ? (
//             chatbot?.botIcon ? (
//               <Image
//                 src={chatbot?.botIcon}
//                 alt={chatbot?.botIcon}
//                 width={48}
//                 height={48}
//                 className='rounded-full p-1 md:p-1.5 lg:p-2 w-full h-full object-cover'
//               />
//             ) : (
//               <Image
//                 src={botIcon}
//                 alt='chatbotIcon'
//                 width={48}
//                 height={48}
//                 className='bg-gray-100 dark:bg-gray-950 rounded-full p-1 md:p-1.5 lg:p-2 w-full h-full object-cover'
//               />
//             )
//           ) : (
//             <UserCircle
//               className={`text-[${chatbot?.userMessageBgColor}] w-full h-full`}
//             />
//           )}
//         </div>

//         <div
//           className={`chat-bubble max-w-[75%] md:max-w-[70%] lg:max-w-[100%] ${
//             chatbot && isSender
//               ? `chat-bubble-primary bg-gray-200 text-gray-700 dark:bg-gray-950 dark:text-gray-400`
//               : `chat-bubble-secondary text-white`
//           }`}
//           style={{
//             backgroundColor: `${
//               chatbot && !isSender ? chatbot?.userMessageBgColor : undefined
//             }`,
//           }}
//         >
//           <ReactMarkDown
//             remarkPlugins={[remarkGfm]}
//             className='break-words '
//             components={{
//               ul: ({ node, ...props }) => (
//                 <ul
//                   {...props}
//                   className='list-disc list-inside ml-3 md:ml-4 lg:ml-5 mb-3 md:mb-4 lg:mb-5'
//                 />
//               ),
//               ol: ({ node, ...props }) => (
//                 <ol
//                   {...props}
//                   className='list-decimal list-inside ml-3 md:ml-4 lg:ml-5 mb-3 md:mb-4 lg:mb-5'
//                 />
//               ),
//               h1: ({ node, ...props }) => (
//                 <h1
//                   {...props}
//                   className='text-xl md:text-2xl font-bold mb-3 md:mb-4 lg:mb-5'
//                 />
//               ),
//               h2: ({ node, ...props }) => (
//                 <h2
//                   {...props}
//                   className='text-lg md:text-xl font-bold mb-3 md:mb-4 lg:mb-5'
//                 />
//               ),
//               h3: ({ node, ...props }) => (
//                 <h3
//                   {...props}
//                   className='text-base md:text-lg font-bold mb-3 md:mb-4 lg:mb-5'
//                 />
//               ),
//               table: ({ node, ...props }) => (
//                 <table
//                   {...props}
//                   className='table-auto w-full border-separate border-2 rounded-sm border-spacing-2 md:border-spacing-3 lg:border-spacing-4 border-white mb-3 md:mb-4 lg:mb-5'
//                 />
//               ),
//               th: ({ node, ...props }) => (
//                 <th {...props} className='text-left underline' />
//               ),
//               p: ({ node, ...props }) => (
//                 <p
//                   {...props}
//                   className={`whitespace-break-spaces mb-3 md:mb-4 lg:mb-5 ${
//                     message.message === "Thinking..." && "animate-pulse"
//                   } ${isSender ? "text-gray-700" : "text-white"}`}
//                 />
//               ),
//               a: ({ node, ...props }) => (
//                 <a
//                   {...props}
//                   target='_blank'
//                   className='font-bold underline hover:text-blue-400'
//                   rel='noopener noreferrer'
//                 />
//               ),
//             }}
//           >
//             {message?.message}
//           </ReactMarkDown>
//         </div>
//       </div>
//     );
//   })}
//   <div ref={refDiv} />
// </div>

///# input component

// import React, { useEffect, useState, useTransition } from "react";
// import { Input } from "../ui/input";
// import { Button } from "../ui/button";
// import { Send } from "lucide-react";
// import { useGlobalStore } from "@/store/globalStore";
// import useSWR from "swr";
// import { getChatMessages, getChatRoom } from "@/actions/chat";
// import { getBot } from "@/actions/bot";
// import axios from "axios";
// import { useUser } from "@clerk/nextjs";
// import type { ChatBot, ChatMessage, botType } from "@prisma/client";
// import useSubcription from "@/hook/useSubscription";
// import { sendMessage } from "@/actions/chat/sendMessage";

// function ChatbotInput({
//   userDetails,
//   chatRoomId,
//   chatbot,
//   type,
//   isPageLoading,
// }: {
//   userDetails: { name: string; email: string };
//   chatRoomId: string;
//   chatbot: ChatBot;
//   type: string;
//   isPageLoading?: boolean;
// }) {
//   const [isPending, startTransition] = useTransition();
//   const [message, setMessage] = useState("");
//   const [isOpen, setIsOpen, formStatus] = useGlobalStore((state) => [
//     state.isOpen,
//     state.setIsOpen,
//     state.formStatus,
//   ]);

//   const { data: chatMessages, mutate } = useSWR(
//     "/getMessages",
//     async () => await getChatMessages(chatRoomId)
//   );

//   const {
//     data: chatRoom,
//     mutate: setChatRoom,
//     isLoading,
//   } = useSWR(chatRoomId ? `/getChatRoom/${chatRoomId}` : null, async () =>
//     chatRoomId !== null ? await getChatRoom(chatRoomId) : null
//   );

//   const { name, email } = userDetails;

//   const handleAskQuestion = async (e: React.FormEvent) => {
//     e.preventDefault();
//     // console.log("formStatus", formStatus);
//     if (!formStatus && chatbot?.getDetails) {
//       setIsOpen(true);
//       // console.log("isOpen from first if", isOpen);
//       return;
//     }
//     const passedMessage = message;
//     setMessage("");

//     const userMessage: ChatMessage = {
//       id: Date.now().toString(),
//       message: passedMessage,
//       // @ts-ignore
//       createdAt: new Date().toISOString(),
//       chatRoomId: chatRoomId,
//       role: type === "assistant" ? "ai" : "user",
//       seen: true,
//     };

//     const loadingMessage: ChatMessage = {
//       id: (Date.now() + 1).toString(),
//       message: "Thinking...",
//       // @ts-ignore
//       createdAt: new Date().toISOString(),
//       chatRoomId: chatRoomId,
//       role: "ai",
//       seen: true,
//     };

//     if (!chatRoom?.live) {
//       mutate(getChatMessages(chatRoomId), {
//         optimisticData: [
//           ...(chatMessages ? chatMessages : []),
//           userMessage,
//           loadingMessage,
//         ],
//         rollbackOnError: true,
//         populateCache: false,
//         revalidate: false,
//       });
//     } else {
//       mutate(getChatMessages(chatRoomId), {
//         optimisticData: [...(chatMessages ? chatMessages : []), userMessage],
//         rollbackOnError: true,
//         populateCache: false,
//         revalidate: false,
//       });
//     }

//     // mutate(getChatMessages(chatRoomId), {
//     //   optimisticData: [...(chatMessages || []), userMessage],
//     //   rollbackOnError: true,
//     //   populateCache: false,
//     //   revalidate: false,
//     // });

//     startTransition(async () => {
//       try {
//         const result = await sendMessage(
//           passedMessage,
//           chatRoomId,
//           chatbot,
//           type === "assistant" ? "ai" : name
//         );
//         console.log("Message sent:", result);

//         mutate(getChatMessages(chatRoomId), {
//           optimisticData: (messages: any) =>
//             messages!.map((msg: ChatMessage) =>
//               msg?.id === loadingMessage?.id
//                 ? { ...msg, message: result?.message!, id: result?.id! }
//                 : msg
//             ),
//           populateCache: false,
//           revalidate: false,
//         });

//         // setBot(getBot(chatbot?.id));
//         setChatRoom(getChatRoom(chatRoomId));
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//     });
//   };

//   const isCheck = chatbot?.getDetails ? isPageLoading : false;

//   return (
//     <div className=''>
//       <hr />
//       <form
//         className='p-5 flex items-center gap-2'
//         onSubmit={handleAskQuestion}
//       >
//         <input
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           minLength={3}
//           className='py-3 px-5 bg-white dark:bg-gray-950 w-full rounded-full border border-gray-300 dark:border-gray-700 dark:text-gray-400 focus:outline-none'
//           placeholder='Ask your question ?'
//         />
//         <Button
//           disabled={isPending || !message || isCheck}
//           type='submit'
//           className={`p-2 dark:bg-gray-950  bg-gray-200 shadow-lg shadow-gray-300 dark:shadow-gray-700 rounded-md group dark:text-gray-400 dark:hover:bg-[${chatbot?.userMessageBgColor}] hover:bg-[${chatbot?.userMessageBgColor}]`}
//         >
//           <Send className='text-black group-hover:text-white dark:text-gray-400 ' />
//         </Button>
//       </form>
//     </div>
//   );
// }

// export default ChatbotInput;

///interface

// "use client";
// import React, { useEffect, useState, useTransition } from "react";
// import { Separator } from "./ui/separator";
// import { useGlobalStore } from "@/store/globalStore";
// import ChatbotMessages from "./ChatbotMessages";
// import ChatbotHeader from "./ChatbotComponent/ChatbotHeader";
// import ChatbotInput from "./ChatbotComponent/chatbotInput";
// import {
//   getAllActiveChats,
//   getUserCustomers,
//   updateChatRoomMode,
//   viewMessage,
// } from "@/actions/customer";
// import { getBot } from "@/actions/bot";
// import useSWR from "swr";
// import logo from "../../public/golden.png";
// import Image from "next/image";
// import { clientPusher } from "@/lib/pusher";
// import {
//   deleteChatRoomById,
//   getChatMessages,
//   getChatRoom,
// } from "@/actions/chat";
// import { ScrollArea } from "./ui/scroll-area";
// import type { ChatBot, ChatMessage } from "@prisma/client";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "./ui/button";
// import { toast } from "sonner";
// import { useUser } from "@clerk/nextjs";
// import { usePathname, useRouter } from "next/navigation";

// function ChatInterface() {
//   const [openModel, setOpenModel] = useState(false);
//   const [isDeleting, startDeleting] = useTransition();
//   const { user } = useUser();
//   const pathname = usePathname();
//   const router = useRouter();
//   const [selectedChatRoomId, setSelectedChatRoomId] = useGlobalStore(
//     (state) => [state.selectedChatRoomId, state.setSelectedChatRoomId]
//   );
//   const { data: chatMessages, mutate } = useSWR("/getMessages", async () =>
//     selectedChatRoomId !== null
//       ? await getChatMessages(selectedChatRoomId)
//       : null
//   );

//   const {
//     data: chatRoom,
//     error: chatRoomError,
//     mutate: setChatRoom,
//     isLoading: loadingRoom,
//   } = useSWR(
//     selectedChatRoomId ? `/getChatRoom/${selectedChatRoomId}` : null,
//     () => getChatRoom(selectedChatRoomId!)
//   );

//   const {
//     data: bot,
//     error: botError,
//     mutate: setChatBot,
//     isLoading: loadingBot,
//   } = useSWR(
//     chatRoom?.Customer?.chatbotId
//       ? `/api/bot/${chatRoom?.Customer?.chatbotId}`
//       : null,
//     () => getBot(chatRoom?.Customer?.chatbotId!)
//   );

//   const { mutate: getEvery } = useSWR(
//     `/api/getActiveChats/${user?.id}`,
//     user ? async () => await getAllActiveChats(user?.id) : null
//   );

//   const { mutate: getAll } = useSWR(
//     `/api/getCustomers/${user?.id}`,
//     user ? async () => await getUserCustomers(user?.id) : null
//   );

//   const userDetails = {
//     name: chatRoom?.Customer?.name!,
//     email: chatRoom?.Customer?.email,
//   };

//   const handleDeleteChat = async () => {
//     startDeleting(async () => {
//       const del = deleteChatRoomById(selectedChatRoomId!);
//       setOpenModel(false);
//       toast.promise(del, {
//         success: "Chatroom deleted.",
//         loading: "Deleting chatroom...",
//         error: "an err has occur while trying to delete chatroom.",
//       });

//       const fetch = await del;
//       if (fetch?.completed) {
//         await getEvery(getAllActiveChats(user?.id!));
//         await getAll(getUserCustomers(user?.id!));
//       }
//     });

//     setSelectedChatRoomId("");
//   };

//   const hasMessages = chatRoom?.message && chatRoom.message.length > 0;

//   const lastAIMessage = chatRoom?.message
//     ?.filter((msg: any) => msg.role === "ai")
//     ?.sort(
//       (a: any, b: any) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     )[0];
//   let isTimeExceeded;

//   if (lastAIMessage) {
//     const lastMessageTime = new Date(lastAIMessage.createdAt).getTime();
//     const currentTime = new Date().getTime();

//     const timeDifferenceInMinutes =
//       (currentTime - lastMessageTime) / (1000 * 60);

//     isTimeExceeded = timeDifferenceInMinutes > 30;
//   }

//   useEffect(() => {
//     setChatBot();
//     mutate(getChatMessages(selectedChatRoomId!));
//     setChatRoom(getChatRoom(selectedChatRoomId!));
//   }, [selectedChatRoomId, bot]);

//   useEffect(() => {
//     if (isTimeExceeded!) {
//       const updateChatRoom = async () => {
//         if (chatRoom && chatRoom.id) {
//           await updateChatRoomMode(chatRoom.id);
//         }
//       };
//       updateChatRoom();
//     }
//   }, [chatMessages, chatRoom]);

//   useEffect(() => {
//     if (!chatRoom?.live) return;
//     const channel = clientPusher.subscribe("message");

//     channel.bind("realtime", async (data: ChatMessage) => {
//       console.log(
//         "chatmessages id",
//         chatMessages?.map((chat) => chat?.id)
//       );
//       console.log("realtime data", data.id);
//       if (chatMessages?.find((message: any) => message.id === data.id)) {
//         console.log("Message already exists, skipping");
//         return;
//       }

//       if (!chatRoom?.message) {
//         await mutate(getChatMessages(selectedChatRoomId!));
//       } else {
//         mutate(getChatMessages(selectedChatRoomId!), {
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
//   }, [chatMessages, mutate, selectedChatRoomId, clientPusher, chatRoom?.live]);

//   if (loadingBot || loadingRoom) {
//     return (
//       <div className='flex justify-center w-full h-full items-center'>
//         <div>
//           <Image
//             src={logo}
//             alt='logo'
//             height={100}
//             width={100}
//             className='animate-spin rounded-full'
//           />
//         </div>
//       </div>
//     );
//   }
//   if (bot && chatRoom) {
//     return (
//       <div className=''>
//         <Dialog open={openModel} onOpenChange={(open) => setOpenModel(open)}>
//           <DialogContent className='sm:max-w-md bg-white  dark:bg-gray-900'>
//             <DialogHeader className='text-[#E1B177]'>
//               <DialogTitle>Are you absolutely sure?</DialogTitle>
//               <DialogDescription>
//                 This action cannot be undone. Are you sure you want to
//                 permanently delete this chat?
//               </DialogDescription>
//             </DialogHeader>
//             <div className='flex items-center space-x-2'>
//               <Button
//                 // className=' w-full text-gray-500 bg-gray-100 hover:bg-black hover:text-white  '
//                 className=' w-full text-gray-500 bg-gray-100 dark:bg-transparent hover:bg-black hover:text-white  '
//                 onClick={() => setOpenModel(false)}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => handleDeleteChat()}
//                 // variant='destructive'
//                 className='px-3 w-full bg-red-500 hover:bg-red-300 '
//               >
//                 Delete
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//         <div className='border rounded-md w-full bg-white flex flex-col md:max-h-screen h-full relative dark:bg-gray-900'>
//           <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />

//           <ScrollArea className='h-[calc(100vh-400px)] p-0 '>
//             {hasMessages ? (
//               <ChatbotMessages
//                 chatbot={bot as ChatBot}
//                 messages={chatMessages as ChatMessage[]}
//               />
//             ) : (
//               <div className='flex items-center justify-center h-full'>
//                 No messages yet.
//               </div>
//             )}
//           </ScrollArea>
//           <div className=' bg-white w-full dark:bg-gray-900 dark:text-gray-400 '>
//             {!chatRoom?.live ? (
//               <div className='p-5 text-center'>
//                 <Separator className='mb-5' />
//                 <h5>
//                   {" "}
//                   Customer might not be active you can reach your customer via
//                   email
//                 </h5>
//                 <div className=''>
//                   <div className='grid grid-cols-2'>
//                     <div className='font-bold p-2 col-span-1'>
//                       Email Address:
//                     </div>
//                     <div className=' p-2'>{chatRoom?.Customer?.email}</div>
//                   </div>
//                   <div className='grid grid-cols-2'>
//                     <div className='font-bold p-2 col-span-1'>Location:</div>
//                     <div className='p-2'>
//                       {chatRoom?.Customer?.city}
//                       {", "}
//                       {chatRoom?.Customer?.country}
//                     </div>
//                   </div>
//                   <Button
//                     disabled={isDeleting}
//                     onClick={() => setOpenModel(true)}
//                     className='w-full bg-gray-200/50 dark:bg-gray-950 dark:text-gray-400 text-black hover:bg-[#E1B177] hover:text-white dark:hover:bg-[#E1B177] dark:hover:text-gray-100'
//                   >
//                     Delete Chat
//                   </Button>
//                 </div>
//               </div>
//             ) : (
//               <ChatbotInput
//                 userDetails={userDetails as any}
//                 chatRoomId={chatRoom?.id!}
//                 chatbot={bot as ChatBot}
//                 type='assistant'
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='h-full flex items-center justify-center '>
//       <p className='text-muted-foreground '>
//         Select a chat to view the message.
//       </p>
//     </div>
//   );
// }

// export default ChatInterface;
// \${position}: \${position === "center" ? "50%" : "10px"};
// \${position === "center" ? "transform: translateX(50%);" : ""}
