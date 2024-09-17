import React, {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Input } from "./ui/input";

import Avatar from "./Avatar";

import { Folder, FolderPlus, SaveAll, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { getBot, updateBotName } from "@/actions/bot";
import { toast } from "sonner";
import Image from "next/image";
import { useEdgeStore } from "@/lib/edgestore";
import { Progress } from "./ui/progress";
import useSWR from "swr";

function SideHeader({ data }: { data: any }) {
  const { user } = useUser();
  const { edgestore } = useEdgeStore();
  const { mutate } = useSWR("/api/getbot", async () => getBot(data?.id));
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  //const [bot, setBot] = useGlobalStore((state) => [state?.bot, state.setBot]);
  const [icon, setIcon] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [botHeader, setBotHeader] = useState({
    name: "",
    role: data?.role,
  });
  const disabled =
    data?.name === botHeader?.name &&
    data?.role === botHeader?.role &&
    icon?.size === undefined;

  const handleBotName = async (e: FormEvent) => {
    e.preventDefault();

    let imageUrl = data?.botIcon;
    if (icon) {
      setIsUploading(true);
      try {
        // Check if there is an existing image URL
        if (imageUrl?.includes("https://files.edgestore.dev/")) {
          // Upload the new image
          imageUrl = (
            await edgestore.myPublicImages.upload({
              file: icon,
              options: {
                replaceTargetUrl: imageUrl,
              },
              onProgressChange: (progress) => {
                setProgress(progress);
              },
            })
          )?.url;
        } else {
          // Upload the new image if there's no previous image
          imageUrl = (
            await edgestore.myPublicImages.upload({
              file: icon,
              onProgressChange: (progress) => {
                setProgress(progress);
              },
            })
          )?.url;
        }
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    }

    startTransition(async () => {
      const promise = updateBotName(
        data?.id!,
        botHeader?.name!,
        botHeader?.role!,
        imageUrl!
      );
      toast.promise(promise, {
        loading: "Updating ChatBot...",
        success: "Chatbot Updated",
        error: "Failed to update bot header",
      });
      const updateBot = await getBot(data?.id);
      if (updateBot !== null) {
        // setBot(updateBot as ChatBot);
        await mutate(() => getBot(data?.id));
      }
    });
  };
  const refIcon = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBotHeader((value) => ({ ...value, name: data?.name }));
    mutate();
  }, [data]);
  // bg-[#2991EE]

  return (
    <form
      onSubmit={handleBotName}
      className=' sm:max-w-md ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-white dark:bg-gray-900 gap-2 md:gap-4 lg:gap-4'
    >
      <input
        ref={refIcon}
        type='file'
        hidden
        accept='jpg, .jpeg, .png'
        onChange={(e) => {
          if (!e.target.files![0]?.type.startsWith("image/")) return;
          setIcon(e.target.files![0]);
        }}
      />
      <div className='flex items-center justify-center gap-5'>
        <div className='relative '>
          {data?.botIcon ? (
            icon ? (
              <Image
                src={URL.createObjectURL(icon)}
                alt='icon'
                width={100}
                height={100}
                className='rounded-full h-24 '
              />
            ) : (
              <Image
                src={data?.botIcon!}
                alt={data?.botIcon!}
                width='100'
                height='100'
                className='rounded-full h-24 '
              />
            )
          ) : icon ? (
            <Image
              src={URL.createObjectURL(icon)}
              alt='icon'
              width={100}
              height={100}
              className='rounded-full h-24 '
            />
          ) : (
            <Avatar seed={botHeader.name} />
          )}

          <Button
            type='button'
            onClick={() => {
              refIcon.current?.click();
            }}
            className='absolute group bg-white justify-center items-center bottom-5 left-5 border-gray-200 border dark:bg-gray-950 '
          >
            <Upload className='text-black group-hover:text-white  dark:text-gray-400' />
          </Button>
        </div>
        <div className='space-y-2 flex-1'>
          {/* <form onSubmit={handleBotName}> */}
          <Input
            //value={name}

            defaultValue={botHeader.name}
            onChange={(e) =>
              setBotHeader((values) => ({ ...values, name: e.target.value }))
            }
            className='dark:bg-gray-950'
          />

          <Input
            className='dark:bg-gray-950'
            defaultValue={data && data?.role}
            onChange={(e) =>
              setBotHeader((values) => ({ ...values, role: e.target.value }))
            }
            placeholder='Tagline role: Customer Suport Agent'
          />
        </div>
      </div>
      {isUploading && <Progress value={progress} className='w-full h-2' />}
      <Button
        //flex
        className='flex flex-col md:ml-auto lg:ml-auto text-white bg-black/70 hover:text-white hover:bg-[#E1B177] dark:bg-gray-950 dark:hover:bg-[#E1B177]  w-full md:w-[130px] lg:w-[140px]  '
        type='submit'
        disabled={!user || !botHeader || isPending || isUploading || disabled}
      >
        {/* <SaveAll /> */}
        Save changes
      </Button>
    </form>
  );
}

export default SideHeader;
