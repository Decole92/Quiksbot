"use client";
import React, { useEffect, useState } from "react";
import ChatCard from "../ChatCard";
import { useGlobalStore } from "@/store/globalStore";
import useSWR from "swr";
import { useUser } from "@clerk/nextjs";
import { getAllActiveChats, getUserCustomers } from "@/actions/customer";
import { transformData } from "@/lib/transformData";
// md:max-h-[800px] lg:max-h-[800px] md:min-h-[800px] lg:min-h-[800px]
function MessageComponent({ data }: { data: any[] }) {
  const { user } = useUser();

  return (
    <div className='p-4 bg-white/50  md:max-h-[800px] lg:max-h-[800px] md:min-h-[800px] lg:min-h-[800px] h-full  overflow-y-auto'>
      {data && data?.length > 0 ? (
        <div>
          {data?.map((customer: any) => (
            <ChatCard key={customer?.chatRoom[0].id} customer={customer} />
          ))}
        </div>
      ) : (
        "There is no active lead customer yet!!"
      )}
    </div>
  );
}

export default MessageComponent;
