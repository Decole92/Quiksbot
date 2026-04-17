"use client";
import SideHeader from "@/components/SideHeader";
import { Button } from "@/components/ui/button";
import logo from "../../../public/circlegolden.png";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getBot } from "@/actions/bot";
import { useRouter } from "next/navigation";
import useSWR from "swr";

import General from "@/components/TabContent/General";
import Source from "@/components/TabContent/Source";
import Connect from "@/components/TabContent/Connect";
import SettingsPage from "@/components/TabContent/Settings";

import Image from "next/image";
import { AlertCircle, BotMessageSquare } from "lucide-react";
import Link from "next/link";
import { BASE_URL } from "../../../constant/url";
import { checkContextLength } from "@/lib/formatDate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

function EditPageClient({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("general");
  const router = useRouter();

  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/getBot/${id}` : null,
    () => getBot(id),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    mutate();
  }, [id, mutate]);

  useEffect(() => {
    if (error || (!isLoading && !data)) {
      console.error("Error or no data found:", error);
      router.push(`${BASE_URL}/dashboard`);
    }
  }, [error, isLoading, data, router]);

  if (isLoading) {
    return (
      <div className='w-full flex justify-center items-center mt-20 h-full'>
        <Image
          src={logo}
          alt='logo'
          width={50}
          height={50}
          className='rounded-full animate-spin'
        />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className='mt-20 h-full space-y-12 w-full md:max-w-3xl md:mx-auto lg:max-w-5xl lg:mx-auto p-5'>
      <SideHeader data={data} />

      {data?.Source &&
        (data.chatModel?.includes("grok") ? (
          // For Grok: Check if there's any content, skip token length check
          data.Source.characteristic?.length > 0 ||
          data.Source.pdfFile?.length > 0 ||
          data.Source.webpage?.length > 0 ? (
            <Link
              target='_blank'
              href={`${BASE_URL}/chatbot/${data.id}`}
              className='flex w-full items-end justify-end'
            >
              <div className='p-[2px] flex md:max-w-[180px] lg:max-w-[180px] w-full mx-5 bg-gradient-to-r from-gray-500 via-[#FFD700] to-[#E1B177] rounded-lg items-center'>
                <Button className='px-8 py-2 bg-gray-100 hover:text-gray-100 hover:bg-gray-200/70 dark:bg-gray-950 dark:hover:bg-gray-900 dark:hover:text-gray-200 text-gray-900 dark:text-gray-400 font-semibold rounded-md transition-all duration-300 ease-in-out w-full'>
                  <BotMessageSquare className='w-6 h-6 mr-2' />
                  Playground
                </Button>
              </div>
            </Link>
          ) : (
            <Button
              disabled
              variant={"ghost"}
              className='flex w-full mx-5 md:flex-row items-center justify-center text-red-500 ml-auto md:max-w-[150px] lg:w-[150px] dark:bg-gray-900 hover:bg-[#E1B177] dark:hover:bg-[#E1B177]'
            >
              Not Trained yet
            </Button>
          )
        ) : (
          (() => {
            // For non-Grok models: Compute token check once
            const tokenCheck = checkContextLength(data, data?.chatModel);
            return tokenCheck?.totalChars > 0 ? (
              <div className='flex flex-col w-full items-end justify-end gap-2 '>
                <div>
                  {tokenCheck?.exceedsLimit && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className='h-4 w-4 cursor-pointer text-red-500' />
                        </TooltipTrigger>
                        <TooltipContent className='bg-amber-50 border border-amber-200 text-amber-700 p-3 max-w-xs'>
                          <p className='text-xs mt-1'>
                            {tokenCheck?.alertMessage}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                {/* Playground button */}
                <Link
                  target='_blank'
                  href={`${BASE_URL}/chatbot/${data.id}`}
                  className='flex w-full items-end justify-end'
                >
                  <div className='p-[2px] flex md:max-w-[180px] lg:max-w-[180px] w-full mx-5 bg-gradient-to-r from-gray-500 via-[#FFD700] to-[#E1B177] rounded-lg items-center'>
                    <Button
                      className='px-8 py-2 bg-gray-100 hover:text-gray-100 hover:bg-gray-200/70 dark:bg-gray-950 dark:hover:bg-gray-900 dark:hover:text-gray-200 text-gray-900 dark:text-gray-400 font-semibold rounded-md transition-all duration-300 ease-in-out w-full'
                      // Optionally disable if exceeded: disabled={tokenCheck?.exceedsLimit}
                    >
                      <BotMessageSquare className='w-6 h-6 mr-2' />
                      Playground
                    </Button>
                  </div>
                </Link>
              </div>
            ) : (
              <Button
                disabled
                variant={"ghost"}
                className='flex w-full mx-5 md:flex-row items-center justify-center text-red-500 ml-auto md:max-w-[150px] lg:w-[150px] dark:bg-gray-900 hover:bg-[#E1B177] dark:hover:bg-[#E1B177]'
              >
                Not Trained yet
              </Button>
            );
          })()
        ))}

      <div className='flex items-center justify-between border-b '>
        <div className='flex w-full justify-evenly'>
          <Button
            variant='ghost'
            className='relative h-10 px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground  focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            onClick={() => setActiveTab("general")}
          >
            <span>General</span>
            <div
              className={`absolute bottom-0 left-0 h-[2px] w-full bg-primary transition-all duration-300 ${
                activeTab === "general" ? "" : "scale-x-0"
              }`}
            />
          </Button>
          <Button
            variant='ghost'
            className='relative h-10 px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            onClick={() => setActiveTab("source")}
          >
            <span>Source</span>
            <div
              className={`absolute bottom-0 left-0 h-[2px] w-full bg-primary transition-all duration-300 ${
                activeTab === "source" ? "" : "scale-x-0"
              }`}
            />
          </Button>
          <Button
            variant='ghost'
            className='relative h-10 px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            onClick={() => setActiveTab("connect")}
          >
            <span>Connect</span>
            <div
              className={`absolute bottom-0 left-0 h-[2px] w-full bg-primary transition-all duration-300 ${
                activeTab === "connect" ? "" : "scale-x-0"
              }`}
            />
          </Button>
          <Button
            variant='ghost'
            className='relative h-10 px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
            onClick={() => setActiveTab("setting")}
          >
            <span>Settings</span>
            <div
              className={`absolute bottom-0 left-0 h-[2px] w-full bg-primary transition-all duration-300 ${
                activeTab === "setting" ? "" : "scale-x-0"
              }`}
            />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} className='w-full'>
        <TabsList className='hidden'>
          <TabsTrigger value='playground'>Playground</TabsTrigger>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='source'>Source</TabsTrigger>
          <TabsTrigger value='connect'>Connect</TabsTrigger>
          <TabsTrigger value='setting'>Setting</TabsTrigger>
        </TabsList>
        <TabsContent value='playground'>
          Playground content goes here.
        </TabsContent>
        <TabsContent value='general'>
          <General chatbot={data} />
        </TabsContent>
        <TabsContent value='source'>
          <Source chatbotId={data.id} />
        </TabsContent>
        <TabsContent value='connect'>
          <Connect chatbot={data} />
        </TabsContent>
        <TabsContent value='setting'>
          <SettingsPage chatbot={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EditPageClient;
