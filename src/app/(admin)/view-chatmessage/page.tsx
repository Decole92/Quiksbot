import ChatInterface from "@/components/ChatInterface";
import React from "react";

export default function viewChatMessage() {
  return (
    <div className='flex flex-col h-screen  md:max-w-3xl md:mx-auto lg:max-w-3xl lg:mx-auto w-full bg-white md:rounded-t-lg shadow-2xl mt-20'>
      <ChatInterface />
    </div>
  );
}
