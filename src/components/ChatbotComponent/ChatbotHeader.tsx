"use client";

import Image from "next/image";
import botIcon from "../../../public/circlegolden.png";
import { usePathname } from "next/navigation";
import { useGlobalStore } from "@/store/globalStore";
import RefreshButton from "../RefreshedButton";
import { useEffect, useState } from "react";

export default function ChatbotHeader({
  bot,
  live,
  startAuto,
  setBotOpened,
  messages,
  setLocalMessages,
}: {
  bot: any;
  live?: boolean;
  startAuto?: () => void;
  setBotOpened?: (value: boolean) => void;
  messages?: any[];
  setLocalMessages?: (messages: any[]) => void;
}) {
  const pathname = usePathname();
  const [setChatId, setFeedback] = useGlobalStore((state) => [
    state.setChatId,
    state.setFeedback,
  ]);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [count, setCount] = useState(0);

  const handleRefresh = async () => {
    // Simulate an API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastRefreshed(new Date());
    setCount((prev) => prev + 1);
    if (setBotOpened) {
      setBotOpened(false);
    }
    setChatId("");
    setFeedback(false);
    if (setLocalMessages) setLocalMessages([]);
  };

  return (
    <header className='flex items-center bg-background dark:bg-gray-900 justify-between p-3 md:p-4 lg:p-5 shadow-sm rounded-t-md'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full overflow-hidden'>
          {bot && bot?.botIcon ? (
            <Image
              src={bot?.botIcon}
              alt={bot?.botIcon}
              width='48'
              height='48'
              className='rounded-full w-full h-full object-cover'
            />
          ) : (
            <Image
              src={botIcon}
              alt='botIcon'
              width='48'
              height='48'
              className='rounded-full w-full h-full object-cover'
            />
          )}
        </div>
        <div>
          <h3 className='text-sm md:text-base font-medium'>{bot?.name}</h3>
          <p className='text-xs md:text-sm text-muted-foreground'>
            {bot?.role ? bot?.role : "We're here to help 24/7"}
          </p>
        </div>
      </div>
      {live ? (
        <div className='flex items-center gap-4'>
          <div className='relative h-3 w-3 rounded-full'>
            <div className='absolute inset-0 animate-ping rounded-full bg-green-200 opacity-75' />
            <div className='h-3 w-3 rounded-full bg-green-500' />
          </div>
        </div>
      ) : (
        <>
          {!pathname.includes("/chatlogs") && (
            <>
              <RefreshButton
                onRefresh={handleRefresh}
                variant='outline'
                // label='Refresh Data'
                attentionInterval={3000}
              />
            </>
          )}
        </>
      )}
    </header>
  );
}
