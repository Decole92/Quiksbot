"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Separator } from "./ui/separator";
import { useGlobalStore } from "@/store/globalStore";
import ChatbotMessages from "./ChatbotMessages";
import ChatbotHeader from "./ChatbotComponent/ChatbotHeader";
import ChatbotInput from "./ChatbotComponent/chatbotInput";
import {
  getAllActiveChats,
  getUserCustomers,
  updateChatRoomMode,
  viewMessage,
} from "@/actions/customer";
import { getBot } from "@/actions/bot";
import useSWR from "swr";
import logo from "../../public/golden.png";
import Image from "next/image";
import { clientPusher } from "@/lib/pusher";
import {
  deleteChatRoomById,
  getChatMessages,
  getChatRoom,
} from "@/actions/chat";
import { ScrollArea } from "./ui/scroll-area";
import type { ChatBot, ChatMessage } from "@prisma/client";
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

function ChatInterface() {
  const [openModel, setOpenModel] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const { user } = useUser();
  const [selectedChatRoomId, setSelectedChatRoomId] = useGlobalStore(
    (state) => [state.selectedChatRoomId, state.setSelectedChatRoomId]
  );
  const { data: chatMessages, mutate } = useSWR("/getMessages", async () =>
    selectedChatRoomId !== null
      ? await getChatMessages(selectedChatRoomId)
      : null
  );
  const {
    data: chatRoom,
    error: chatRoomError,
    mutate: setChatRoom,
    isLoading: loadingRoom,
  } = useSWR(
    selectedChatRoomId ? `/api/chatRoom/${selectedChatRoomId}` : null,
    () => getChatRoom(selectedChatRoomId!)
  );

  const {
    data: bot,
    error: botError,
    mutate: setChatBot,
    isLoading: loadingBot,
  } = useSWR(
    chatRoom?.Customer?.chatbotId
      ? `/api/bot/${chatRoom?.Customer?.chatbotId}`
      : null,
    () => getBot(chatRoom?.Customer?.chatbotId!)
  );

  const { mutate: getEvery } = useSWR(
    `/api/getActiveChats/${user?.id}`,
    user ? async () => await getAllActiveChats(user?.id) : null
  );

  const { mutate: getAll } = useSWR(
    `/api/getCustomers/${user?.id}`,
    user ? async () => await getUserCustomers(user?.id) : null
  );

  const userDetails = {
    name: chatRoom?.Customer?.name!,
    email: chatRoom?.Customer?.email,
  };

  const handleDeleteChat = async () => {
    startDeleting(async () => {
      const del = deleteChatRoomById(selectedChatRoomId!);
      setOpenModel(false);
      toast.promise(del, {
        success: "Chatroom deleted.",
        loading: "Deleting chatroom...",
        error: "an err has occur while trying to delete chatroom.",
      });

      const fetch = await del;
      if (fetch?.completed) {
        await getEvery(getAllActiveChats(user?.id!));
        await getAll(getUserCustomers(user?.id!));
      }
    });
    setSelectedChatRoomId("");
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
    setChatBot();
    mutate(getChatMessages(selectedChatRoomId!));
    setChatRoom(getChatRoom(selectedChatRoomId!));
  }, [selectedChatRoomId, bot]);

  useEffect(() => {
    if (isTimeExceeded!) {
      const updateChatRoom = async () => {
        if (chatRoom && chatRoom.id) {
          await updateChatRoomMode(chatRoom.id);
        }
      };
      updateChatRoom();
    }
  }, [chatMessages, chatRoom]);

  useEffect(() => {
    if (!chatRoom?.live) return;
    const channel = clientPusher.subscribe("message");

    channel.bind("realtime", async (data: ChatMessage) => {
      if (chatMessages?.some((message: any) => message.id === data.id)) return;

      if (!chatRoom?.message) {
        await mutate(getChatMessages(selectedChatRoomId!));
      } else {
        mutate(getChatMessages(selectedChatRoomId!), {
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
  }, [chatMessages, mutate, selectedChatRoomId, clientPusher, chatRoom?.live]);

  if (loadingBot || loadingRoom) {
    return (
      <div className='flex justify-center w-full h-full items-center'>
        <div>
          <Image
            src={logo}
            alt='logo'
            height={100}
            width={100}
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
        <div className='border rounded-md w-full bg-white flex flex-col max-h-screen  relative dark:bg-gray-900'>
          <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />

          <ScrollArea className='h-[calc(100vh-400px)] p-5 '>
            {hasMessages ? (
              <ChatbotMessages
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
              <div className='p-5 text-center m-5 '>
                <Separator className='mb-5' />
                <h5>
                  {" "}
                  Customer might not be active you can reach your customer via
                  email
                </h5>
                <div className=''>
                  <div className='grid grid-cols-2'>
                    <div className='font-bold p-2 col-span-1'>
                      Email Address:
                    </div>
                    <div className=' p-2'>{chatRoom?.Customer?.email}</div>
                  </div>
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
                userDetails={userDetails as any}
                chatRoomId={chatRoom?.id!}
                chatbot={bot as ChatBot}
                type='assistant'
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex items-center justify-center'>
      <p className='text-muted-foreground'>
        Select a chat to view the message.
      </p>
    </div>
  );
}

export default ChatInterface;
