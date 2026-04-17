"use client";
import React, { useEffect, useState, useTransition } from "react";
import type { ChatBot, ChatMessage } from "@/types";
import { Separator } from "../ui/separator";
import { useGlobalStore } from "@/store/globalStore";
import ChatbotMessages from "../ChatbotComponent/ChatbotMessages";
import ChatbotHeader from "../ChatbotComponent/ChatbotHeader";
import ChatbotInput from "../ChatbotComponent/chatbotInput";
import { getUserCustomers, updateChatRoomMode } from "@/actions/customer";
import { getBot } from "@/actions/bot";
import useSWR from "swr";
import logo from "../../../public/circlegolden.png";
import Image from "next/image";

import {
  deleteChatRoomById,
  getChatMessages,
  getChatRoom,
} from "@/actions/chat";
import { ScrollArea } from "../ui/scroll-area";
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
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { socket } from "@/lib/socket";

function ViewMessageClient({
  selectedChatRoomId,
}: {
  selectedChatRoomId: string;
}) {
  const [openModel, setOpenModel] = useState(false);
  const [isDeleting, startDeleting] = useTransition();
  const { user } = useUser();
  const router = useRouter();
  const {
    data: chatMessages,
    mutate,
    error,
  } = useSWR(
    selectedChatRoomId ? `/getMessages/${selectedChatRoomId}` : null,
    async () => await getChatMessages(selectedChatRoomId)
  );

  const {
    data: chatRoom,
    error: chatRoomError,
    mutate: setChatRoom,
    isLoading: loadingRoom,
  } = useSWR(
    selectedChatRoomId ? `/getChatRoom/${selectedChatRoomId}` : null,
    async () => await getChatRoom(selectedChatRoomId)
  );

  // Guard against legacy UUID-format IDs (from old Prisma DB) that fail Convex validation
  const isValidConvexId = (id: string | undefined) =>
    !!id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const {
    data: bot,
    error: botError,
    mutate: setChatBot,
    isLoading: loadingBot,
  } = useSWR(
    chatRoom?.Customer?.chatbotId && isValidConvexId(chatRoom.Customer.chatbotId)
      ? `/api/bot/${chatRoom?.Customer?.chatbotId}`
      : null,
    () => getBot(chatRoom?.Customer?.chatbotId!)
  );

  const { mutate: getAll } = useSWR(
    `/api/getCustomers/${user?.id}`,
    user ? async () => await getUserCustomers(user?.id) : null
  );
  const setChatId = useGlobalStore((state) => state.setChatId);

  const handleDeleteChat = async () => {
    setOpenModel(false);

    startDeleting(async () => {
      const del = deleteChatRoomById(selectedChatRoomId!);

      toast.promise(del, {
        success: "Chatroom deleted.",
        loading: "Deleting chatroom...",
        error: "an err has occur while trying to delete chatroom.",
      });

      const fetch = await del;
      if (fetch?.completed) {
        await getAll(getUserCustomers(user?.id!));
      }
      setChatId("");
      router.push("/chatlogs");
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
    setChatBot();
    mutate(getChatMessages(selectedChatRoomId!));
    setChatRoom(getChatRoom(selectedChatRoomId!));
  }, [selectedChatRoomId]);

  useEffect(() => {
    if (isTimeExceeded && chatRoom?.id) {
      updateChatRoomMode(chatRoom.id);
    }
  }, [isTimeExceeded, chatRoom?.id]);

  useEffect(() => {
    if (!chatRoom?.live || !selectedChatRoomId) return;

    const handleNewMessage = async (data: any) => {
      if (chatMessages?.some((message: any) => message.id === data.id)) return;
      await mutate(getChatMessages(selectedChatRoomId));
    };

    socket.emit("join-room", selectedChatRoomId);
    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
      socket.emit("leave-room", selectedChatRoomId);
    };
  }, [selectedChatRoomId, chatRoom?.live, chatMessages, mutate]);

  if (loadingRoom) {
    return (
      <div className='w-full h-full '>
        <div className='flex items-center justify-center flex-1 h-full'>
          <Image
            src={logo}
            alt='logo'
            width={50}
            height={50}
            className='rounded-full animate-spin'
          />
        </div>
      </div>
    );
  }

  if (chatRoom) {
    return (
      <div className='flex flex-col flex-1'>
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
        <div className='border rounded-md w-full bg-white flex flex-col flex-1 dark:bg-gray-900'>
          {bot && <ChatbotHeader bot={bot as ChatBot} live={chatRoom?.live} />}

          <div className='flex-1 overflow-y-auto'>
            {hasMessages && bot ? (
              <ChatbotMessages
                chatId={chatRoom?.id!}
                chatbot={bot as ChatBot}
                messages={chatMessages as ChatMessage[]}
              />
            ) : hasMessages ? (
              <div className='flex items-center justify-center h-full text-sm text-gray-500'>
                {chatMessages?.length} message(s) in this chat.
              </div>
            ) : (
              <div className='flex items-center justify-center h-full'>
                No messages yet.
              </div>
            )}
          </div>
          <div className='bottom-0 sticky z-10  bg-white w-full dark:bg-gray-900 dark:text-gray-400'>
            {!chatRoom?.live ? (
              <div className='p-5 text-center'>
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
            ) : bot ? (
              <ChatbotInput
                chatRoomId={chatRoom?.id!}
                chatbot={bot as ChatBot}
                type='ai'
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default ViewMessageClient;
