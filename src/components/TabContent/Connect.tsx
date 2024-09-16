import React, { useState } from "react";
import { Input } from "../ui/input";
import { BASE_URL } from "../../../constant/url";
import { Button } from "../ui/button";
import { CheckCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import type { ChatBot } from "@prisma/client";

function Connect({ chatbot }: { chatbot: ChatBot }) {
  const InputValue = `${BASE_URL}/chatbot/${chatbot?.id}`;
  const [toggle, setToggle] = useState(false);
  const [toggle2, setToggle2] = useState(false);

  let snippet = `<script
  src="${BASE_URL}/api/chatbotWidget"
  data-name='quiksbot'
  data-address="${BASE_URL}"
  data-id='${chatbot?.id}'
  data-widget-size='normal'
  data-widget-button-size='normal'
  defer
></script>`;
  return (
    <div className='border border-gray-300 rounded-md p-5 h-full max-w-5xl mx-auto bg-white md:p-7 lg:p-7 dark:bg-gray-900'>
      <h3 className='text-2xl pb-4 font-thin'>Connect Bot</h3>
      <div className='grid grid-cols-5  h-full  rounded-lg gap-5  '>
        <div className='col-span-5 lg:col-span-5 '>
          <div>
            <h3 className='font-bold text-lg'>{`Link to ${chatbot?.name}`}</h3>
            <h5 className='pb-2 '>
              Share this link with your customers to start conversations with
              your chatbot
            </h5>
            <div className='bg-gray-200/50 p-3 rounded-md  flex items-center  w-full gap-2 dark:bg-gray-950'>
              <Input
                disabled
                value={InputValue}
                className='flex-1 dark:bg-gray-900'
              />
              <Button
                className='bg-black/50 h-full dark:bg-gray-900 dark:text-gray-400 transition-all duration-75 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:hover:text-gray-200'
                onClick={() => {
                  navigator.clipboard.writeText(InputValue);
                  toast.success("Copied to clipboard");
                  setToggle(!toggle);
                }}
              >
                {toggle ? <CheckCheck /> : <Copy />}
              </Button>
            </div>
          </div>
        </div>

        <div className='col-span-5 lg:col-span-5 '>
          <h3 className='font-bold text-lg'>{` ${chatbot?.name} Snippet Code  `}</h3>
          <h5 className='pb-2 '>
            Copy and paste this code snippet into the header tag of your website
          </h5>
          <div className='bg-gray-200/50 px-10 rounded-lg inline-block relative w-full dark:bg-gray-950'>
            <Button
              variant={"ghost"}
              className='absolute top-2 right-2  dark:bg-gray-900 dark:text-gray-400 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:hover:text-gray-200 '
              onClick={() => {
                navigator.clipboard.writeText(snippet);
                toast.success("Copied to clipboard");
                setToggle2(!toggle2);
              }}
            >
              {toggle2 ? <CheckCheck /> : <Copy />}
            </Button>
            <div className='w-full overflow-x-auto'>
              <pre>
                <code className='text-gray-500'>{snippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connect;
