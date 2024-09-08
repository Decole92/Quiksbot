"use client";
import SideHeader from "@/components/SideHeader";
import { Button } from "@/components/ui/button";

import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useGlobalStore } from "@/store/globalStore";
import { getBot } from "@/actions/bot";
import { redirect } from "next/navigation";
import useSWR from "swr";

import Avatar from "@/components/Avatar";
import General from "@/components/TabContent/General";
import Source from "@/components/TabContent/Source";
import Connect from "@/components/TabContent/Connect";
import SettingsPage from "@/components/TabContent/Settings";

function EditPage({ params: { id } }: { params: { id: string } }) {
  const [bot, setBot] = useGlobalStore((state) => [state.bot, state.setBot]);
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
        <Avatar className='animate-spin' seed='loading' />
      </div>
    );
  }

  if (error) {
    console.error("An error occurred while fetching the bot data:", error);
    if (error.code === "P2023") {
      return redirect("/view-chatbot");
    }
    return <div>Error loading bot data</div>;
  }

  if (!data) {
    console.error("No data found for the provided ID.");
    return redirect(`/view-chatbot`);
  }

  return (
    <div className='mt-20 space-y-12 w-full md:max-w-5xl md:mx-auto lg:max-w-5xl lg:mx-auto p-5'>
      {data && <SideHeader data={data} />}

      <div className='flex items-center justify-between border-b'>
        <div className='flex w-full justify-evenly'>
          <Button
            variant='ghost'
            className='relative h-10 px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring'
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
