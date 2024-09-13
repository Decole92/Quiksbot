"use client";

import React, { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "../../public/golden.png";
import { TABS_MENU } from "./SideMenu/Menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "./ui/separator";
import TabsMenu from "./TabsMenu";
import MessageComponent from "./MessageTab/MessageComponent";
import useSWR from "swr";
import { useUser } from "@clerk/nextjs";
import { getChatBotByUser } from "@/actions/bot";
import ConversationSearch from "./ConversationSearch";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { getAllActiveChats, getUserCustomers } from "@/actions/customer";
import Image from "next/image";

type Props = {
  domains?:
    | {
        name: string;
        id: string;
        icon: string;
      }[]
    | undefined;
};

const ConversationMenu = () => {
  const { user } = useUser();
  const [selectedBotId, setSelectedBotId] = React.useState<string>("");
  const [activeTab, setActiveTab] = useState("active");
  const { data: chatbots } = useSWR(
    "/api/fetchBot",
    user ? async () => await getChatBotByUser(user?.id) : null
  );

  const { data: getAllActiveChat, isLoading } = useSWR(
    `/api/getActiveChats/${user?.id}`,
    user ? async () => await getAllActiveChats(user?.id) : null
  );

  const { data: allUserCustomers, isLoading: loading } = useSWR(
    `/api/getCustomers/${user?.id}`,
    user ? async () => await getUserCustomers(user?.id) : null
  );

  const filteredChats = React.useMemo(() => {
    if (!selectedBotId) return getAllActiveChat;
    // console.log("getAllActive", getAllActiveChat);
    return getAllActiveChat?.filter(
      (chat: any) => chat.chatbotId === selectedBotId
    );
  }, [getAllActiveChat, selectedBotId]);

  const filteredCustomers = React.useMemo(() => {
    if (!selectedBotId) return allUserCustomers;
    return allUserCustomers?.filter(
      (customer: any) => customer.chatbotId === selectedBotId
    );
  }, [allUserCustomers, selectedBotId]);

  if (loading || isLoading) {
    return (
      <div className='flex md:max-w-md  mx-auto w-full h-screen justify-center items-center'>
        <div>
          <Image
            src={logo}
            alt='logo'
            width={100}
            height={100}
            className='rounded-full animate-spin'
          />
        </div>
      </div>
    );
  }

  const filteredData =
    activeTab === "expired" ? filteredCustomers : filteredChats;
  return (
    <div className='lg:w-1/3 md:w-1/3 w-full border-r bg-muted dark:bg-transparent dark:text-gray-400'>
      <div className='p-5'>
        <div className='flex md:items-center justify-between border-b p-4 items-start lg:items-center'>
          <h2 className='text-lg font-medium'>Inbox</h2>

          <div className='flex flex-col md:flex-row md:items-center gap-2'>
            <Tabs
              defaultValue='active'
              value={activeTab}
              onValueChange={setActiveTab}
              className='flex'
            >
              <TabsList>
                <TabsTrigger value='active'>Active</TabsTrigger>
                <TabsTrigger value='expired'>Expired</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              variant={"ghost"}
              className='gap-2 border bg-gray-200/50 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-[#E1B177] dark:hover:text-gray-100 text-black hidden md:inline-flex md:w-[100px] lg:w-[100px]   '
            >
              Export <Download className='h-5 w-5' />
            </Button>
          </div>
        </div>
        <Button
          variant={"ghost"}
          className='gap-2 border bg-gray-200/50 text-black w-full inline-flex md:hidden lg:hidden dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-[#E1B177] dark:hover:text-gray-100 '
        >
          Export <Download className='h-5 w-5' />
        </Button>

        <ConversationSearch
          chatbots={chatbots as any}
          onSelectBot={setSelectedBotId}
          defaultSelect={selectedBotId}
        />
      </div>

      <MessageComponent data={filteredData as any} />
    </div>
  );
};

export default ConversationMenu;
