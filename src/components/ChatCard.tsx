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
import useSWR, { mutate } from "swr";
import { getChatRoom } from "@/actions/chat";

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
  const [selectedChatRoomId, setSelectedChatRoomId] = useGlobalStore(
    (state) => [state?.selectedChatRoomId, state.setSelectedChatRoomId]
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
  const { data: chatRoom } = useSWR(
    selectedChatRoomId ? `/api/chatRoom/${selectedChatRoomId}` : null,
    () => getChatRoom(selectedChatRoomId!)
  );

  console.log("this is chatRoomId", chatRoom?.id);
  console.log("this is selectedChatRoomId", selectedChatRoomId);
  return (
    <Card
      className={`${
        chatRoom && selectedChatRoomId === id ? "bg-gray-100" : "bg-white"
      } rounded-none border-r-0  cursor-pointer transition duration-150 ease-in-out relative `}
    >
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
