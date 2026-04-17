import React, { useTransition } from "react";
import type { ChatMessage } from "@/types";
import { Button } from "../ui/button";
import { getChatMessages, getChatRoom } from "@/actions/chat";

import { useGlobalStore } from "@/store/globalStore";
import { sendMessage } from "@/actions/chat/sendMessage";
import useSWR from "swr";

type Props = {
  firstQuestion: any[];

  chatbot: any;
  chatId: string;
  messages?: any[];
  setMessages?: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

function SuggestItems({
  firstQuestion,

  chatbot,
  chatId,

  setMessages,
}: Props) {
  const [isLoading, startTransition] = useTransition();
  const setChatId = useGlobalStore((state) => state.setChatId);

  const { data: chatMessages, mutate } = useSWR(
    chatId ? `/getMessages/${chatId}` : null,
    async () => await getChatMessages(chatId)
  );

  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    chatId ? `/getChatRoom/${chatId}` : null,
    async () => await getChatRoom(chatId)
  );

  const handleFirstQuestion = async (question: string) => {
    const passedMessage = question;
    const isFirstMessage = !chatId;

    const firstMessage: any = {
      id: (Date.now() - 1).toString(),
      message: chatbot?.greetings || "Hello, How can we help you today?",
      //@ts-ignore
      createdAt: new Date(Date.now() - 1000).toISOString(),
      chatRoomId: chatId || "tempId",
      role: "ai",
      seen: true,
    };

    const userMessage: any = {
      id: Date.now().toString(),
      message: passedMessage,
      // @ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatId,
      role: "user",
      seen: true,
    };

    const loadingMessage: any = {
      id: (Date.now() + 1).toString(),
      message: "Thinking...",
      // @ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatId,
      role: "ai",
      seen: true,
    };

    if (chatId) setChatRoom(getChatRoom(chatId));

    if (isFirstMessage) {
      if (setMessages) setMessages([firstMessage, userMessage, loadingMessage]);
    } else {
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
    }

    startTransition(async () => {
      try {
        const result = await sendMessage(
          passedMessage,
          chatId,
          chatbot,
          "user",
          undefined,
          isFirstMessage
        );

        if (result?.chatRoomId && isFirstMessage) {
          setChatId(result.chatRoomId);
        }
        if (isFirstMessage) {
          const updatedMessages = [
            { ...firstMessage, chatRoomId: result?.chatRoomId ?? null },
            { ...userMessage, chatRoomId: result?.chatRoomId ?? null },
            {
              ...loadingMessage,
              chatRoomId: result?.chatRoomId ?? null,
              message: result?.message!,
              id: result?.id!,
            },
          ];
          mutate(getChatMessages(result?.chatRoomId!), {
            optimisticData: updatedMessages,
            populateCache: false,
            revalidate: true,
          });
        } else {
          mutate(getChatMessages(chatId), {
            optimisticData: (messages: any) =>
              messages!.map((msg: any) =>
                msg?.id === loadingMessage?.id
                  ? { ...msg, message: result?.message!, id: result?.id! }
                  : msg
              ),
            populateCache: true,
            revalidate: false,
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
  };
  return (
    <>
      {firstQuestion && firstQuestion.length !== 0 && (
        <div className='p-2 md:p-3 lg:p-4 w-full'>
          <ul className='flex flex-nowrap gap-1 md:gap-3 w-full overflow-x-auto hide-scrollbar'>
            {firstQuestion?.map((question) => (
              <li key={question?.id} className='flex-shrink-0'>
                <Button
                  disabled={isLoading || !chatbot}
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
      )}
    </>
  );
}

export default SuggestItems;
