"use client";

import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "../../public/golden.png";
import { TABS_MENU } from "./SideMenu/Menu";
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
  return (
    <div className='w-full md:max-w-md mx-auto flex items-center h-full  '>
      <TabsMenu triggers={TABS_MENU} className=''>
        <Button
          variant={"ghost"}
          className='gap-2 border bg-gray-200 text-black w-full md:w-[100px] '
        >
          Export <Download className='h-5 w-5' />
        </Button>
        <TabsContent value='active message' className='w-full flex-1'>
          <div className=' bg-gray-100  '>
            <Separator orientation='horizontal' className='mt-3' />
            <ConversationSearch
              chatbots={chatbots as ChatBot[]}
              onSelectBot={setSelectedBotId}
              defaultSelect={selectedBotId}
            />
          </div>
          <MessageComponent data={filteredChats as any} />
        </TabsContent>
        <TabsContent value='all message' className=''>
          <div className='sticky top-28 z-10 bg-gray-100 '>
            <Separator orientation='horizontal' className='mt-3' />
            <ConversationSearch
              chatbots={chatbots as ChatBot[]}
              onSelectBot={setSelectedBotId}
              defaultSelect={selectedBotId}
            />
          </div>
          <MessageComponent data={filteredCustomers as any} />
        </TabsContent>
      </TabsMenu>
    </div>
  );
};

export default ConversationMenu;
