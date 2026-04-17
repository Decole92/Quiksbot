"use client";
import React, { useEffect, useState, useTransition } from "react";
import type { ChatBot, ChatMessage } from "@/types";
import { Separator } from "./ui/separator";
import { useGlobalStore } from "@/store/globalStore";
import ChatbotMessages from "./ChatbotComponent/ChatbotMessages";
import ChatbotHeader from "./ChatbotComponent/ChatbotHeader";
import ChatbotInput from "./ChatbotComponent/chatbotInput";
import {
  getUserCustomers,
  updateChatRoomMode,
  viewMessage,
} from "@/actions/customer";
import { getBot } from "@/actions/bot";
import useSWR from "swr";
import logo from "../../public/golden.png";
import Image from "next/image";

import {
  deleteChatRoomById,
  getChatMessages,
  getChatRoom,
} from "@/actions/chat";
import { ScrollArea } from "./ui/scroll-area";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import { socket } from "@/lib/socket";
import useSubcription from "@/hook/useSubscription";
import useFcmToken from "@/hook/useFcmToken";
import { BASE_URL } from "../../constant/url";

function ChatInterface() {
  const [openModel, setOpenModel] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const { token } = useFcmToken();
  const { user } = useUser();

  const [selectedChatRoomId, setSelectedChatRoomId, setChatId] = useGlobalStore(
    (state) => [
      state.selectedChatRoomId,
      state.setSelectedChatRoomId,
      state.setChatId,
    ]
  );

  const { data: chatMessages, mutate } = useSWR(
    selectedChatRoomId ? `/getMessages/${selectedChatRoomId}` : null,
    async () => await getChatMessages(selectedChatRoomId!)
  );

  const {
    data: chatRoom,
    error: chatRoomError,
    mutate: setChatRoom,
    isLoading: loadingRoom,
  } = useSWR(
    selectedChatRoomId ? `/getChatRoom/${selectedChatRoomId}` : null,
    () => getChatRoom(selectedChatRoomId!)
  );

  const {
    data: bot,
    error: botError,
    mutate: setChatBot,
    isLoading: loadingBot,
  } = useSWR(
    chatRoom?.Customer?.chatbotId &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      chatRoom.Customer.chatbotId
    )
      ? `/api/bot/${chatRoom.Customer.chatbotId}`
      : null,
    () => getBot(chatRoom?.Customer?.chatbotId!)
  );

  const { mutate: getAll } = useSWR(
    `/api/getCustomers/${user?.id}`,
    user ? async () => await getUserCustomers(user?.id) : null
  );

  // const userDetails = {
  //   name: chatRoom?.Customer?.name!,
  //   email: chatRoom?.Customer?.email,
  // };

  const handleDeleteChat = async () => {
    setOpenModel(false);
    const id = selectedChatRoomId;

    setSelectedChatRoomId(null);
    setChatId("");

    startDeleting(async () => {
      const del = deleteChatRoomById(id!);
      toast.promise(del, {
        success: "Chatroom deleted.",
        loading: "Deleting chatroom...",
        error: "an err has occur while trying to delete chatroom.",
      });

      const fetch = await del;
      if (fetch?.completed) {
        await getAll(getUserCustomers(user?.id!));
      }
    });
  };

  const hasMessages = chatRoom?.message && chatRoom.message.length > 0;

  const lastAIMessage = chatRoom?.message
    ?.filter((msg: any) => msg.role === "ai")
    ?.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  let isTimeExceeded;

  if (lastAIMessage) {
    const lastMessageTime = new Date(lastAIMessage.createdAt).getTime();
    const currentTime = new Date().getTime();

    const timeDifferenceInMinutes =
      (currentTime - lastMessageTime) / (1000 * 60);

    isTimeExceeded = timeDifferenceInMinutes > 30;
  }

  useEffect(() => {
    if (!selectedChatRoomId) return;
    setChatBot();
    mutate(getChatMessages(selectedChatRoomId));
    setChatRoom(getChatRoom(selectedChatRoomId));
  }, [selectedChatRoomId]);

  useEffect(() => {
    if (isTimeExceeded && chatRoom?.id) {
      updateChatRoomMode(chatRoom.id);
    }
  }, [isTimeExceeded, chatRoom?.id]);

  useEffect(() => {
    if (!chatRoom?.live || !selectedChatRoomId) return;

    const handleNewMessage = async (data: any) => {
      // Prevent duplicate messages
      if (chatMessages?.some((message: any) => message.id === data.id)) return;

      // Always fetch fresh messages to ensure consistency
      await mutate(getChatMessages(selectedChatRoomId));
      const updatedMessages = await getChatMessages(selectedChatRoomId);

      // Extract the last message (newest) from the updated list
      const lastMessage = updatedMessages?.[updatedMessages.length - 1];
      if (!lastMessage) return;
      await fetch("/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          title: `New message from ${bot?.name}`,
          message: lastMessage?.message,
          link: `${BASE_URL}/chatbot/${bot?.id}`,
        }),
      });
    };

    socket.emit("join-room", selectedChatRoomId);
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
      socket.emit("leave-room", selectedChatRoomId);
    };
  }, [selectedChatRoomId, chatRoom?.live, chatMessages, mutate]);

  if (loadingBot || loadingRoom) {
    return (
      <div className='flex justify-center w-full h-full items-center'>
        <div>
          <Image
            src={logo}
            alt='logo'
            height={50}
            width={50}
            className='animate-spin rounded-full'
          />
        </div>
      </div>
    );
  }
  if (bot && chatRoom) {
    return (
      <div className=''>
        <Dialog open={openModel} onOpenChange={(open) => setOpenModel(open)}>
          <DialogContent className='sm:max-w-md bg-white  dark:bg-gray-900'>
            <DialogHeader className='text-[#E1B177]'>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure you want to
                permanently delete this chat?
              </DialogDescription>
            </DialogHeader>
            <div className='flex items-center space-x-2'>
              <Button
                // className=' w-full text-gray-500 bg-gray-100 hover:bg-black hover:text-white  '
                className=' w-full text-gray-500 bg-gray-100 dark:bg-transparent hover:bg-black hover:text-white  '
                onClick={() => setOpenModel(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteChat()}
                // variant='destructive'
                className='px-3 w-full bg-red-500 hover:bg-red-300 '
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className='border rounded-md w-full bg-white flex flex-col md:max-h-screen h-full relative dark:bg-gray-900'>
          <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />

          <ScrollArea className='h-[calc(100vh-400px)] p-0 '>
            {hasMessages ? (
              <ChatbotMessages
                chatId={chatRoom?.id!}
                chatbot={bot as ChatBot}
                messages={chatMessages as ChatMessage[]}
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                No messages yet.
              </div>
            )}
          </ScrollArea>
          <div className=' bg-white w-full dark:bg-gray-900 dark:text-gray-400 '>
            {!chatRoom?.live ? (
              <div className='p-5 text-center'>
                <Separator className='mb-5' />
                <h5>
                  Customer might not be active you can reach your customer via
                  email
                </h5>
                <div className=''>
                  {chatRoom?.Customer?.phone ? (
                    <div className='grid grid-cols-2'>
                      <div className='font-bold p-2 col-span-1'>
                        Phone Number:
                      </div>
                      <div className=' p-2'>{chatRoom?.Customer?.phone}</div>
                    </div>
                  ) : (
                    <div className='grid grid-cols-2'>
                      <div className='font-bold p-2 col-span-1'>
                        Email Address:
                      </div>
                      <div className=' p-2'>{chatRoom?.Customer?.email}</div>
                    </div>
                  )}

                  <div className='grid grid-cols-2'>
                    <div className='font-bold p-2 col-span-1'>Location:</div>
                    <div className='p-2'>
                      {chatRoom?.Customer?.city}
                      {", "}
                      {chatRoom?.Customer?.country}
                    </div>
                  </div>
                  <Button
                    disabled={isDeleting}
                    onClick={() => setOpenModel(true)}
                    className='w-full bg-gray-200/50 dark:bg-gray-950 dark:text-gray-400 text-black hover:bg-[#E1B177] hover:text-white dark:hover:bg-[#E1B177] dark:hover:text-gray-100'
                  >
                    Delete Chat
                  </Button>
                </div>
              </div>
            ) : (
              <ChatbotInput
                chatRoomId={chatRoom?.id!}
                chatbot={bot as ChatBot}
                type='ai'
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex items-center justify-center '>
      <p className='text-muted-foreground '>
        Select a chat to view the message.
      </p>
    </div>
  );
}

export default ChatInterface;
