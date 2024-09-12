"use client";

import { getBot } from "@/actions/bot";
import { getChatMessages, getChatRoom, startNewChat } from "@/actions/chat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState, useTransition } from "react";
import useSWR from "swr";
import logo from "../../../../public/golden.png";
import ChatbotHeader from "@/components/ChatbotComponent/ChatbotHeader";
import ChatbotMessages from "@/components/ChatbotMessages";
import SuggestItems from "@/components/ChatbotComponent/SuggestItems";
import ChatbotInput from "@/components/ChatbotComponent/chatbotInput";
import { useGlobalStore } from "@/store/globalStore";

import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { postToParent } from "@/lib/parseToParent";
import { clientPusher } from "@/lib/pusher";
import { XCircleIcon } from "lucide-react";
import { ChatBot, ChatMessage } from "@prisma/client";

type Props = {};

const ChatBot = (props: Props) => {
  const [botOpened, setBotOpened] = useState(false);
  const [botId, setBotId] = useState<string>("");
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });
  const [chatId, setChatId] = useState<string>("");
  const [isLoading, startTransition] = useTransition();
  const [isPending, startChatting] = useTransition();
  const [isOpen, setIsOpen] = useGlobalStore((state) => [
    state.isOpen,
    state.setIsOpen,
  ]);

  const { data: bot, mutate: setBot } = useSWR(
    botId ? `/getbot/${botId}` : null,
    async () => await getBot(botId)
  );

  const { data: chatMessages, mutate } = useSWR(
    chatId ? `/getMessages` : null,
    async () => (chatId ? await getChatMessages(chatId) : null)
  );

  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    chatId ? `/getChatRoom/${chatId}` : null,
    async () => (chatId ? await getChatRoom(chatId) : null)
  );

  const onOpenChatBot = () => {
    setBotOpened(!botOpened);
  };

  const handleInformationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.get("/api/getlocation");
      console.log("Country:", response.data.country);
    } catch (err) {
      console.log("Error while getting location:", err);
    }
    startTransition(async () => {
      const chatRoomId = await startNewChat({ userDetails, id: botId });
      setChatId(chatRoomId!);
      setIsOpen(false);
    });
  };
  const loading = false;
  useEffect(() => {
    if (chatId) {
      mutate(getChatMessages(chatId));
      setChatRoom(getChatRoom(chatId));
    }
  }, [chatId, mutate, setChatRoom]);

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
  }, [chatMessages, mutate, chatId, chatRoom?.live]);

  useEffect(() => {
    postToParent(
      JSON.stringify({
        width: botOpened ? 400 : 100,
        height: botOpened ? 700 : 100,
      })
    );
  }, [botOpened]);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data === "string") {
        setBotId(e.data);
      }
      console.log("handleMessge", e.data as any);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (botId) {
      setBot(getBot(botId));
    }
    if (bot) {
      setIsOpen(bot?.getDetails!);
      console.log("isOpen", isOpen);
    }
  }, [botId]);

  useEffect(() => {
    const startChatAutomatically = async () => {
      if (bot && !bot?.getDetails) {
        startChatting(async () => {
          const chatRoomId = await startNewChat({ userDetails, id: botId });
          setChatId(chatRoomId!);
        });
      }
    };

    startChatAutomatically(); // Start chat on component mount
  }, [botId, bot]);
  return (
    <div className='h-screen flex flex-col justify-end items-end gap-4 bg-white'>
      {botOpened && isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className='sm:w-[200px] sm:mx-auto   '>
            <form onSubmit={handleInformationSubmit}>
              <DialogHeader>
                <DialogTitle>Lets help you out!</DialogTitle>
                <DialogDescription>
                  I just need a few details to get started.
                </DialogDescription>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
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
                <div className='grid grid-cols-4 items-center gap-4'>
                  <Label htmlFor='email' className='text-right'>
                    Email
                  </Label>
                  <Input
                    required
                    type='email'
                    placeholder='abc@test.com'
                    className='col-span-3'
                    value={userDetails.email}
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
      )}

      {botOpened && (
        <div className='h-screen w-[400px] flex flex-col bg-white rounded-xl border-[1px] overflow-hidden shadow-md'>
          {/* // <div className="flex flex-col h-screen max-w-3xl mx-auto bg-white md:rounded-t-lg shadow-md md:mt-10 "> */}
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
              chatRoomId={chatId!}
              chatbot={bot as ChatBot}
              type='user'
              isPageLoading={isPending}
            />
          </div>
        </div>
      )}

      {botOpened ? (
        <div>
          <XCircleIcon
            onClick={() => setBotOpened(!botOpened)}
            className='fill-white text-[#E1B177] h-9 w-9 cursor-pointer'
          />
        </div>
      ) : (
        <div
          className={cn(
            " relative rounded-full  cursor-pointer  w-24 h-24 flex items-center justify-center bg-white",
            loading ? "invisible" : "visible"
          )}
          onClick={onOpenChatBot}
        >
          {bot?.icon ? (
            <Image src={bot.icon} alt='bot' fill className='rounded-full' />
          ) : (
            <Image
              src={logo}
              alt='bot'
              className='rounded-full h-16 w-16'
              width={100}
              height={100}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;
