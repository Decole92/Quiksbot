import { BotIcon } from "lucide-react";
import Image from "next/image";
import Avatar from "../Avatar";
import botIcon from "../../../public/golden.png";
import { usePathname } from "next/navigation";
//bg-primary text-primary-foreground
{
  /* <Avatar seed={bot?.name as string} /> */
}

export default function ChatbotHeader({
  bot,
  live,
}: {
  bot: ChatBot;
  live?: boolean;
}) {
  const pathname = usePathname();
  const chatlog = pathname.includes("chatlog");
  return (
    <header
      className={`flex items-center bg-background justify-between p-5 shadow-sm rounded-t-md h-24 z-30 sticky  ${
        chatlog ? "top-20" : "top-0"
      }`}
    >
      <div className='flex items-center gap-3'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full '>
          {bot && bot?.botIcon ? (
            <Image
              src={bot?.botIcon}
              alt={bot?.botIcon}
              width='100'
              height='100'
              className='rounded-full h-12 '
            />
          ) : (
            <Image
              src={botIcon}
              alt='botIcon'
              width='100'
              height='100'
              className='rounded-full h-12'
            />
          )}
        </div>
        <div>
          <h3 className='text-sm font-medium'>{bot?.name}</h3>
          <p className='text-xs text-muted-foreground'>
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

          <span className='text-sm font-medium text-muted-foreground'>
            Agent Available
          </span>
        </div>
      ) : null}
    </header>
  );
}
