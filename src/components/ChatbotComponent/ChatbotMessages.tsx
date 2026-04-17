"use client";

import { useEffect, useRef, useState } from "react";
import { Loader, UserCircle } from "lucide-react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import botIcon from "../../../public/circlegolden.png";
import ContactForm from "./ContactForm";
import { usePathname } from "next/navigation";
import AppointmentConfirmation from "../AppointmentCard";
// [#b48143]

const ChatbotMessages = ({
  chatbot,
  messages,
  loading,
  chatId,
}: {
  chatbot: any;
  messages: any[];
  loading?: boolean;
  chatId: string;
}) => {
  const refDiv = useRef<HTMLDivElement | null>(null);
  const path = usePathname();
  const [greetingTime, setGreetingTime] = useState<string>("");
  useEffect(() => {
    setGreetingTime(new Date().toLocaleString());
  }, []);
  useEffect(() => {
    refDiv.current?.scrollIntoView({ behavior: "smooth" });
  }, [refDiv, messages]); // Updated dependency

  return (
    <div className='flex flex-col py-2 overflow-y-auto px-2 md:px-5 lg:px-5 space-y-5'>
      {messages?.length > 0 && loading && (
        <div className='flex flex-col items-center justify-center'>
          <div className='pt-10'>
            <Loader className='h-7 w-7 animate-spin' />
          </div>
        </div>
      )}

      {!messages?.length && chatbot?.greetings && (
        <div className='chat chat-start relative py-5 dark:text-gray-200'>
          <p className='absolute -bottom-2 text-xs text-gray-300'>
            {greetingTime ? `Sent ${greetingTime}` : ""}
          </p>
          <div className='chat-image avatar w-12 h-12'>
            {chatbot?.botIcon ? (
              <Image
                src={chatbot?.botIcon || "/placeholder.svg"}
                alt={chatbot?.botIcon}
                width='100'
                height='100'
                className='rounded-full p-2 h-12 w-12'
              />
            ) : (
              <Image
                src={botIcon || "/placeholder.svg"}
                alt='chatbotIcon'
                height={100}
                width={100}
                className='bg-gray-100 dark:bg-gray-950 rounded-full p-2 h-12 w-12'
              />
            )}
          </div>
          <div className='chat-bubble chat-bubble-primary bg-gray-200 text-gray-700 dark:bg-gray-950 dark:[&]:text-gray-400'>
            <ReactMarkDown
              remarkPlugins={[remarkGfm]}
              className='break-words'
              components={{
                p: ({ node, ...props }) => (
                  <p
                    {...props}
                    className='whitespace-break-spaces mb-5 dark:text-gray-100 text-gray-700'
                  />
                ),
                ul: ({ node, ...props }) => (
                  <ul {...props} className='list-disc list-inside ml-5 mb-5' />
                ),
                ol: ({ node, ...props }) => (
                  <ol
                    {...props}
                    className='list-decimal list-inside ml-5 mb-5'
                  />
                ),
                h1: ({ node, ...props }) => (
                  <h1 {...props} className='text-2xl font-bold mb-5' />
                ),
                h2: ({ node, ...props }) => (
                  <h2 {...props} className='text-xl font-bold mb-5' />
                ),
                h3: ({ node, ...props }) => (
                  <h3 {...props} className='text-lg font-bold mb-5' />
                ),
                table: ({ node, ...props }) => (
                  <table
                    {...props}
                    className='table-auto w-full border-separate border-2 rounded-sm border-spacing-4 border-white mb-5'
                  />
                ),
                th: ({ node, ...props }) => (
                  <th {...props} className='text-left underline' />
                ),
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    target='_blank'
                    className='font-bold underline hover:text-blue-400'
                    rel='noopener noreferrer'
                  />
                ),
              }}
            >
              {chatbot.greetings}
            </ReactMarkDown>
          </div>
        </div>
      )}
      {messages?.map((message: any) => {
        const isSender = message?.role !== "user";
        const jsonMatch = message?.message?.match(/```json\n([\s\S]*?)\n```/);
        const jsonData = jsonMatch ? JSON.parse(jsonMatch[1]) : null;
        const messageText = jsonMatch
          ? message.message.replace(jsonMatch[0], "").trim()
          : message.message;
        return (
          <div
            key={message?.id!}
            className={`chat ${
              isSender ? "chat-start" : "chat-end"
            } relative py-5 dark:text-gray-200`}
          >
            <p className='absolute -bottom-2 text-xs text-gray-300'>
              Sent {new Date(message?.createdAt).toLocaleString()}
            </p>

            <div
              className={`chat-image avatar w-12 h-12  ${
                !isSender && "-mr-4 "
              } `}
            >
              {isSender ? (
                chatbot?.botIcon ? (
                  <Image
                    src={chatbot?.botIcon || "/placeholder.svg"}
                    alt={chatbot?.botIcon}
                    width='100'
                    height='100'
                    className='rounded-full p-2 h-12 w-12'
                  />
                ) : (
                  <Image
                    src={botIcon || "/placeholder.svg"}
                    alt='chatbotIcon'
                    height={100}
                    width={100}
                    className='bg-gray-100 dark:bg-gray-950 rounded-full p-2 h-12 w-12 '
                  />
                )
              ) : (
                <UserCircle
                  className={`${
                    chatbot?.userMessageBgColor ? "" : "text-[#E1B177]"
                  }`}
                  style={
                    chatbot?.userMessageBgColor
                      ? { color: chatbot?.userMessageBgColor.trim() }
                      : { color: "#e1b177" }
                  }
                />
              )}
            </div>

            <div
              className={`chat-bubble ${
                chatbot && isSender
                  ? `chat-bubble-primary bg-gray-200 text-gray-700 dark:bg-gray-950 dark:[&]:text-gray-400`
                  : `chat-bubble-secondary text-white`
              }`}
              style={{
                backgroundColor:
                  !isSender && chatbot?.userMessageBgColor
                    ? chatbot.userMessageBgColor
                    : isSender
                    ? undefined
                    : "#E1B177",
              }}
            >
              {message?.type === "contact_form" &&
              !path.includes("/chatlog") ? (
                <div className='py-2'>
                  <ContactForm id={chatId} />
                </div>
              ) : message?.imageUrl && message?.imageUrl !== null ? (
                <div className='flex flex-col space-y-3'>
                  {message.message && (
                    <ReactMarkDown
                      remarkPlugins={[remarkGfm]}
                      className='break-words'
                      components={{
                        p: ({ node, ...props }) => (
                          <p
                            {...props}
                            className={`whitespace-break-spaces mb-2 ${
                              isSender ? "text-gray-700" : "text-white"
                            }`}
                          />
                        ),
                      }}
                    >
                      {message.message}
                    </ReactMarkDown>
                  )}
                  <div className='relative w-full rounded-lg overflow-hidden'>
                    <Image
                      src={message.imageUrl || "/placeholder.svg"}
                      alt='Message image'
                      width={500}
                      height={300}
                      className='object-contain max-h-[300px] w-auto mx-auto rounded-lg'
                    />
                  </div>
                </div>
              ) : (
                <ReactMarkDown
                  remarkPlugins={[remarkGfm]}
                  className={`break-words`}
                  components={{
                    ul: ({ node, ...props }) => (
                      <ul
                        {...props}
                        className='list-disc list-inside ml-5 mb-5'
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        {...props}
                        className='list-decimal list-inside ml-5 mb-5'
                      />
                    ),
                    h1: ({ node, ...props }) => (
                      <h1 {...props} className='text-2xl font-bold mb-5' />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 {...props} className='text-xl font-bold mb-5' />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 {...props} className='text-lg font-bold mb-5' />
                    ),
                    table: ({ node, ...props }) => (
                      <table
                        {...props}
                        className='table-auto w-full border-separate border-2 rounded-sm border-spacing-4 border-white mb-5'
                      />
                    ),
                    th: ({ node, ...props }) => (
                      <th {...props} className='text-left underline' />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        {...props}
                        className={`whitespace-break-spaces mb-5 ${
                          message.message === "Thinking..." && "animate-pulse"
                        } ${
                          isSender
                            ? "dark:text-gray-100 text-gray-700"
                            : "text-white"
                        }`}
                      />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        target='_blank'
                        className='font-bold underline hover: text-blue-400'
                        rel='noopener noreferrer'
                      />
                    ),
                  }}
                >
                  {/* {message?.message} */}
                  {messageText}
                </ReactMarkDown>
              )}
            </div>
            {jsonData && <AppointmentConfirmation data={jsonData} />}
          </div>
        );
      })}
      <div ref={refDiv} />
    </div>
  );
};

export default ChatbotMessages;
