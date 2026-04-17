"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { ChatMessage } from "@/types";
import { Button } from "../ui/button";
import { MicIcon, ImagePlusIcon, Send, XIcon } from "lucide-react";
import { useGlobalStore } from "@/store/globalStore";
import useSWR from "swr";
import { getChatMessages, getChatRoom } from "@/actions/chat";
import { sendMessage } from "@/actions/chat/sendMessage";
import Image from "next/image";
import logo from "../../../public/circlegolden.png";
import Link from "next/link";
import ContactForm from "./ContactForm";
import { socket } from "@/lib/socket";
import { Card } from "../ui/card";

interface ChatbotInputProps {
  chatRoomId: string | null;
  chatbot: any;
  type: "user" | "ai";
  isPageLoading?: boolean;

  setMessages?: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatbotInput: React.FC<ChatbotInputProps> = ({
  chatRoomId,
  chatbot,
  type,
  isPageLoading,

  setMessages,
}) => {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [isOpen, setIsOpen, setChatId] = useGlobalStore((state) => [
    state.isOpen,
    state.setIsOpen,
    state.setChatId,
  ]);

  const { data: chatMessages, mutate } = useSWR(
    chatRoomId ? `/getMessages/${chatRoomId}` : null,
    async () => await getChatMessages(chatRoomId!)
  );

  const { data: chatRoom, mutate: setChatRoom } = useSWR(
    chatRoomId ? `/getChatRoom/${chatRoomId}` : null,
    async () => (chatRoomId ? await getChatRoom(chatRoomId) : null)
  );

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.preventDefault();
    if (file) {
      if (file.type === "image/png" || file.type === "image/jpeg") {
        setImage(file);
        setPreview(URL.createObjectURL(file));
      } else {
        event.target.value = "";
      }
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const photo = image;

    setImage(null);
    setPreview(null);
    const passedMessage = message;
    setMessage("");

    const isFirstMessage = !chatRoomId;

    const firstMessage: any = {
      id: (Date.now() - 1).toString(),
      message: chatbot?.greetings || "Hello, How can we help you today?",
      //@ts-ignore
      createdAt: new Date(Date.now() - 1000).toISOString(),
      chatRoomId: chatRoomId || "tempId",
      role: "ai",
      seen: true,
    };

    const userMessage: any = {
      id: Date.now().toString(),
      message: passedMessage,
      imageUrl: preview ? preview : null,
      // @ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatRoomId || "tempId",
      role: type === "ai" ? "ai" : "user",
      seen: true,
    };

    const loadingMessage: any = {
      id: (Date.now() + 1).toString(),
      message: "Thinking...",
      // @ts-ignore
      createdAt: new Date().toISOString(),
      chatRoomId: chatRoomId || "tempId",
      role: "ai",
      seen: true,
    };

    if (isFirstMessage) {
      if (setMessages) setMessages([firstMessage, userMessage, loadingMessage]);
    } else {
      if (!chatRoom?.live) {
        mutate(getChatMessages(chatRoomId), {
          optimisticData: [
            ...(chatMessages ? chatMessages : []),
            userMessage,
            loadingMessage,
          ],
          rollbackOnError: true,
          populateCache: false,
          revalidate: false,
        });
      } else {
        mutate(getChatMessages(chatRoomId), {
          optimisticData: [...(chatMessages ? chatMessages : []), userMessage],
          rollbackOnError: true,
          populateCache: false,
          revalidate: false,
        });
      }
    }

    startTransition(async () => {
      let formData;
      if (photo) {
        formData = new FormData();
        formData.append("file", photo);
      }

      try {
        const result = await sendMessage(
          passedMessage,
          chatRoomId!,
          chatbot,
          type === "ai" ? "ai" : "user",
          photo ? formData : undefined,
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
          mutate(getChatMessages(chatRoomId), {
            optimisticData: (messages: any) =>
              messages!.map((msg: any) =>
                msg?.id === loadingMessage?.id
                  ? { ...msg, message: result?.message!, id: result?.id! }
                  : msg?.id === userMessage?.id && chatRoom?.live
                  ? { ...msg, message: result?.message!, id: result?.id! }
                  : msg.type === "contact_form"
                  ? { ...msg, component: <ContactForm id={chatRoomId} /> }
                  : msg
              ),
            populateCache: false,
            revalidate: true,
          });
        }

        setChatRoom(getChatRoom(chatRoomId!));

        if (chatRoom?.live) {
          socket.emit("message", {
            id: result?.id,
            chatRoomId: result?.chatRoomId || chatRoomId,
            message: result?.message,
            role: type === "ai" ? "ai" : "user",
            createdAt: new Date(),
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
  };

  return (
    <div className=''>
      {preview && (
        <div className='flex justify-end mb-4 mr-4'>
          <div className='relative w-32 h-32'>
            <Card className='w-full h-full overflow-hidden'>
              <Image
                src={preview || "/placeholder.svg"}
                alt='Preview'
                layout='fill'
                objectFit='cover'
                className='rounded-lg'
              />
            </Card>
            <Button
              variant='ghost'
              size='icon'
              className='absolute top-1 right-1 bg-black/50 hover:bg-black/70 rounded-full'
              onClick={() => {
                setPreview(null);
                setImage(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              <XIcon className='h-4 w-4 text-white' />
            </Button>
          </div>
        </div>
      )}
      <hr />
      <form
        className='p-5 flex items-center gap-3'
        onSubmit={handleAskQuestion}
      >
        <input
          ref={fileInputRef}
          type='file'
          hidden
          onChange={handleFileChange}
        />

        <Button
          type='button'
          disabled={!chatbot?.chatModel?.includes("vision")}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          variant='outline'
          className={`${
            chatbot?.chatModel?.includes("vision")
              ? "cursor-pointer"
              : "cursor-not-allowed"
          } rounded-full p-2 bg-[#e1b177]/20 hover:bg-[#e1b177] border-transparent group`}
        >
          <ImagePlusIcon className='text-black group-hover:text-white dark:text-gray-400' />
        </Button>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minLength={2}
          className='py-3 px-5 bg-white dark:bg-gray-950 w-full rounded-full border border-gray-300 dark:border-gray-700 dark:text-gray-400 focus:outline-none'
          placeholder='Ask your question?'
        />
        <Button
          disabled={isPending || !message}
          type='submit'
          variant='ghost'
          className={`p-2 dark:bg-gray-950 bg-gray-200 shadow-lg shadow-gray-300 dark:shadow-gray-700 rounded-full md:py-3 group dark:text-gray-400 dark:hover:bg-[${chatbot?.userMessageBgColor}] hover:bg-[${chatbot?.userMessageBgColor}]`}
        >
          <Send className='text-black group-hover:text-white dark:text-gray-400' />
        </Button>
      </form>
      {chatbot?.watermark ? (
        <Link
          target='_blank'
          href='https://quiksbot.com'
          className='text-xs font-light dark:font-thin flex items-center justify-center -mt-5 p-4 tracking-widest w-full text-gray-400'
        >
          Get your own ai chatbot |
          <span className='flex items-center gap-2 pl-1 font-semibold'>
            Quiksbot
            <Image
              src={logo}
              alt='watermark'
              width={46}
              height={46}
              className='h-4 w-4'
            />
          </span>
        </Link>
      ) : null}
    </div>
  );
};

export default ChatbotInput;
