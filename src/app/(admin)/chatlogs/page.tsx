"use client";
import ChatInterface from "@/components/ChatInterface";
import ConversationMenu from "@/components/ConversationMenu";
import { Separator } from "@/components/ui/separator";
import { useGlobalStore } from "@/store/globalStore";
import React from "react";

function Chatlog() {
  return (
    // <div className='mt-16  w-full md:max-w-5xl md:mx-auto lg:max-w-6xl lg:mx-auto md:max-h-svh lg:max-h-svh h-full'>
    //   <div className='flex flex-col md:flex-row md:items-start p-5'>
    //     <ConversationMenu />

    //     <Separator orientation='vertical' className='' />

    //     <div className='flex-1 w-full border border-gray-200 p-2 hidden md:inline-block md:max-h-screen'>
    //       <ChatInterface />
    //     </div>
    //   </div>
    // </div>
    <div className='w-full mt-16 h-full flex  md:items-start lg:items-start md:gap-2 lg:gap-5 md:max-w-5xl md:mx-auto lg:max-w-6xl lg:mx-auto  p-5'>
      <ConversationMenu />

      <Separator orientation='vertical' />
      <div className='w-full  flex-col hidden md:inline-block h-full'>
        <ChatInterface />
      </div>
    </div>
  );
}

export default Chatlog;
