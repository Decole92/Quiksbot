"use client";
import React, {
  FormEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Input } from "./ui/input";
import Avatar from "./Avatar";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { updateBotName } from "@/actions/bot";
import { toast } from "sonner";
import Image from "next/image";
import { Progress } from "./ui/progress";
import { useConvexUpload } from "@/hooks/useConvexUpload";
import useSWR from "swr";

function SideHeader({ data }: { data: any }) {
  const { user } = useUser();
  const { uploadFile, progress, isUploading } = useConvexUpload();
  const { mutate } = useSWR(data?.id ? `/api/getbot/${data.id}` : null);
  const [icon, setIcon] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [botHeader, setBotHeader] = useState({
    name: data?.name ?? "",
    role: data?.role ?? "",
  });

  const disabled =
    data?.name === botHeader?.name &&
    data?.role === botHeader?.role &&
    icon === null;

  const handleBotName = async (e: FormEvent) => {
    e.preventDefault();

    let imageUrl: string = data?.botIcon ?? "";
    if (icon) {
      const uploaded = await uploadFile(icon);
      if (uploaded) imageUrl = uploaded;
    }

    startTransition(async () => {
      const promise = updateBotName(
        data?.id!,
        botHeader?.name!,
        botHeader?.role!,
        imageUrl
      );
      toast.promise(promise, {
        loading: "Updating ChatBot...",
        success: "Chatbot Updated",
        error: "Failed to update bot header",
      });
      await promise;
      await mutate();
    });
  };

  const refIcon = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBotHeader({ name: data?.name ?? "", role: data?.role ?? "" });
    mutate();
  }, [data]);

  return (
    <form
      onSubmit={handleBotName}
      className='sm:max-w-md ml-auto space-y-2 md:border p-5 rounded-b-lg md:rounded-lg bg-white dark:bg-gray-900 gap-2 md:gap-4 lg:gap-4'
    >
      <input
        ref={refIcon}
        type='file'
        hidden
        accept='.jpg,.jpeg,.png'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file?.type.startsWith("image/")) setIcon(file);
        }}
      />
      <div className='flex items-center justify-center gap-5'>
        <div className='relative'>
          {data?.botIcon ? (
            icon ? (
              <Image
                src={URL.createObjectURL(icon)}
                alt='icon'
                width={100}
                height={100}
                className='rounded-full h-24'
              />
            ) : (
              <Image
                src={data?.botIcon}
                alt={data?.botIcon}
                width={100}
                height={100}
                className='rounded-full h-24'
              />
            )
          ) : icon ? (
            <Image
              src={URL.createObjectURL(icon)}
              alt='icon'
              width={100}
              height={100}
              className='rounded-full h-24'
            />
          ) : (
            <Avatar seed={botHeader.name} />
          )}

          <Button
            type='button'
            onClick={() => refIcon.current?.click()}
            className='absolute group bg-white justify-center items-center bottom-5 left-5 border-gray-200 border dark:bg-gray-950'
          >
            <Upload className='text-black group-hover:text-white dark:text-gray-400' />
          </Button>
        </div>
        <div className='space-y-2 flex-1'>
          <Input
            defaultValue={botHeader.name}
            onChange={(e) =>
              setBotHeader((v) => ({ ...v, name: e.target.value }))
            }
            className='dark:bg-gray-950'
          />
          <Input
            className='dark:bg-gray-950'
            defaultValue={botHeader.role}
            onChange={(e) =>
              setBotHeader((v) => ({ ...v, role: e.target.value }))
            }
            placeholder='Tagline role: Customer Support Agent'
          />
        </div>
      </div>
      {isUploading && <Progress value={progress} className='w-full h-2' />}
      <Button
        className='flex flex-col md:ml-auto lg:ml-auto text-white bg-black/70 hover:text-white hover:bg-[#E1B177] dark:bg-gray-950 dark:hover:bg-[#E1B177] w-full md:w-[130px] lg:w-[140px]'
        type='submit'
        disabled={!user || !botHeader || isPending || isUploading || disabled}
      >
        Save changes
      </Button>
    </form>
  );
}

export default SideHeader;
