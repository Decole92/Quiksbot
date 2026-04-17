"use client";
import React, { useEffect, useState, useTransition } from "react";
import type { ChatBot, ChatMessage } from "@/types";

import { getChatMessages, getChatRoom } from "@/actions/chat";
import ChatbotHeader from "@/components/ChatbotComponent/ChatbotHeader";
import useSWR from "swr";
import { getBot } from "@/actions/bot";
import ChatbotMessages from "@/components/ChatbotComponent/ChatbotMessages";
import ChatbotInput from "@/components/ChatbotComponent/chatbotInput";
import SuggestItems from "@/components/ChatbotComponent/SuggestItems";
import { useGlobalStore } from "@/store/globalStore";

import { socket } from "@/lib/socket";
import useFcmToken from "@/hook/useFcmToken";
import { BASE_URL } from "../../../../../constant/url";

function ChatbotPage({ params }: { params: any }) {
  const { id } = React.use<{ id: string }>(params);
  const [isPending, startChatting] = useTransition();
  const { token } = useFcmToken();
  const { data: bot } = useSWR(
    "/getbot",
    id ? async () => await getBot(id) : null
  );

  const [isOpen, setIsOpen, chatId, setChatId, feedback] = useGlobalStore(
    (state) => [
      state.isOpen,
      state.setIsOpen,
      state.chatId,
      state.setChatId,
      state.feedback,
    ]
  );

  const {
    data: chatMessages,
    mutate,
    isLoading: loadingChatMessages,
  } = useSWR(
    chatId ? `/getMessages/${chatId}` : null,
    async () => await getChatMessages(chatId)
  );
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    chatId ? `/getChatRoom/${chatId}` : null,
    async () => (chatId !== null ? await getChatRoom(chatId) : null)
  );

  useEffect(() => {
    if (!chatId) return;
    const fetchMessages = async () => {
      const chats = await mutate(getChatMessages(chatId));
      if (chats === null) {
        setChatId("");
      }
    };
    fetchMessages();
  }, [chatId]);
  useEffect(() => {
    if (!chatId) return;
    const fetchMessages = async () => {
      const getRoom = await setChatRoom(getChatRoom(chatId));

      if (getRoom === null) {
        setChatId("");
      }
    };
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    setIsOpen(bot?.getDetails!);
  }, [id, bot]);

  useEffect(() => {
    if (!chatRoom?.live || !chatId) return;

    const handleNewMessage = async (data: any) => {
      if (chatMessages?.some((message: any) => message.id === data.id)) return;

      await mutate(getChatMessages(chatId));

      const updatedMessages = await getChatMessages(chatId);

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
    };
  }, [chatId, chatRoom?.live, chatMessages, mutate]);

  useEffect(() => {
    if (chatMessages) {
      setLocalMessages(chatMessages);
    }
  }, [chatMessages]);

  return (
    <div className=''>
      {bot && (
        <div className='flex flex-col h-screen max-w-3xl mx-auto bg-white md:rounded-t-lg shadow-2xl md:mt-10 dark:bg-gray-900'>
          <ChatbotHeader
            bot={bot as ChatBot}
            live={chatRoom?.live}
            messages={localMessages}
            setLocalMessages={setLocalMessages}
          />

          <div className='flex-1 overflow-y-auto'>
            <ChatbotMessages
              chatId={chatId}
              chatbot={bot as ChatBot}
              messages={(localMessages as ChatMessage[]) || chatMessages}
              loading={loadingChatMessages}
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
              chatRoomId={chatId}
              chatbot={bot as ChatBot}
              type='user'
              isPageLoading={isPending}
              setMessages={setLocalMessages}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatbotPage;
