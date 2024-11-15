import { BotIcon, RefreshCcw } from "lucide-react";
import Image from "next/image";
import Avatar from "../Avatar";
import botIcon from "../../../public/circlegolden.png";
import { usePathname } from "next/navigation";
import type { ChatBot } from "@prisma/client";
import { Button } from "../ui/button";
import { useGlobalStore } from "@/store/globalStore";
import { toast } from "sonner";

export default function ChatbotHeader({
  bot,
  live,
}: {
  bot: ChatBot;
  live?: boolean;
}) {
  const pathname = usePathname();
  const [setChatId, setFeedback] = useGlobalStore((state) => [
    state.setChatId,
    state.setFeedback,
  ]);

  return (
    <header
      className='flex items-center bg-background dark:bg-gray-900 justify-between p-3 md:p-4 lg:p-5 shadow-sm rounded-t-md'
      // className={`flex items-center  bg-background dark:bg-gray-900  justify-between p-5  shadow-sm rounded-t-md h-24

      // `}
    >
      <div className='flex items-center gap-3'>
        <div
          // className='flex h-12 w-12 items-center justify-center rounded-full '
          className='flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full overflow-hidden'
        >
          {bot && bot?.botIcon ? (
            <Image
              src={bot?.botIcon}
              alt={bot?.botIcon}
              width='48'
              height='48'
              // className='rounded-full h-12 '
              className='rounded-full w-full h-full object-cover'
            />
          ) : (
            <Image
              src={botIcon}
              alt='botIcon'
              width='48'
              height='48'
              className='rounded-full w-full h-full object-cover'
              // className='rounded-full h-12'
            />
          )}
        </div>
        <div>
          <h3
            // className='text-sm font-medium'
            className='text-sm md:text-base font-medium'
          >
            {bot?.name}
          </h3>
          <p className='text-xs md:text-sm text-muted-foreground'>
            {bot?.role ? bot?.role : "We're here to help 24/7"}
          </p>
        </div>
      </div>
      {live ? (
        <div className='flex items-center gap-4'>
          <div className='relative h-3 w-3 rounded-full'>
            <div className='absolute inset-0 animate-ping rounded-full bg-green-200 opacity-75' />
            {/* <div className='relative inline-block h-3 w-3 rounded-full bg-primary' /> */}
            <div className='h-3 w-3 rounded-full bg-green-500' />
          </div>
        </div>
      ) : (
        <>
          {!pathname.includes("/chatlogs") && (
            <Button
              variant='outline'
              onClick={() => {
                toast.promise(
                  async () => {
                    setChatId("");
                    setFeedback(false);
                  },
                  {
                    loading: "Clearing chat messages...",
                    success: "Chat messages cleared successfully.",
                    error: "Error clearing chat ID.",
                  }
                );
              }}
            >
              <RefreshCcw className='h-5 w-5' />
            </Button>
          )}
        </>
      )}
    </header>
  );
}
