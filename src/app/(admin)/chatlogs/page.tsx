"use client";
import ChatInterface from "@/components/ChatInterface";
import ConversationMenu from "@/components/ConversationMenu";

import React from "react";

function Chatlog() {
  return (
    <div className='flex h-screen mt-16 w-full md:max-w-5xl md:mx-auto lg:max-w-6xl lg:mx-auto '>
      <ConversationMenu />

      <div className='flex-1 p-8 hidden md:inline-block lg:inline-block '>
        <ChatInterface />
      </div>
    </div>
  );
}

export default Chatlog;
