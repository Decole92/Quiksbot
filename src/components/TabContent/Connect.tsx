import React, { useState, useTransition } from "react";
import { Input } from "../ui/input";
import { BASE_URL } from "../../../constant/url";
import { Button } from "../ui/button";
import { CheckCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import type { ChatBot } from "@prisma/client";
import { useUser } from "@clerk/nextjs";
import { blockAddress, getBlocks } from "@/actions/user";
import useSWR from "swr";
import Characteristic from "../Characteristic";
import { redirect, useRouter } from "next/navigation";

function Connect({ chatbot }: { chatbot: ChatBot }) {
  const { user } = useUser();
  const InputValue = `${BASE_URL}/chatbot/${chatbot?.id}`;
  const [toggle, setToggle] = useState(false);
  const [toggle2, setToggle2] = useState(false);
  const [address, setAddress] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  let snippet = `<script
  src="${BASE_URL}/api/chatbotWidget"
  data-name='quiksbot'
  data-address='${BASE_URL}'
  data-id='${chatbot?.id}'
  data-position='${chatbot?.iconPosition}'
  data-widget-size='normal'
  data-widget-button-size='normal'
  defer
></script>`;

  const { data: blockAddresses, mutate } = useSWR(
    chatbot ? `/api/getBlocks/${chatbot?.id}` : null,
    chatbot ? async () => await getBlocks(chatbot?.id) : null
  );

  const handleBlockAddress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id || !chatbot) {
      throw new Error("There's no user or chatbot");
    }
    const value = address;
    setAddress("");
    startTransition(async () => {
      const promise = blockAddress(value, chatbot);
      toast.promise(promise, {
        loading: `whitelistening path ${value} ...`,
        success: `${value} whitelistend`,
        error: "Error occurs while blocking page address",
      });
      await mutate();
    });
  };

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

        <div className='col-span-5 lg:col-span-5 '>
          <div className=''>
            <h3 className='font-bold text-lg'>
              Block iframe from appearing on this pages..
            </h3>
            <h5 className=' pb-2 '>
              This helps in tailoring the user experience and ensuring the
              chatbot is displayed only where it is most useful.
            </h5>

            <div className='bg-gray-200/50 dark:bg-gray-950 p-3 rounded-md space-y-3'>
              <form
                onSubmit={handleBlockAddress}
                className='flex items-center md:flex-row flex-col md:gap-4 lg:gap-4 gap-2'
              >
                <Input
                  minLength={1}
                  value={address}
                  onChange={(e) => setAddress(e?.target?.value)}
                  className='flex-1 dark:bg-gray-900'
                  placeholder='Example: To exclude pricing page /pricing'
                />
                <Button
                  disabled={isPending || !address}
                  type='submit'
                  className='bg-black/70  dark:bg-gray-900 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:text-gray-200  w-full md:w-[100px] lg:w-[100px] '
                >
                  Block
                </Button>
              </form>
              {blockAddresses?.length !== 0 && (
                <ul className='flex flex-wrap-reverse gap-2 md:gap-3'>
                  {blockAddresses?.map((characteristic: any) => (
                    <Characteristic
                      key={characteristic?.id}
                      blockpage={characteristic}
                      type='getAddress'
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* end here */}
      </div>
    </div>
  );
}

export default Connect;
