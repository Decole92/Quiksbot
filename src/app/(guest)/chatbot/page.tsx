"use client";
import React, { useEffect, useState, useTransition } from "react";
import type { ChatBot, ChatMessage } from "@/types";
import Image from "next/image";
import { X, XCircle } from "lucide-react";
import { useGlobalStore } from "@/store/globalStore";
import { getBot } from "@/actions/bot";
import { getChatMessages, getChatRoom } from "@/actions/chat";
import { postToParent } from "@/lib/parseToParent";
import useSWR from "swr";
import { socket } from "@/lib/socket";
import ChatbotHeader from "@/components/ChatbotComponent/ChatbotHeader";
import ChatbotMessages from "@/components/ChatbotComponent/ChatbotMessages";
import SuggestItems from "@/components/ChatbotComponent/SuggestItems";
import ChatbotInput from "@/components/ChatbotComponent/chatbotInput";
import defaultLogo from "../../../../public/circlegolden.png";
import useFcmToken from "@/hook/useFcmToken";
import { BASE_URL } from "../../../../constant/url";

export default function ChatBot() {
  const [chatId, setChatId] = useGlobalStore((state) => [
    state.chatId,
    state.setChatId,
  ]);
  const { token } = useFcmToken();
  const [botOpened, setBotOpened] = useState(false);
  const [botId, setBotId] = useState<string>("");
  const [showGreeting, setShowGreeting] = useState(true);
  const [isPending, startChatting] = useTransition();
  const [isOpen, setIsOpen] = useGlobalStore((state) => [
    state.isOpen,
    state.setIsOpen,
  ]);

  const { data: bot, mutate: setBot } = useSWR(
    botId ? `/getbot/${botId}` : null,
    () => getBot(botId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const {
    data: chatMessages,
    mutate,
    isLoading: loadingChatMessages,
  } = useSWR(
    chatId ? `/getMessages/${chatId}` : null,
    () => (chatId ? getChatMessages(chatId) : null),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    chatId ? `/getChatRoom/${chatId}` : null,
    () => (chatId ? getChatRoom(chatId) : null),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const handleOpenChatBot = () => {
    const newOpenState = !botOpened;
    setBotOpened(newOpenState);

    // Send message to parent for z-index management
    window.parent.postMessage(
      newOpenState ? "chatbot-opened" : "chatbot-closed",
      "*"
    );
  };

  useEffect(() => {
    if (chatId) {
      mutate(getChatMessages(chatId));
      setChatRoom(getChatRoom(chatId));
    }
    window.parent.postMessage(
      chatId ? "greeting-closed" : "greeting-opened",
      "*"
    );
  }, [chatId, mutate, setChatRoom]);

  useEffect(() => {
    // Ensure connection
    if (!socket.connected) {
      socket.connect();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Reconnect if not connected when tab becomes visible
        if (!socket.connected) {
          socket.connect();
        }
      }
    };

    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (!chatRoom?.live || !chatId) return;

    const handleNewMessage = async (data: any) => {
      // Prevent duplicate messages
      if (chatMessages?.some((message: any) => message.id === data.id)) return;

      await mutate(getChatMessages(chatId));

      const updatedMessages = await getChatMessages(chatId);

      // Extract the last message (newest) from the updated list
      const lastMessage = updatedMessages?.[updatedMessages.length - 1];

      if (!lastMessage) return;

      await fetch("/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          title: `New message from ${bot?.name}`,
          message: lastMessage?.message,
          link: `${BASE_URL}/chatbot/${bot?.id}`,
        }),
      });
    };

    socket.emit("join-room", chatId);
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
      socket.emit("leave-room", chatId);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [chatId, chatRoom?.live, chatMessages, mutate]);

  useEffect(() => {
    postToParent(
      JSON.stringify({
        width: botOpened ? 460 : 460,
        height: botOpened ? 800 : 150,
      })
    );
  }, [botOpened]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data === "string" && e.data.trim() !== "") {
        setBotId(e.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (botId) {
      setBot(getBot(botId));
    }
  }, [botId, setBot]);

  useEffect(() => {
    if (bot) {
      setIsOpen(bot.getDetails);
    }
  }, [bot, setIsOpen]);

  useEffect(() => {
    if (chatMessages) {
      setLocalMessages(chatMessages);
    }
  }, [chatMessages]);

  return (
    <div
      className={`fixed bottom-2 ${
        bot?.iconPosition === "right"
          ? "right-0 md:right-5"
          : bot?.iconPosition === "left"
          ? "left-0 md:left-5"
          : bot?.iconPosition === "center"
          ? "right-0 md:right-1/2"
          : "right-0 md:right-5"
      } z-50 flex flex-col transition-transform duration-500 space-y-2`}
      style={{ transformOrigin: "bottom right" }}
    >
      {botOpened && bot && (
        <div className='flex h-[100vh] max-h-[91.5vh] md:h-[100vh] w-[100vw] md:w-[100vw] flex-col border bg-white shadow-lg dark:bg-gray-900 rounded-t-lg'>
          <ChatbotHeader
            bot={bot as ChatBot}
            live={chatRoom?.live}
            setBotOpened={(value: boolean) => setBotOpened(value)}
            messages={localMessages}
            setLocalMessages={setLocalMessages}
          />
          <div className='flex-1 w-full overflow-y-auto '>
            <ChatbotMessages
              chatbot={bot as ChatBot}
              messages={(localMessages as ChatMessage[]) || chatMessages}
              loading={loadingChatMessages || isPending}
              chatId={chatId}
            />
          </div>
          <div className='sticky bottom-0 z-30 bg-white dark:bg-gray-900'>
            {!chatRoom?.live && (
              <SuggestItems
                firstQuestion={bot?.firstQuestion as any}
                chatbot={bot!}
                chatId={chatId!}
                setMessages={setLocalMessages}
              />
            )}
            <ChatbotInput
              chatRoomId={chatId!}
              chatbot={bot as ChatBot}
              type='user'
              isPageLoading={isPending}
              setMessages={setLocalMessages}
            />
          </div>
        </div>
      )}
      <div
        className={`${
          bot?.iconPosition === "left" ? "items-start" : "items-end"
        } flex flex-col  space-y-2
      `}
      >
        {showGreeting && bot && !chatId && (
          <div className='relative bg-white dark:bg-gray-950 rounded-lg p-4 shadow-md max-w-[280px]'>
            <button
              onClick={() => setShowGreeting(false)}
              className='absolute top-2 right-2 text-gray-500 hover:text-gray-700 p-1'
            >
              <X size={16} />
            </button>
            <p className='text-sm text-gray-600 dark:text-gray-300 pr-6'>
              {bot?.greetings}
            </p>
          </div>
        )}
        <button
          id='chatbot-icon'
          onClick={() => {
            handleOpenChatBot();
            setShowGreeting(false);
          }}
          style={{
            backgroundColor: bot?.userMessageBgColor?.trim() || "transparent",
          }}
          className={`${
            bot?.userMessageBgColor
              ? ""
              : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800"
          } 
           ${!bot ? "cursor-wait" : "cursor-pointer"}
          items-center justify-center h-12 w-12 rounded-full shadow-md flex`}
        >
          {botOpened && bot ? (
            <XCircle className='h-8 w-8 text-gray-600' />
          ) : (
            <Image
              src={bot?.icon || defaultLogo}
              alt='ChatBot'
              width={48}
              height={48}
              className='h-8 w-8 rounded-full '
            />
          )}
        </button>
      </div>
    </div>
  );
}
