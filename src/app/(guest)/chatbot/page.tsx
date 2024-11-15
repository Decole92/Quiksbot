"use client";

import React, { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { MessageCircle, X, XCircle } from "lucide-react";
import { useGlobalStore } from "@/store/globalStore";
import { getBot } from "@/actions/bot";
import { getChatMessages, getChatRoom, startNewChat } from "@/actions/chat";
import { postToParent } from "@/lib/parseToParent";
import { clientPusher } from "@/lib/pusher";
import useSWR from "swr";
import type { ChatBot, ChatMessage, ChatRoom } from "@prisma/client";

import ChatbotHeader from "@/components/ChatbotComponent/ChatbotHeader";
import ChatbotMessages from "@/components/ChatbotComponent/ChatbotMessages";
import SuggestItems from "@/components/ChatbotComponent/SuggestItems";
import ChatbotInput from "@/components/ChatbotComponent/chatbotInput";

import defaultLogo from "../../../../public/circlegolden.png";

export default function ChatBot() {
  const [chatId, setChatId] = useGlobalStore((state) => [
    state.chatId,
    state.setChatId,
  ]);
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
    chatId ? `/getMessages` : null,
    () => (chatId ? getChatMessages(chatId) : null),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    chatId ? `/getChatRoom/${chatId}` : null,
    () => (chatId ? getChatRoom(chatId) : null),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const startChatAutomatically = async () => {
    if (bot) {
      startChatting(async () => {
        try {
          const chatRoomId = await startNewChat({ id: botId });
          setChatId(chatRoomId!);
        } catch (error) {
          console.error("Error starting chat:", error);
        }
      });
    }
  };

  const handleOpenChatBot = () => {
    if (!chatId) {
      startChatAutomatically();
    }
    setBotOpened(!botOpened);
  };

  useEffect(() => {
    if (chatId) {
      mutate(getChatMessages(chatId));
      setChatRoom(getChatRoom(chatId));
    }
  }, [chatId, mutate, setChatRoom]);

  useEffect(() => {
    if (!chatRoom?.live) return;
    const channel = clientPusher.subscribe("message");
    channel.bind("realtime", async (data: ChatMessage) => {
      if (chatMessages?.find((message: any) => message.id === data.id)) return;

      if (!chatMessages) {
        await mutate(getChatMessages(chatId));
      } else {
        mutate(getChatMessages(chatId), {
          optimisticData: [...(chatMessages as any[]), data],
          rollbackOnError: true,
          populateCache: false,
          revalidate: false,
        });
      }
    });
    return () => {
      channel.unbind("realtime");
      clientPusher.unsubscribe("message");
    };
  }, [chatMessages, mutate, chatId, chatRoom?.live]);

  useEffect(() => {
    postToParent(
      JSON.stringify({
        width: botOpened ? 460 : 460,
        height: botOpened ? 800 : 130,
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

  return (
    <div
      className={`fixed bottom-1 right-1 md:bottom-5 md:right-5 z-50 flex flex-col items-end transition-transform duration-500`}
      style={{ transformOrigin: "bottom right" }}
    >
      {botOpened && bot && (
        <div className='flex h-[700px]  w-full max-w-[500px] flex-col overflow-hidden rounded-xl border bg-white shadow-lg dark:bg-gray-900'>
          <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />
          <div className='flex-1 w-full overflow-y-auto'>
            <ChatbotMessages
              chatbot={bot as ChatBot}
              messages={chatMessages as ChatMessage[]}
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
              />
            )}
            <ChatbotInput
              chatRoomId={chatId!}
              chatbot={bot as ChatBot}
              type='user'
              isPageLoading={isPending}
            />
          </div>
        </div>
      )}
      <div className='flex flex-col items-end space-y-2'>
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
          className=' items-center justify-center h-12 w-12 rounded-full shadow-md flex'
        >
          {botOpened ? (
            <XCircle className='h-8 w-8 text-gray-600 ' />
          ) : (
            <Image
              src={bot?.icon || defaultLogo}
              alt='ChatBot'
              width={48}
              height={48}
              className='h-8 w-8 rounded-full'
            />
          )}
        </button>
      </div>
    </div>
  );
}
