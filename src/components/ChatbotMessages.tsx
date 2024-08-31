import React, { useEffect, useRef } from "react";
import Avatar from "./Avatar";
import { UserCircle } from "lucide-react";
import ReactMarkDown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import botIcon from "@/../../public/golden.png";
// [#b48143]

const ChatbotMessages = ({
  chatbot,
  messages,
}: {
  chatbot: ChatBot;
  messages: ChatMessage[];
}) => {
  console.log("chatbgcolor", chatbot?.userMessageBgColor);
  const refDiv = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    refDiv.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className='flex flex-col py-2 overflow-y-auto px-5 space-y-5  '>
      {messages?.map((message: ChatMessage) => {
        const isSender = message?.role !== "user";

        return (
          <div
            key={message?.id!}
            className={`chat ${
              isSender ? "chat-start" : "chat-end"
            } relative py-5`}
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
                    src={chatbot?.botIcon}
                    alt={chatbot?.botIcon}
                    width='100'
                    height='100'
                    className='rounded-full p-2 h-12 w-12'
                  />
                ) : (
                  <Image
                    src={botIcon}
                    alt='chatbotIcon'
                    height={100}
                    width={100}
                    className='bg-gray-100 rounded-full p-2 h-12 w-12 '
                  />
                )
              ) : (
                <UserCircle
                  className={`text-[${chatbot?.userMessageBgColor}] `}
                />
              )}
            </div>

            <p
              className={`chat-bubble  ${
                chatbot && isSender
                  ? `chat-bubble-primary  bg-gray-200 text-gray-700 `
                  : `chat-bubble-secondary text-white `
              }`}
              style={{
                backgroundColor: `${
                  chatbot && !isSender ? chatbot?.userMessageBgColor : undefined
                }`,
              }}
            >
              <ReactMarkDown
                remarkPlugins={[remarkGfm]}
                className={`break-words`}
                components={{
                  ul: ({ node, ...props }) => (
                    <ul
                      {...props}
                      className='list-disc  list-inside ml-5 mb-5'
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
                      className='table-auto w-full border-separate border-2  rounded-sm border-spacing-4 border-white mb-5'
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
                      } ${isSender ? "text-gray-700" : "text-white"}`}
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
                {message?.message}
              </ReactMarkDown>
            </p>
          </div>
        );
      })}
      <div ref={refDiv} />
    </div>
  );
};

export default ChatbotMessages;
