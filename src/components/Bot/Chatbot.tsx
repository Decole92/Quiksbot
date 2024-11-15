"use client";

import React, { useCallback, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { XCircle } from "lucide-react";

import { useGlobalStore } from "@/store/globalStore";
import { getBot } from "@/actions/bot";
import { getChatMessages, getChatRoom, startNewChat } from "@/actions/chat";
import { postToParent } from "@/lib/parseToParent";
import { clientPusher } from "@/lib/pusher";
import useSWR from "swr";
import axios from "axios";
import type { ChatBot, ChatMessage, ChatRoom } from "@prisma/client";

import ChatbotHeader from "@/components/ChatbotComponent/ChatbotHeader";
import ChatbotMessages from "@/components/ChatbotComponent/ChatbotMessages";
import SuggestItems from "@/components/ChatbotComponent/SuggestItems";
import ChatbotInput from "@/components/ChatbotComponent/chatbotInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import defaultLogo from "../../../public/golden.png";

const ChatBot: React.FC = () => {
  const [botOpened, setBotOpened] = useState(false);
  const [botId, setBotId] = useState<string>("");
  const [userDetails, setUserDetails] = useState({ name: "", email: "" });
  const [chatId, setChatId] = useState<string>("");
  const [isLoading, startTransition] = useTransition();
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
  const { data: chatMessages, mutate } = useSWR(
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

  const handleOpenChatBot = () => setBotOpened(!botOpened);

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
      if (chatMessages?.some((message: any) => message.id === data.id)) return;
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
        width: botOpened ? 380 : 80,
        height: botOpened ? 800 : 80,
      })
    );
  }, [botOpened]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data === "string") {
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
    const startChatAutomatically = async () => {
      if (bot && !bot.getDetails) {
        startChatting(async () => {
          const chatRoomId = await startNewChat({ id: botId });
          setChatId(chatRoomId!);
        });
      }
    };
    startChatAutomatically();
  }, [bot, botId, userDetails, startChatting]);

  return (
    <div
      className={`fixed bottom-3 right-3 md:bottom-5 md:right-5 z-50 flex flex-col items-end transition-transform duration-500 ${
        botOpened ? "scale-90" : "scale-100"
      }`}
      style={{ transformOrigin: "bottom right" }} // Zoom effect origin
    >
      {botOpened && (
        <div className='mb-2 w-full max-w-[350px] h-[80vh] max-h-[680px] flex flex-col bg-white dark:bg-gray-900 rounded-xl border shadow-lg overflow-hidden'>
          <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />
          <div className='flex-1 overflow-y-auto'>
            <ChatbotMessages
              chatId={chatId}
              chatbot={bot as ChatBot}
              messages={chatMessages as ChatMessage[]}
            />
          </div>
          <div className='sticky bottom-0 z-30 bg-white dark:bg-gray-900 '>
            <SuggestItems
              firstQuestion={bot?.firstQuestion as any}
              chatbot={bot!}
              chatId={chatId!}
            />

            <ChatbotInput
              chatRoomId={chatId!}
              chatbot={bot as ChatBot}
              type='user'
              isPageLoading={isPending}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleOpenChatBot}
        className='relative w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-white dark:bg-gray-950 dark:shadow-gray-900 flex items-center justify-center focus:outline-none shadow-md'
        // className='relative w-20 h-20 rounded-full bg-white  dark:bg-gray-950 dark:shadow-gray-900 flex items-center justify-center focus:outline-none shadow-md'
      >
        {botOpened ? (
          <XCircle
            className='w-8 h-8 md:w-10 md:h-10 text-gray-600'
            // className='w-10 h-10 text-gray-600'
          />
        ) : (
          <Image
            src={bot?.icon || defaultLogo}
            alt='ChatBot'
            // width={60}
            // height={60}
            width={48}
            height={48}
            // className='rounded-full'
            className='rounded-full w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16'
          />
        )}
      </button>
    </div>
  );
};

export default React.memo(ChatBot);
