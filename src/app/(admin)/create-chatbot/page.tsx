"use client";
import { createNewChatbot } from "@/actions/bot";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
function CreatePage() {
  const { user } = useUser();
  const fullName = user && user?.fullName;
  const [botName, setBotName] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCreateBot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("start transition here");
    startTransition(async () => {
      const name = JSON.parse(JSON.stringify(fullName));
      // console.log("this is chatbot data && chatbot id", data, data.chatbot);
      const bot = await createNewChatbot(botName, fullName!);
      //  return later
      // @ts-ignore
      router.push(`/edit-chatbot/${bot?.chatbot?.id!}`);
    });
  };

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='bg-white text-black p-10 m-10 flex flex-col md:flex-row items-center   md:space-x-5 rounded-md'>
        <Avatar seed='Create new chatbot' />
        <div className=''>
          <h2 className='text-black text-xl'>Create </h2>
          <p className='font-thin text-sm'>
            Create a new chatbot to assist you in your conversation with your
            clients.
          </p>
          <form
            onSubmit={handleCreateBot}
            className='flex md:flex-row flex-col gap-2 mt-3'
          >
            <Input
              type='text'
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className='max-w-lg'
              placeholder='Chatbot Name...'
              required
            />
            <Button disabled={isPending} type='submit' className='bg-black'>
              Create bot
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePage;
