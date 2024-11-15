"use client";
import React, { useEffect, useState, useTransition } from "react";

import { getChatMessages, getChatRoom, startNewChat } from "@/actions/chat";
import ChatbotHeader from "@/components/ChatbotComponent/ChatbotHeader";
import useSWR from "swr";
import { getBot } from "@/actions/bot";
import ChatbotMessages from "@/components/ChatbotComponent/ChatbotMessages";
import ChatbotInput from "@/components/ChatbotComponent/chatbotInput";
import SuggestItems from "@/components/ChatbotComponent/SuggestItems";
import { useGlobalStore } from "@/store/globalStore";
import axios from "axios";
import { clientPusher } from "@/lib/pusher";
import type { ChatBot, ChatMessage } from "@prisma/client";

function ChatbotPage({ params: { id } }: { params: { id: string } }) {
  const [isLoading, startTransition] = useTransition();
  const [isPending, startChatting] = useTransition();

  const { data: bot } = useSWR(
    "/getbot",
    id ? async () => await getBot(id) : null
  );

  const [isOpen, setIsOpen, chatId, setChatId] = useGlobalStore((state) => [
    state.isOpen,
    state.setIsOpen,

    state.chatId,
    state.setChatId,
  ]);

  useEffect(() => {
    const startChatAutomatically = async () => {
      if (bot) {
        startChatting(async () => {
          const chatRoomId = await startNewChat({ id });
          setChatId(chatRoomId!);
        });
      }
    };
    if (!chatId) {
      startChatAutomatically();
    }
  }, [id, setChatId, bot, chatId]);

  const {
    data: chatMessages,
    mutate,
    isLoading: loadingChatMessages,
  } = useSWR("/getMessages", async () =>
    chatId !== null ? await getChatMessages(chatId) : null
  );

  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    chatId ? `/getChatRoom/${chatId}` : null,
    async () => (chatId !== null ? await getChatRoom(chatId) : null)
  );
  // console.log("chatrooom", chatMessages, chatRoom);
  useEffect(() => {
    const fetchMessages = async () => {
      await mutate(getChatMessages(chatId));
    };
    fetchMessages();
  }, [chatId]);
  useEffect(() => {
    const fetchMessages = async () => {
      await setChatRoom(getChatRoom(chatId));
    };
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    setIsOpen(bot?.getDetails!);
  }, [id, bot]);

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
  }, [chatMessages, mutate, clientPusher, chatId, chatRoom?.live]);

  return (
    <div className=''>
      {bot && (
        <div className='flex flex-col h-screen max-w-3xl mx-auto bg-white md:rounded-t-lg shadow-2xl md:mt-10 dark:bg-gray-900'>
          <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />

          <div className='flex-1 overflow-y-auto'>
            <ChatbotMessages
              chatId={chatId}
              chatbot={bot as ChatBot}
              messages={chatMessages as ChatMessage[]}
              loading={loadingChatMessages}
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
              chatRoomId={chatId}
              chatbot={bot as ChatBot}
              type='user'
              isPageLoading={isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatbotPage;
