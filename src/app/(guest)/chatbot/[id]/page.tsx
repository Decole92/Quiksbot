"use client";
import React, { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getChatMessages, getChatRoom, startNewChat } from "@/actions/chat";
import ChatbotHeader from "@/components/ChatbotComponent/ChatbotHeader";
import useSWR from "swr";
import { getBot } from "@/actions/bot";
import ChatbotMessages from "@/components/ChatbotMessages";
import ChatbotInput from "@/components/ChatbotComponent/chatbotInput";
import SuggestItems from "@/components/ChatbotComponent/SuggestItems";
import { useGlobalStore } from "@/store/globalStore";
import axios from "axios";
import { clientPusher } from "@/lib/pusher";
import { ChatBot, ChatMessage } from "@prisma/client";

function ChatbotPage({ params: { id } }: { params: { id: string } }) {
  const [isLoading, startTransition] = useTransition();
  const [isPending, startChatting] = useTransition();
  const { data: bot } = useSWR(
    "/getbot",
    id ? async () => await getBot(id) : null
  );
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });
  const [isOpen, setIsOpen] = useGlobalStore((state) => [
    state.isOpen,
    state.setIsOpen,
  ]);

  useEffect(() => {
    const startChatAutomatically = async () => {
      if (bot && !bot?.getDetails) {
        startChatting(async () => {
          const chatRoomId = await startNewChat({ userDetails, id });
          setChatId(chatRoomId!);
        });
      }
    };

    startChatAutomatically(); // Start chat on component mount
  }, [id, bot]);

  const [chatId, setChatId] = useState<string>("");

  const { data: chatMessages, mutate } = useSWR("/getMessages", async () =>
    chatId !== null ? await getChatMessages(chatId) : null
  );

  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    "/getChatRoom",
    async () => (chatId !== null ? await getChatRoom(chatId) : null)
  );
  const handleInformationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("userDetails", userDetails, id);

    try {
      const response = await axios.get("/api/getlocation");
      console.log("country", response.data.country);
    } catch (err) {
      console.log("error while getting location", err);
    }
    startTransition(async () => {
      const chatRoomId = await startNewChat({ userDetails, id });
      setChatId(chatRoomId!);
      setIsOpen(false);
    });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      await mutate(getChatMessages(chatId));
    };
    fetchMessages();
  }, [chatId]);
  useEffect(() => {
    const fetchMessages = async () => {
      await setChatRoom(getChatRoom(chatId));
    };
    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    setIsOpen(bot?.getDetails!);
    console.log("this is isOpen");
  }, [id, bot]);

  useEffect(() => {
    if (!chatRoom?.live) return;
    const channel = clientPusher.subscribe("message");
    channel.bind("realtime", async (data: ChatMessage) => {
      if (chatMessages?.some((message: any) => message.id === data.id)) return;

      if (!chatMessages) {
        await mutate(getChatMessages(chatId));
      } else {
        mutate(getChatMessages(chatId), {
          optimisticData: [...(chatMessages as any[]), data],
          rollbackOnError: true,
          populateCache: false,
          revalidate: false,
        });
      }
    });

    return () => {
      channel.unbind("realtime");
      clientPusher.unsubscribe("message");
    };
  }, [chatMessages, mutate, clientPusher, chatId, chatRoom?.live]);

  return (
    <div className=''>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[425px]  '>
          <form onSubmit={handleInformationSubmit}>
            <DialogHeader>
              <DialogTitle>Lets help you out!</DialogTitle>
              <DialogDescription>
                I just need a few details to get started.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4 '>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='name' className='text-right'>
                  Name
                </Label>
                <Input
                  required
                  placeholder='John Doe'
                  className='col-span-3'
                  value={userDetails.name}
                  onChange={(e) =>
                    setUserDetails((values) => ({
                      ...values,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4 '>
                <Label htmlFor='username' className='text-right'>
                  Email
                </Label>
                <Input
                  required
                  type='email'
                  value={userDetails.email}
                  placeholder='abc@test.com'
                  className='col-span-3'
                  onChange={(e) =>
                    setUserDetails((values) => ({
                      ...values,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button disabled={isLoading} type='submit'>
                {!isLoading ? "Continue" : "Loading..."}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {bot && (
        <div className='flex flex-col h-screen max-w-3xl mx-auto bg-white md:rounded-t-lg shadow-2xl md:mt-10'>
          <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />

          <div className='flex-1 overflow-y-auto'>
            <ChatbotMessages
              chatbot={bot as ChatBot}
              messages={chatMessages as ChatMessage[]}
            />
          </div>

          <div className='sticky bottom-0 z-30 bg-white'>
            <SuggestItems firstQuestion={bot?.firstQuestion as any} />
            <ChatbotInput
              userDetails={userDetails}
              chatRoomId={chatId}
              chatbot={bot as ChatBot}
              type='user'
              isPageLoading={isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatbotPage;
