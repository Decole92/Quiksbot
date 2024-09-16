import React, { useTransition } from "react";
import { Button } from "../ui/button";
import type {
  ChatBot,
  ChatMessage,
  ChatRoom,
  FirstQuestion,
} from "@prisma/client";
import { getChatMessages, getChatRoom } from "@/actions/chat";

import { useGlobalStore } from "@/store/globalStore";
import { sendMessage } from "@/actions/chat/sendMessage";
import useSWR from "swr";

type Props = {
  firstQuestion: FirstQuestion[];
  userDetails: { name: string; email: string };
  chatbot: ChatBot;
  chatId: string;
  // chatRoom: ChatRoom;
  // setChatRoom: (chatRoom: ChatRoom) => void;
  // mutate: (data?: any, options?: any) => void; // mutate from SWR can take arguments
};

function SuggestItems({
  firstQuestion,
  userDetails,
  chatbot,
  chatId,
}: // setChatRoom,
// chatRoom,
// mutate,
Props) {
  const [isLoading, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useGlobalStore((state) => [
    state.isOpen,
    state.setIsOpen,
  ]);
  const { name, email } = userDetails;

  const { data: chatMessages, mutate } = useSWR("/getMessages", async () =>
    chatId !== null ? await getChatMessages(chatId) : null
  );

  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    "/getChatRoom",
    async () => (chatId !== null ? await getChatRoom(chatId) : null)
  );

  const handleFirstQuestion = async (question: string) => {
    if (
      (!name || !email) &&
      chatbot?.getDetails
      // hasActiveMembership !== "STANDARD"
    ) {
      setIsOpen(true);
      return;
    }
    const passedMessage = question;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: passedMessage,
      // @ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatId,
      role: "user",
      seen: true,
    };

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      message: "Thinking...",
      // @ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatId,
      role: "ai",
      seen: true,
    };

    setChatRoom(getChatRoom(chatId));

    if (!chatRoom?.live) {
      mutate(getChatMessages(chatId), {
        optimisticData: [
          ...(chatMessages as any[]),
          userMessage,
          loadingMessage,
        ],
        rollbackOnError: true,
        populateCache: false,
        revalidate: false,
      });
    } else {
      mutate(getChatMessages(chatId), {
        optimisticData: [...(chatMessages as ChatMessage[]), userMessage],
        rollbackOnError: true,
        populateCache: false,
        revalidate: false,
      });
    }

    startTransition(async () => {
      try {
        const result = await sendMessage(
          passedMessage,
          chatId,
          chatbot,
          "user"
        );
        console.log("Message sent:", result);

        mutate(getChatMessages(chatId), {
          optimisticData: (messages: any) =>
            messages!.map((msg: ChatMessage) =>
              msg?.id === loadingMessage?.id
                ? { ...msg, message: result?.message!, id: result?.id! }
                : msg
            ),
          populateCache: true,
          revalidate: false,
        });
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
  };
  return (
    // <div className='w-full p-5'>
    //   <ul className='flex flex-nowrap gap-3 w-full overflow-x-auto hide-scrollbar'>
    //     {firstQuestion?.map((question) => (
    //       <li key={question?.id} className='flex-shrink-0'>
    //         <Button
    //           disabled={isLoading || !chatRoom || !chatbot}
    //           onClick={() => handleFirstQuestion(question?.question)}
    //           variant={"ghost"}
    //           className='rounded-full px-4 py-2 whitespace-nowrap hover:bg-muted border'
    //         >
    //           {question.question}
    //         </Button>
    //       </li>
    //     ))}
    //   </ul>
    // </div>
    <div className='p-2 md:p-3 lg:p-4 w-full'>
      <ul className='flex flex-nowrap gap-1 md:gap-3 w-full overflow-x-auto hide-scrollbar'>
        {firstQuestion?.map((question) => (
          <li key={question?.id} className='flex-shrink-0'>
            <Button
              disabled={isLoading || !chatRoom || !chatbot}
              onClick={() => handleFirstQuestion(question?.question)}
              variant='ghost'
              className='rounded-full text-xs md:text-sm lg:text-base px-3 py-1 md:px-4 md:py-2 lg:px-5 lg:py-3 whitespace-nowrap hover:bg-muted border text-gray-700 dark:text-gray-300'
            >
              {question.question}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SuggestItems;
