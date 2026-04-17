"use client";
import React from "react";
import { Card, CardContent, CardDescription } from "./ui/card";
import Avatar from "./Avatar";

import Image from "next/image";

import { useGlobalStore } from "@/store/globalStore";

import { useRouter } from "next/navigation";
import Link from "next/link";

type ChatMessage = {
  id: string;
  message: string;
  createdAt: string;
};

type ChatRoomEntry = {
  message: any[];
  createdAt: string;
  id: string;
  live: boolean;
};

type Customer = {
  name: string;
  botIcon?: string;
  chatRoom: ChatRoomEntry[];
};

type Props = {
  customer: any;
  isLive: boolean;
};

const ChatCard = ({ customer, isLive }: Props) => {
  const [selectedChatRoomId, setSelectedChatRoomId] = useGlobalStore(
    (state) => [state?.selectedChatRoomId, state.setSelectedChatRoomId],
  );
  const router = useRouter();
  const lastChatRoomEntry = customer?.chatRoom?.[customer.chatRoom.length - 1];

  const lastMessage =
    lastChatRoomEntry?.message?.[lastChatRoomEntry.message.length - 1]?.message;
  const id = customer?.chatRoom?.map((id: any) => id?.id)[0];

  const handleViewChatroom = async (id: string) => {
    if (!id) {
      console.error("Chatbot ID is not available.");
      return;
    }
    setSelectedChatRoomId(id!);
  };

  return (
    <>
      <Card
        className={`mb-4 group w-full hidden md:flex lg:flex flex-row items-center  gap-4 cursor-pointer rounded-lg border p-4 transition-all hover:border-b hover:border-t hover:border-t-[#E1B177]  hover:border-b-[#E1B177] relative ${
          selectedChatRoomId === id
            ? "bg-gray-100 dark:bg-gray-900  border-t border-b  border-t-[#E1B177]  border-b-[#E1B177]  "
            : "dark:bg-gray-950 bg-white "
        }`}
        onClick={() => handleViewChatroom(id)}
      >
        <div className='flex-shrink-0'>
          {customer?.botIcon ? (
            <Image
              src={customer?.botIcon}
              alt='chatbotIcon'
              width={100}
              height={100}
              className='rounded-full h-16 w-16'
            />
          ) : (
            <Avatar seed={customer?.name} className='h-16 w-16' />
          )}
        </div>
        <div className='flex flex-col flex-1 gap-1 min-w-0 pr-16'>
          <div className='flex items-center gap-2 text-sm font-medium py-1 min-w-0'>
            <div className='truncate'>{customer?.name}</div>
            {isLive && (
              <div className='bg-primary px-2 py-0.5 rounded-full text-primary-foreground text-xs font-medium shrink-0'>
                Active
              </div>
            )}
          </div>
          <div className='text-xs text-muted-foreground absolute top-2 left-5'>
            {lastChatRoomEntry?.createdAt
              ? new Date(lastChatRoomEntry.createdAt).toLocaleDateString()
              : ""}
          </div>
          <div className='text-sm text-muted-foreground line-clamp-2'>
            {lastMessage ? `${lastMessage}` : "No messages yet"}
          </div>
        </div>
      </Card>

      <Link href={`/chatlogs/${id}`}>
        <Card
          className={`mb-4 md:hidden w-full lg:hidden inline-flex group  flex-row items-center  gap-4 cursor-pointer rounded-lg border p-4 transition-all hover:bg-gray-100 relative ${
            selectedChatRoomId === id
              ? "bg-gray-100 dark:bg-gray-900  "
              : "bg-white dark:bg-gray-950"
          }`}
        >
          {/* Bot Icon or Avatar on the left */}
          <div className='flex-shrink-0'>
            {customer?.botIcon ? (
              <Image
                src={customer?.botIcon}
                alt='chatbotIcon'
                width={100}
                height={100}
                className='rounded-full h-16 w-16'
              />
            ) : (
              <Avatar seed={customer?.name} className='h-16 w-16' />
            )}
          </div>
          <div className='flex flex-col flex-1 gap-1 min-w-0 pr-16'>
            <div className='flex items-center gap-2 text-sm font-medium py-1 min-w-0'>
              <div className='truncate'>{customer?.name}</div>

              {isLive && (
                <div className='bg-primary px-2 py-0.5 rounded-full text-primary-foreground text-xs font-medium shrink-0'>
                  Active
                </div>
              )}
            </div>
            <div className='text-xs text-muted-foreground absolute top-2 right-3'>
              {lastChatRoomEntry?.createdAt
                ? new Date(lastChatRoomEntry.createdAt).toLocaleDateString()
                : ""}
            </div>
            <div className='text-sm text-muted-foreground line-clamp-2'>
              {lastMessage ? `${lastMessage}` : "No messages yet"}
            </div>
          </div>
        </Card>
      </Link>
    </>
  );
};

export default ChatCard;
