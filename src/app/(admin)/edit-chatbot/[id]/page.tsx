"use client";
import SideHeader from "@/components/SideHeader";
import { Button } from "@/components/ui/button";
import logo from "../../../../../public/golden.png";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getBot } from "@/actions/bot";
import { redirect } from "next/navigation";
import useSWR from "swr";

import Avatar from "@/components/Avatar";
import General from "@/components/TabContent/General";
import Source from "@/components/TabContent/Source";
import Connect from "@/components/TabContent/Connect";
import SettingsPage from "@/components/TabContent/Settings";
import type { ChatBot } from "@prisma/client";
import { BASE_URL } from "../../../../../constant/url";
import Image from "next/image";
import { BotMessageSquare } from "lucide-react";
import Link from "next/link";

function EditPage({ params: { id } }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("general");

  const { data, error, isLoading, mutate } = useSWR<ChatBot | any>(
    "/api/getBot",
    async () => await getBot(id!)
  );

  useEffect(() => {
    mutate();
  }, [id]);

  if (isLoading) {
    return (
      <div className='w-full flex justify-center items-center mt-20'>
        <Image
          src={logo}
          alt='logo'
          width={100}
          height={100}
          className='rounded-full animate-spin'
        />
      </div>
    );
  }

  if (error) {
    console.error("An error occurred while fetching the bot data:", error);
    if (error.code === "P2023") {
      return redirect("/dashboard");
    }
    return <div>Error loading bot data</div>;
  }

  if (!data) {
    console.error("No data found for the provided ID.");
    return redirect(`${BASE_URL}/dashboard`);
  }

  return (
    <div className='mt-20 space-y-12 w-full md:max-w-3xl md:mx-auto lg:max-w-5xl lg:mx-auto p-5'>
      {data && <SideHeader data={data} />}
      {data && (
        <Link
          href={`${BASE_URL}/chatbot/${data?.id}`}
          className='flex w-full items-end justify-end'
        >
          <Button className='gap-2 text-gray-100 dark:text-gray-200 bg-black/50 flex items-center w-full md:max-w-[150px] lg:w-[150px] dark:bg-gray-900  hover:bg-[#E1B177]  dark:hover:bg-[#E1B177] '>
            <BotMessageSquare /> <h3>Playground</h3>
          </Button>
        </Link>
      )}
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
          {data && <General chatbot={data} />}
        </TabsContent>
        <TabsContent value='source'>
          <Source chatbotId={data?.id} />
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

export default EditPage;
