"use client";
import React, { FormEvent, useRef, useState, useTransition } from "react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { useUser } from "@clerk/nextjs";
import {
  getBot,
  updateChatbotPosition,
  updateColor,
  updateFirstQuestion,
  updateGreetings,
  updateTheme,
} from "@/actions/bot";
import { Toaster, toast } from "sonner";
import Characteristic from "../Characteristic";
import { Moon, Sun, SunMoon, Upload } from "lucide-react";
import quiksIcon from "../../../public/circlegolden.png";
import { Block } from "@uiw/react-color";

import Image from "next/image";
import useSWR from "swr";
import { useEdgeStore } from "@/lib/edgestore";
import { Progress } from "../ui/progress";
import type { ChatBot, FirstQuestion } from "@prisma/client";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import useSubcription from "@/hook/useSubscription";

function General({ chatbot }: { chatbot: any }) {
  const { mutate } = useSWR(chatbot ? `/api/getBot/${chatbot?.id}` : null);
  const { edgestore } = useEdgeStore();
  const [chatIcon, setChatIcon] = useState<File | null>(null);
  const [hex, setHex] = useState(chatbot?.userMessageBgColor);
  const [progress, setProgress] = useState(0);
  const [iconPosition, setIconPosition] = useState("");
  const { user } = useUser();
  const [data, setData] = useState({
    question: "",
    greetings: chatbot?.greetings,
  });
  const { hasActiveMembership } = useSubcription();
  const [isPending, startTransition] = useTransition();
  const [isHolding, startPosition] = useTransition();
  const [isHex, startColoring] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, startGreeting] = useTransition();
  const refIcon = useRef<HTMLInputElement>(null);
  const limitQuestion = chatbot?.firstQuestion?.length === 4;
  const disableGreetings = chatbot?.greetings === data?.greetings;
  const disabledPosition =
    (iconPosition === "" && chatIcon?.size === undefined) ||
    chatbot.iconPosition === iconPosition;

  const handleAddQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = data?.question;
    setData((value) => ({ ...value, question: "" }));
    startTransition(async () => {
      const promise = updateFirstQuestion(chatbot?.id, question);
      toast.promise(promise, {
        loading: "Adding Question..",
        success: "Question Added Successfully!",
        error: "an error has occurred while adding question",
      });

      await mutate(() => getBot(chatbot?.id));
    });
  };

  const handleWaterMark = async (watermark: boolean) => {
    if (!hasActiveMembership || hasActiveMembership === "STANDARD") return;
    const update = await updateTheme(chatbot?.id, watermark!);
    if (update) {
      toast.promise(Promise.resolve(update), {
        loading: "Updating watermark theme...",
        success: "Chatbot watermark theme updated Successfully!",
        error: "An error has occurred while updating chatbot theme",
      });
      await mutate();
      return update;
    } else {
      toast.error("An error has occurred while updating watermark theme");
    }
  };

  const handleWelcomeGreetings = async (e: React.FormEvent) => {
    e.preventDefault();
    startGreeting(async () => {
      const promise = updateGreetings(chatbot?.id, data?.greetings!);
      toast.promise(promise, {
        loading: "Updating Greetings...",
        success: "Updated Successfully!",
        error: "an error has occurred while updating greetings",
      });
      await mutate();
    });
  };

  const handleHex = (e: FormEvent) => {
    e.preventDefault();

    startColoring(async () => {
      const promise = updateColor(chatbot?.id, hex!);
      toast.promise(promise, {
        loading: "Updating bot user bgColor...",
        success: "Updated Successfully!",
        error: "an error has occurred while updating chatbot user bgColor",
      });
      await mutate();
    });
  };

  const handleChatBotIconPosition = async (e: FormEvent) => {
    e.preventDefault();

    let imageUrl = chatbot?.icon!;

    if (chatIcon) {
      setIsUploading(true);
      try {
        if (imageUrl?.includes("https://files.edgestore.dev/")) {
          // Upload the new image
          imageUrl = (
            await edgestore.myPublicImages.upload({
              file: chatIcon,
              options: {
                replaceTargetUrl: imageUrl,
              },
              onProgressChange: (progress) => {
                setProgress(progress);
              },
            })
          )?.url;
        } else {
          imageUrl = (
            await edgestore.myPublicImages.upload({
              file: chatIcon,
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

    startPosition(async () => {
      const promise = updateChatbotPosition(
        chatbot?.id!,
        iconPosition !== "" ? iconPosition : chatbot?.iconPosition,
        imageUrl!
      );
      toast.promise(promise, {
        loading: "Positioning Chatbot Icon...",
        success: `Chatbot icon positioned ${iconPosition}.`,
        error: "Failed to update chatbot & position",
      });
      const updateBot = await getBot(chatbot?.id);
      if (updateBot !== null) {
        // setBot(updateBot as ChatBot);
        mutate();
      }
    });
  };

  return (
    <div className='border border-gray-300 rounded-md p-5 md:p-7 lg:p-7 h-full max-w-5xl mx-auto bg-white dark:bg-gray-900 '>
      <h3 className='text-2xl pb-4 font-thin'>Chat Interface Settings</h3>
      <div className='grid lg:grid-cols-5  h-full  rounded-lg gap-5 '>
        <div className='col-span-5 lg:col-span-5 space-y-4'>
          <div className=''>
            <h3 className='font-bold text-lg'>
              Here is what you sugguest client to ask...
            </h3>
            <h5 className=' pb-2 '>
              Before client starts conversing you would like them to ask list of
              this.
            </h5>

            <div className='bg-gray-200/50 p-3 rounded-md space-y-3 dark:bg-gray-950'>
              <form
                onSubmit={handleAddQuestions}
                className='flex items-center md:flex-row flex-col md:gap-4 gap-2'
              >
                <Input
                  minLength={2}
                  disabled={limitQuestion}
                  value={data?.question}
                  onChange={(e) =>
                    setData((value) => ({ ...value, question: e.target.value }))
                  }
                  className='flex-1 dark:bg-gray-900'
                  placeholder={`${
                    limitQuestion
                      ? " You can only suggest 4 questions to your client!"
                      : "What is example.com?"
                  }`}
                />

                <Button
                  disabled={
                    !user || !data.question || isPending || limitQuestion
                  }
                  type='submit'
                  className='bg-black/70 w-full md:w-[100px] lg:w-[100px] dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-[#E1B177] dark:hover:bg-[#E1B177]'
                >
                  Add
                </Button>
              </form>

              {chatbot?.firstQuestion?.length !== 0 && (
                <ul className='flex flex-wrap-reverse gap-3'>
                  {chatbot?.firstQuestion?.map((question: FirstQuestion) => (
                    <Characteristic
                      key={question.id}
                      question={question}
                      type='suggestion'
                      chatbotId={chatbot?.id!}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <h3 className='font-bold text-lg'>
              Customize your welcome greetings
            </h3>
            <h5 className=' pb-2'>
              Welcome message that appears before your client starts a
              conversation.
            </h5>
            <div>
              <form
                onSubmit={handleWelcomeGreetings}
                className='flex items-center md:flex-row flex-col md:gap-4 lg:gap-4 gap-2 bg-gray-200/50  p-3 rounded-md dark:bg-gray-950'
              >
                <Input
                  className='flex-1 dark:bg-gray-900 dark:text-gray-400'
                  placeholder='Hey! How can we assist you today ?'
                  defaultValue={chatbot?.greetings!}
                  onChange={(e) =>
                    setData((value) => ({
                      ...value,
                      greetings: e.target.value,
                    }))
                  }
                />
                <Button
                  type='submit'
                  disabled={isLoading || disableGreetings}
                  className='bg-black/70 dark:bg-gray-900 dark:text-gray-200 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] w-full md:w-[100px] lg:w-[100px]  '
                >
                  Update
                </Button>
              </form>
            </div>
          </div>

          <div className='flex  flex-col '>
            <div>
              <h3 className='font-bold text-lg'>Watermark Interface</h3>
            </div>

            <div className='flex items-center justify-between space-x-4 border p-3 rounded-md dark:bg-gray-900'>
              <Label htmlFor='use-watermark'>
                Toggle the switch to enable or disable the watermark on your
                interface.
              </Label>

              <Switch
                disabled={hasActiveMembership === "STANDARD"}
                id='get-watermark-state'
                checked={chatbot?.watermark}
                onCheckedChange={() => handleWaterMark(!chatbot?.watermark)}
              />
            </div>
          </div>

          <div className='grid lg:grid-cols-5 rounded-lg gap-5'>
            <form onSubmit={handleHex} className='col-span-5 lg:col-span-3 '>
              <h3 className='font-bold text-lg'>Style client message</h3>
              <h5 className='pb-2'>Pick color from color pallette</h5>
              <div className='flex justify-center items-center md:justify-start md:items-start mb-2'>
                <Block
                  color={hex!}
                  onChange={(color) => {
                    setHex(color.hex);
                  }}
                />
              </div>
              <Button
                disabled={isHex || chatbot?.userMessageBgColor === hex}
                type='submit'
                className='flex flex-col items-center justify-center w-full md:w-[180px] bg-black/70 hover:bg-[#E1B177] text-white  dark:hover:bg-[#E1B177] dark:text-gray-200 '
              >
                Save color
              </Button>
            </form>

            <form
              onSubmit={handleChatBotIconPosition}
              className='col-span-5 lg:col-span-2 '
            >
              <h3 className='font-bold text-lg'>Edit Icon</h3>
              <h5 className='py-2'>
                Make changes regarding to your chatbot messaging icon
              </h5>
              <div className='flex md:flex-row flex-col space-y-2 md:items-center md:space-x-4'>
                <div className='flex items-center justify-center'>
                  <input
                    ref={refIcon}
                    type='file'
                    hidden
                    accept='jpg, .jpeg, .png'
                    onChange={(e) => {
                      if (!e.target.files![0]?.type.startsWith("image/"))
                        return;
                      setChatIcon(e.target.files![0]);
                    }}
                  />
                  <div className='relative'>
                    {chatIcon ? (
                      <Image
                        src={URL.createObjectURL(chatIcon)}
                        alt='icon'
                        width={100}
                        height={100}
                        className=' rounded-full h-24 w-22 '
                      />
                    ) : chatbot && chatbot?.icon !== null ? (
                      <Image
                        src={chatbot?.icon!}
                        alt={chatbot?.icon!}
                        height={100}
                        width={100}
                        className='h-24 w-22 rounded-full'
                      />
                    ) : (
                      <Image
                        src={quiksIcon}
                        alt={"quiksIcon"}
                        width={100}
                        height={100}
                        className='h-24 w-22 rounded-full '
                      />
                    )}
                    <Button
                      type='button'
                      onClick={() => {
                        refIcon.current?.click();
                      }}
                      className='absolute group bg-white  dark:bg-gray-950 justify-center items-center bottom-5 md:left-5 left-5  border-gray-200 border dark:hover:bg-[#E1B177]  '
                    >
                      <Upload className='text-black group-hover:text-white dark:text-gray-400  ' />
                    </Button>
                  </div>
                </div>

                <div className='flex  items-center  flex-col gap-2 bg-gray-200/50 dark:bg-gray-950 p-3 rounded-md '>
                  <Select
                    defaultValue={chatbot?.iconPosition!}
                    onValueChange={(e) => setIconPosition(e)}
                  >
                    <SelectTrigger className='md:w-[220px] w-full dark:bg-gray-900'>
                      <SelectValue placeholder='Select position for Chatbot Icon' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='left'>Left Position</SelectItem>
                      <SelectItem value='right'>Right Position</SelectItem>
                      <SelectItem value='center'>Center Position</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type='submit'
                    disabled={isHolding || disabledPosition}
                    className='bg-black/70 w-full  text-white dark:bg-gray-900  dark:hover:bg-[#E1B177] hover:bg-[#E1B177] '
                  >
                    Update Changes
                  </Button>
                  {isUploading && (
                    <Progress
                      value={progress}
                      className='w-full h-2 bg-gray-300 hover:bg-black'
                    />
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default General;
