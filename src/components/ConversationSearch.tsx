import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { ChatBot } from "@prisma/client";

const ConversationSearch = ({
  chatbots,
  onSelectBot,
  defaultSelect,
}: {
  chatbots: ChatBot[];
  onSelectBot: (botId: string) => void;
  defaultSelect: string;
}) => {
  return (
    <div className='flex flex-col lg:-mb-2 md:-mb-2 pt-4'>
      <Select onValueChange={onSelectBot} defaultValue={defaultSelect}>
        <SelectTrigger className=' w-full '>
          <SelectValue placeholder='Filter Chatbot' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={null!}>Select all bot</SelectItem>
          {chatbots?.map((chatbot) => (
            <SelectItem key={chatbot?.id} value={chatbot?.id}>
              {chatbot?.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ConversationSearch;
