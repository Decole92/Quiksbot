"use client";
import { createNewChatbot } from "@/actions/bot";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useSubcription from "@/hook/useSubscription";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

function CreatePageComponent() {
  const { user } = useUser();
  const fullName = user && user?.fullName;
  const [botName, setBotName] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isOverChatbotLimit, loading } = useSubcription();

  const handleCreateBot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isOverChatbotLimit) {
      alert("You have reached your chatbot limit.");
      return;
    }

    startTransition(async () => {
      try {
        const name = fullName;
        if (!name) {
          throw new Error("User name is required");
        }

        const bot = await createNewChatbot(botName, name);

        if (bot?.chatbot?.id) {
          router.push(`/edit-chatbot/${bot.chatbot.id}`);
        } else {
          alert("Please Upgrade your plan...");
          throw new Error("Failed to create chatbot");
        }
      } catch (error) {
        console.error("Error creating chatbot:", error);
        alert("Failed to create chatbot. Please try again.");
      }
    });
  };

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='bg-white dark:bg-gray-900 dark:text-gray-400 text-black p-10 m-10 flex flex-col md:flex-row items-center   md:space-x-5 rounded-md'>
        <Avatar seed='Create new chatbot' />
        <div className=''>
          <h2 className='text-black text-xl dark:text-gray-100'>Create</h2>
          <h1 className='font-thin text-sm'>
            Create a new chatbot to assist you in your conversation with your
            clients | <span className='text-[#E1B177]'>Appointment</span> |{" "}
            <span className='text-[#E1B177]'> Sales</span> |
            <span className='text-[#E1B177]'> Support</span>
          </h1>
          <form
            onSubmit={handleCreateBot}
            className='flex md:flex-row flex-col gap-2 mt-3'
          >
            <Input
              type='text'
              // disabled={isOverChatbotLimit}
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className='max-w-lg dark:bg-gray-950'
              placeholder='Chatbot Name...'
              required
            />
            <Button
              disabled={isPending || !botName}
              type='submit'
              className='bg-gray-900 dark:bg-gray-950 dark:text-gray-400 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:hover:text-gray-200'
            >
              Create Bot
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePageComponent;
