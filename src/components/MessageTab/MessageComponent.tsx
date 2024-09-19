"use client";
import React, { useEffect, useState } from "react";
import ChatCard from "../ChatCard";
import { useGlobalStore } from "@/store/globalStore";
import useSWR from "swr";
import { useUser } from "@clerk/nextjs";
import { getAllActiveChats, getUserCustomers } from "@/actions/customer";
import { transformData } from "@/lib/transformData";
import { ScrollArea } from "../ui/scroll-area";
// md:max-h-[800px] lg:max-h-[800px] md:min-h-[800px] lg:min-h-[800px]
function MessageComponent({ data }: { data: any[] }) {
  // const { user } = useUser();

  return (
    <ScrollArea className='h-[calc(100vh-120px)] p-4'>
      {data && data?.length > 0 ? (
        <div>
          {data?.map((customer: any) => (
            <ChatCard key={customer?.chatRoom[0]?.id} customer={customer} />
          ))}
        </div>
      ) : (
        "There is no active lead customer yet!!"
      )}
    </ScrollArea>
  );
}

export default MessageComponent;
