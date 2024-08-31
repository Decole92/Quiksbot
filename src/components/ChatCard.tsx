"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription } from "./ui/card";
import Avatar from "./Avatar";
import { Chat } from "openai/resources/beta/chat/chat.mjs";
import Image from "next/image";
import { toast } from "sonner";
import { viewMessage } from "@/actions/customer";
import { useGlobalStore } from "@/store/globalStore";
import { getBot } from "@/actions/bot";
import UrgentIcon from "../../constant/icons/urgentIcon";
import { mutate } from "swr";

type ChatMessage = {
  id: string;
  message: string;
  createdAt: string;
};

type ChatRoomEntry = {
  message: ChatMessage[];
  createdAt: string;
  id: string;
};

type Customer = {
  name: string;
  botIcon?: string;
  chatRoom: ChatRoomEntry[];
};

type Props = {
  customer: Customer;
};

const ChatCard = ({ customer }: Props) => {
  const setSelectedChatRoomId = useGlobalStore(
    (state) => state.setSelectedChatRoomId
  );
  const [urgent, setUrgent] = useState(false);
  const lastChatRoomEntry = customer?.chatRoom?.[customer.chatRoom.length - 1];

  const lastMessage =
    lastChatRoomEntry?.message?.[lastChatRoomEntry.message.length - 2]?.message;
  const id = customer?.chatRoom?.map((id) => id?.id)[0];

  const handleViewChatroom = async (id: string) => {
    if (!id) {
      console.error("Chatbot ID is not available.");
      return;
    }
    setSelectedChatRoomId(id!);
  };

  // const dt = new Date(lastChatRoomEntry?.createdAt);
  // const current = new Date();
  // const currentDate = current.getDate();

  // const date = dt.getDate();

  // const difference = currentDate - date;

  // useEffect(() => {
  //   if (difference <= 0) {
  //     if (current.getHours() - dt.getHours() < 2) {
  //       setUrgent(true);
  //     }
  //   }
  // }, [customer]);

  // const onSeenChat = async () => {
  //   if (urgent) {
  //     await viewMessage(id as any);
  //     setUrgent(false);
  //   }
  // };

  // useEffect(() => {
  //   onSeenChat();
  // }, [chatRoom]);

  return (
    <Card className='rounded-none border-r-0 hover:bg-white cursor-pointer transition duration-150 ease-in-out bg-white relative '>
      <CardContent
        onClick={() => handleViewChatroom(id)}
        className='py-4 flex items-center gap-5'
      >
        <div className=''>
          {customer?.botIcon ? (
            <Image
              src={customer?.botIcon}
              alt='chatbotIcon'
              width={100}
              height={100}
              className='md:h-20 lg:h-20 lg:w-24 h-14 rounded-full'
            />
          ) : (
            <Avatar seed={customer?.name} />
          )}
        </div>
        <div className='w-full  md:space-y-1 lg:space-y-2'>
          <div className='flex gap-5 items-center'>
            <CardDescription className='font-bold text-md leading-none text-gray-600'>
              {customer?.name}
            </CardDescription>
          </div>
          <div>
            <CardDescription className='clamp line-clamp-2 text-sm'>
              {lastMessage ? `${lastMessage}` : "No messages yet"}
            </CardDescription>
          </div>
          <div>{urgent ? <UrgentIcon /> : null}</div>
          <p className='absolute md:top-0 top-2 right-5 text-xs text-gray-400'>
            Created: {new Date(lastChatRoomEntry?.createdAt).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatCard;
