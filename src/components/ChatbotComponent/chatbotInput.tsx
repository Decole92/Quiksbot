import React, { useState, useTransition } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import { useGlobalStore } from "@/store/globalStore";
import useSWR from "swr";
import { getChatMessages, getChatRoom } from "@/actions/chat";
import { getBot } from "@/actions/bot";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import type { ChatBot, ChatMessage, botType } from "@prisma/client";
import useSubcription from "@/hook/useSubscription";
import { sendMessage } from "@/actions/chat/sendMessage";

function ChatbotInput({
  userDetails,
  chatRoomId,
  chatbot,
  type,
  isPageLoading,
}: {
  userDetails: { name: string; email: string };
  chatRoomId: string;
  chatbot: ChatBot;
  type: string;
  isPageLoading?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen, formStatus] = useGlobalStore((state) => [
    state.isOpen,
    state.setIsOpen,
    state.formStatus,
  ]);

  const { data: chatMessages, mutate } = useSWR(
    "/getMessages",
    async () => await getChatMessages(chatRoomId)
  );
  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    "/getChatRoom",
    async () => (chatRoomId !== null ? await getChatRoom(chatRoomId) : null)
  );

  const { name, email } = userDetails;

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("formStatus", formStatus);
    if (!formStatus && chatbot?.getDetails) {
      setIsOpen(true);
      console.log("isOpen from first if", isOpen);
      return;
    }
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

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      message: "Thinking...",
      // @ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatRoomId,
      role: "ai",
      seen: true,
    };

    setChatRoom(getChatRoom(chatRoomId));

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
        optimisticData: [...(chatMessages as ChatMessage[]), userMessage],
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
          type === "assistant" ? "ai" : name
        );
        console.log("Message sent:", result);

        mutate(getChatMessages(chatRoomId), {
          optimisticData: (messages: any) =>
            messages!.map((msg: ChatMessage) =>
              msg?.id === loadingMessage?.id
                ? { ...msg, message: result?.message!, id: result?.id! }
                : msg
            ),
          populateCache: true, // Ensure that the cache is updated with the final result
          revalidate: false, // Prevent additional revalidation since we handle the update here
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
  };
  const isCheck = chatbot?.getDetails ? isPageLoading : false;

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
          disabled={isPending || !message || isCheck}
          type='submit'
          className={`p-2 bg-transparent rounded-md group hover:bg-{} dark:text-gray-950 dark:hover:bg-[${chatbot?.userMessageBgColor}] hover:bg-[${chatbot?.userMessageBgColor}]`}
        >
          <Send className='text-black group-hover:text-white' />
        </Button>
      </form>
    </div>
  );
}

export default ChatbotInput;
