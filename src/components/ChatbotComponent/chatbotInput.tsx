import React, { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useGlobalStore } from "@/store/globalStore";
import useSWR from "swr";
import { getChatMessages, getChatRoom } from "@/actions/chat";
import type { ChatBot, ChatMessage, botType } from "@prisma/client";
import { sendMessage } from "@/actions/chat/sendMessage";
import Image from "next/image";
import logo from "../../../public/circlegolden.png";
import Link from "next/link";
import ContactForm from "./ContactForm";
function ChatbotInput({
  chatRoomId,
  chatbot,
  type,
  isPageLoading,
}: {
  chatRoomId: string;
  chatbot: ChatBot;
  type: string;
  isPageLoading?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useGlobalStore((state) => [
    state.isOpen,
    state.setIsOpen,
  ]);

  const { data: chatMessages, mutate } = useSWR(
    "/getMessages",
    async () => await getChatMessages(chatRoomId)
  );

  const {
    data: chatRoom,
    mutate: setChatRoom,
    isLoading,
  } = useSWR(chatRoomId ? `/getChatRoom/${chatRoomId}` : null, async () =>
    chatRoomId !== null ? await getChatRoom(chatRoomId) : null
  );

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log("formStatus", formStatus);

    const passedMessage = message;
    setMessage("");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: passedMessage,
      // @ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatRoomId,
      role: type === "assistant" ? "ai" : "user",
      seen: true,
    };

    const contactFormMessage: ChatMessage = {
      id: Date.now().toString(),
      message: "",
      //@ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatRoomId,
      role: "ai",
      seen: true,
      type: "contact_form",
      component: <ContactForm id={chatRoomId} />,
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      message: "Thinking...",
      // @ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatRoomId,
      role: "ai",
      seen: true,
    };

    if (!chatRoom?.live) {
      mutate(getChatMessages(chatRoomId), {
        optimisticData: [
          ...(chatMessages ? chatMessages : []),
          userMessage,
          loadingMessage,
        ],
        rollbackOnError: true,
        populateCache: false,
        revalidate: false,
      });
    } else {
      mutate(getChatMessages(chatRoomId), {
        optimisticData: [...(chatMessages ? chatMessages : []), userMessage],
        rollbackOnError: true,
        populateCache: false,
        revalidate: false,
      });
    }

    startTransition(async () => {
      try {
        const result = await sendMessage(
          passedMessage,
          chatRoomId,
          chatbot,
          type === "assistant" ? "ai" : "user"
        );
        // console.log("Message sent:", result);

        mutate(getChatMessages(chatRoomId), {
          optimisticData: (messages: any) =>
            messages!.map((msg: ChatMessage) =>
              msg?.id === loadingMessage?.id
                ? { ...msg, message: result?.message!, id: result?.id! }
                : msg?.id === userMessage?.id && chatRoom?.live!
                ? { ...msg, message: result?.message!, id: result?.id! }
                : msg.type === "contact_form"
                ? { ...msg, component: <ContactForm id={chatRoomId} /> }
                : msg
            ),

          populateCache: false,
          revalidate: true,
        });

        setChatRoom(getChatRoom(chatRoomId));
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
  };

  return (
    <div className=''>
      <hr />
      <form
        className='p-5 flex items-center gap-2'
        onSubmit={handleAskQuestion}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minLength={3}
          className='py-3 px-5 bg-white dark:bg-gray-950 w-full rounded-full border border-gray-300 dark:border-gray-700 dark:text-gray-400 focus:outline-none'
          placeholder='Ask your question ?'
        />
        <Button
          disabled={isPending || !message}
          type='submit'
          className={`p-2 dark:bg-gray-950  bg-gray-200 shadow-lg shadow-gray-300 dark:shadow-gray-700 rounded-md group dark:text-gray-400 dark:hover:bg-[${chatbot?.userMessageBgColor}] hover:bg-[${chatbot?.userMessageBgColor}]`}
        >
          <Send className='text-black group-hover:text-white dark:text-gray-400 ' />
        </Button>
      </form>
      {chatbot?.watermark ? (
        <Link
          target='_blank'
          href='https://quiksbot.com'
          className='text-xs font-light dark:font-thin flex items-center justify-center -mt-5 p-4 tracking-widest w-full text-gray-400 '
        >
          Get your own ai chatbot |
          <span className='flex items-center gap-2 pl-1 font-semibold'>
            Quiksbot
            <Image
              src={logo}
              alt='watermark'
              width={46}
              height={46}
              className='h-4 w-4'
            />
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export default ChatbotInput;
