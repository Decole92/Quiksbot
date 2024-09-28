"use client";
import React, { useEffect, useState } from "react";
import ChatCard from "../ChatCard";
import { useGlobalStore } from "@/store/globalStore";
import useSWR from "swr";
import { useUser } from "@clerk/nextjs";
import { getAllActiveChats, getUserCustomers } from "@/actions/customer";
import { transformData } from "@/lib/transformData";
import { ScrollArea } from "../ui/scroll-area";

function MessageComponent({ data }: { data: any[] }) {
  const liveChatRooms = data?.filter((customer: any) =>
    customer.chatRoom.some((chatRoom: any) => chatRoom.live)
  );
  return (
    <>
      <ScrollArea className='lg:h-[calc(100vh-230px)] md:h-[calc(100vh-230px)] h-full p-2'>
        {data && data?.length > 0 ? (
          <div>
            {data?.map((customer: any) => (
              <ChatCard
                key={customer?.chatRoom[0]?.id}
                customer={customer}
                isLive={customer.chatRoom.some(
                  (chatRoom: any) => chatRoom.live
                )}
              />
            ))}
          </div>
        ) : (
          <p className='text-center'>There is no active lead customer yet.</p>
        )}
      </ScrollArea>
    </>
  );
}

export default MessageComponent;
