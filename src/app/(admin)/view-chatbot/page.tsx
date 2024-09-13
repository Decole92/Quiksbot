import { getChatBotByUser } from "@/actions/bot";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { characteristic } from "../../../../typing";
import { PdfFile } from "@prisma/client";

export const dynamic = "force-dynamic";

async function ViewChatbot() {
  const { userId } = await auth();
  if (!userId) return;

  const chatbots: any = userId && (await getChatBotByUser(userId));
  const sortedBots =
    chatbots &&
    [...chatbots]?.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div className='mt-14  w-full md:max-w-5xl md:mx-auto lg:max-w-5xl lg:mx-auto p-5'>
      <div className='flex justify-between items-center mb-5 md:mt-5 p-5  shadow-md shadow-white w-full dark:shadow-gray-900'>
        <h1 className='text-xl lg:text-3xl font-thin text-[#E1B177]'>
          Chatbots List
        </h1>
        <Button className='flex ml-auto right-1 bg-gray-200/50 dark:hover:bg-[#E1B177] hover:bg-[#E1B177] dark:bg-gray-900 text-gray-400  hover:text-white '>
          <Link href={`/create-chatbot`} className='flex items-center'>
            <Plus /> Create
          </Link>
        </Button>
      </div>

      {chatbots?.length === 0 && (
        <div className='text-black flex flex-col w-full items-center text-center p-10 '>
          <p>
            You have not created any chatbots yet, Create a new chatbot by
            clicking on create.
          </p>
        </div>
      )}
      <ul className='grid md:grid-cols-2 grid-cols-1 gap-5'>
        {sortedBots.map((chatbot: any) => (
          <Link
            className='dark:bg-gray-900'
            key={chatbot?.id}
            href={`/edit-chatbot/${chatbot?.id}`}
          >
            <li className='relative md:p-10 p-5  border rounded-md max-w-2xl dark:bg-gray-900 bg-white dark:text-gray-400 '>
              <div>
                <div className='flex items-center space-x-4'>
                  {chatbot?.botIcon ? (
                    <Image
                      src={chatbot?.botIcon}
                      alt={chatbot?.botIcon}
                      width={100}
                      height={100}
                      className='h-24 w-24 rounded-full'
                    />
                  ) : (
                    <Avatar seed={chatbot.name as string} />
                  )}
                  <h2 className='text-xl font-bold'>{chatbot?.name}</h2>
                </div>

                <p className='absolute top-5 right-5 text-xs text-gray-400'>
                  Created: {new Date(chatbot.createdAt).toLocaleString()}
                </p>

                <hr className='mt-2' />
                <h5 className='pb-0 px-4 pt-4 text-[#E1B177] italic'>
                  trained
                </h5>

                <div className='p-4 space-y-4'>
                  <div className='flex items-center text-sm justify-between w-full  '>
                    <h5>Text chars</h5>
                    <h5 className=''>
                      {
                        chatbot?.Source?.characteristic
                          ?.map(
                            (character: characteristic) =>
                              character?.characteristic
                          )
                          .join("").length
                      }{" "}
                      chars
                    </h5>
                  </div>

                  <div className='flex items-start text-sm justify-between  '>
                    <h5>Pdf File</h5>
                    <div>
                      {chatbot?.Source?.pdfFile?.length > 0 ? (
                        <>
                          {chatbot?.Source?.pdfFile?.map((pdf: PdfFile) => (
                            <h5 key={pdf?.id} className='py-1'>
                              {pdf?.fileName}
                            </h5>
                          ))}
                        </>
                      ) : (
                        <h5>0</h5>
                      )}
                    </div>
                  </div>
                  {/* 
                  <div className='flex items-center text-sm justify-between  '>
                    <h5>Website Url</h5>
                    <h5 className='truncate md:w-[240px]'>
                      https://portfolio.decolemills.com/#about
                    </h5>
                  </div> */}
                  <div className='flex items-center text-sm justify-between  '>
                    <h5>No of Session</h5>
                    <h5>{chatbot?.customer?.length!}</h5>
                  </div>
                </div>
              </div>
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
}

export default ViewChatbot;
