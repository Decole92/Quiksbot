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
  return (
    <>
      <ScrollArea className='lg:h-[calc(100vh-230px)] md:h-[calc(100vh-230px)] lg:block md:block hidden sm:hidden p-2'>
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
          <p className='text-center lg:block md:block sm:block hidden'>
            There is no active lead customer yet.
          </p>
        )}
      </ScrollArea>
      <div className='lg:hidden md:hidden sm:block block h-full mx-4 '>
        {data && data?.length > 0 ? (
          <div className=''>
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
          <p className='text-center sm:hidden block md:hidden lg:hidden'>
            There is no active lead customer yet.
          </p>
        )}
      </div>
    </>
  );
}

export default MessageComponent;
