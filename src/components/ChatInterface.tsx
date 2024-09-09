"use client";
import React, { useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import { useGlobalStore } from "@/store/globalStore";
import ChatbotMessages from "./ChatbotMessages";
import ChatbotHeader from "./ChatbotComponent/ChatbotHeader";
import ChatbotInput from "./ChatbotComponent/chatbotInput";
import { updateChatRoomMode, viewMessage } from "@/actions/customer";
import { getBot } from "@/actions/bot";
import useSWR from "swr";
import logo from "../../public/golden.png";
import Image from "next/image";
import { clientPusher } from "@/lib/pusher";
import { getChatMessages, getChatRoom } from "@/actions/chat";
import { ScrollArea } from "./ui/scroll-area";

function ChatInterface() {
  const selectedChatRoomId = useGlobalStore(
    (state) => state.selectedChatRoomId
  );
  const { data: chatMessages, mutate } = useSWR("/getMessages", async () =>
    selectedChatRoomId !== null
      ? await getChatMessages(selectedChatRoomId)
      : null
  );
  const {
    data: chatRoom,
    error: chatRoomError,
    mutate: setChatRoom,
    isLoading: loadingRoom,
  } = useSWR(
    selectedChatRoomId ? `/api/chatRoom/${selectedChatRoomId}` : null,
    () => getChatRoom(selectedChatRoomId!)
  );

  const {
    data: bot,
    error: botError,
    mutate: setChatBot,
    isLoading: loadingBot,
  } = useSWR(
    chatRoom?.Customer?.chatbotId
      ? `/api/bot/${chatRoom?.Customer?.chatbotId}`
      : null,
    () => getBot(chatRoom?.Customer?.chatbotId!)
  );

  const userDetails = {
    name: chatRoom?.Customer?.name!,
    email: chatRoom?.Customer?.email,
  };

  //const isBotSet = !!bot;
  const hasMessages = chatRoom?.message && chatRoom.message.length > 0;

  const lastAIMessage = chatRoom?.message
    ?.filter((msg: any) => msg.role === "ai")
    ?.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  let isTimeExceeded;

  if (lastAIMessage) {
    const lastMessageTime = new Date(lastAIMessage.createdAt).getTime();
    const currentTime = new Date().getTime();

    const timeDifferenceInMinutes =
      (currentTime - lastMessageTime) / (1000 * 60);

    isTimeExceeded = timeDifferenceInMinutes > 30;
  }

  useEffect(() => {
    setChatBot();
    mutate(getChatMessages(selectedChatRoomId!));
    setChatRoom(getChatRoom(selectedChatRoomId!));
  }, [selectedChatRoomId, bot]);

  useEffect(() => {
    if (isTimeExceeded!) {
      const updateChatRoom = async () => {
        if (chatRoom && chatRoom.id) {
          await updateChatRoomMode(chatRoom.id);
        }
      };
      updateChatRoom();
    }
  }, [chatMessages, chatRoom]);

  useEffect(() => {
    const channel = clientPusher.subscribe("message");

    channel.bind("realtime", async (data: ChatMessage) => {
      if (chatMessages?.some((message: any) => message.id === data.id)) return;
      if (!chatRoom?.live) return;

      if (!chatRoom?.message) {
        await mutate(getChatMessages(selectedChatRoomId!));
      } else {
        mutate(getChatMessages(selectedChatRoomId!), {
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
  }, [chatMessages, mutate, selectedChatRoomId, clientPusher, chatRoom?.live]);

  if (loadingBot || loadingRoom) {
    return (
      <div className='flex justify-center w-full h-full items-center'>
        <div>
          <Image
            src={logo}
            alt='logo'
            height={100}
            width={100}
            className='animate-spin rounded-full'
          />
        </div>
      </div>
    );
  }
  if (bot && chatRoom) {
    return (
      <div className='border rounded-md w-full bg-white flex flex-col max-h-screen  relative'>
        <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />
        {/* bottom-0 z-30 sticky */}
        {/* <div className='flex flex-1 overflow-y-auto   '>
          {hasMessages ? (
            <ChatbotMessages
              chatbot={bot as ChatBot}
              messages={chatMessages as ChatMessage[]}
            />
          ) : (
            <div className='flex items-center justify-center h-full'>
              No messages yet.
            </div>
          )}


        </div> */}

        <ScrollArea className='h-[calc(100vh-400px)] p-5'>
          {hasMessages ? (
            <ChatbotMessages
              chatbot={bot as ChatBot}
              messages={chatMessages as ChatMessage[]}
            />
          ) : (
            <div className='flex items-center justify-center h-full'>
              No messages yet.
            </div>
          )}
        </ScrollArea>
        <div className=' bg-white w-full  '>
          {!chatRoom?.live ? (
            <div className='p-5 text-center m-5 '>
              <Separator className='mb-5' />
              <h5>
                {" "}
                Customer might not be active you can reach your customer via
                email
              </h5>
              <div className=''>
                <div className='grid grid-cols-2'>
                  <div className='font-bold p-2 col-span-1'>Email Address:</div>
                  <div className=' p-2'>{chatRoom?.Customer?.email}</div>
                </div>
              </div>
            </div>
          ) : (
            <ChatbotInput
              userDetails={userDetails as any}
              chatRoomId={chatRoom?.id!}
              chatbot={bot as ChatBot}
              type='assistant'
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex items-center justify-center'>
      <p className='text-muted-foreground'>
        Select a chat to view the message.
      </p>
    </div>
  );
}

export default ChatInterface;
