import React, { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import useSubcription from "@/hook/useSubscription";
import { ChatBot, botType } from "@prisma/client";
import { botTypeData } from "../../../constant/Features";
import { toast } from "sonner";
import { updateBotSettings } from "@/actions/customer";
import { deleteBot } from "@/actions/bot";
import { useEdgeStore } from "@/lib/edgestore";
import { useRouter } from "next/navigation";

function SettingsPage({ chatbot }: { chatbot: ChatBot }) {
  const [getInfoBeforeChat, setGetInfoBeforeChat] = useState<boolean>(
    chatbot?.getDetails || false
  );
  const [selectedModel, setSelectedModel] = useState(chatbot?.chatModel);
  const [botType, setBotType] = useState(chatbot?.botType);
  const [models, setModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>(
    chatbot && (chatbot?.prompt as string)
  );
  const router = useRouter();
  const { hasActiveMembership } = useSubcription();
  const [isPending, startTransiton] = useTransition();

  const handleUpdateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransiton(async () => {
      const promise = updateBotSettings(
        botType,
        selectedModel,
        getInfoBeforeChat,
        chatbot?.id,
        prompt
      );

      toast.promise(promise, {
        loading: "Updating bot settings...",
        success: `${chatbot?.name} Settings updated`,
        error: "error has occur while trying to update the bot settings",
      });
    });
  };
  const handleDropBot = async () => {
    const promise = deleteBot(chatbot?.sourceId!, chatbot);

    toast.promise(promise, {
      loading: `Deleting ${chatbot?.name}...`,
      success: `${chatbot?.name}  Deleted.`,
      error: "error has occur while trying to delete bot",
    });
    router.push("/view-chatbot");
  };
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/getModel");
        const data = await response.json();
        console.log("this is data", data?.modelOptions);
        setModels(data?.modelOptions);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
    console.log("this is model", models);
  }, [chatbot, hasActiveMembership]);

  return (
    <div className='border border-gray-300 rounded-md p-5 md:p-7 lg:p-7 h-full max-w-5xl mx-auto bg-white'>
      <h3 className='text-2xl pb-4 font-thin'>Bot Settings</h3>
      <div className='grid lg:grid-cols-5 h-full rounded-lg gap-5'>
        <form
          onSubmit={handleUpdateForm}
          className='col-span-5 lg:col-span-5 space-y-4'
        >
          <div className='pb-2'>
            <h3 className='font-bold text-lg'>Select ChatGPT Model</h3>
            <h5 className='pb-2'>
              Choose the ChatGPT model that best fits your chatbot's purpose.
              Each model offers different capabilities.
            </h5>
            <div className='bg-gray-200/50 p-3 rounded-md'>
              <Select
                defaultValue={selectedModel}
                onValueChange={(model) => {
                  if (
                    hasActiveMembership === "STANDARD" &&
                    model.includes("gpt-4")
                  ) {
                    alert("GPT-4 models are not allowed for basic users.");
                    return;
                  } else {
                    setSelectedModel(model);
                  }
                }}
              >
                <SelectTrigger className='p-3 w-full'>
                  <SelectValue placeholder='Choose a model' />
                </SelectTrigger>
                <SelectContent>
                  {models && models?.length > 0 ? (
                    <>
                      {models.map((model: any) => (
                        <SelectItem
                          disabled={
                            hasActiveMembership === "STANDARD" &&
                            model?.value?.includes("gpt-4")
                          }
                          className={`${
                            (hasActiveMembership === "STANDARD" &&
                              model.label.includes("gpt-4")) ||
                            model.label.includes("chat-4")
                              ? "text-gray-500"
                              : ""
                          }`}
                          key={model?.value}
                          value={model?.value}
                        >
                          {model?.label}
                        </SelectItem>
                      ))}
                    </>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h3 className='font-bold text-lg'>Choose Your Bot Type</h3>
            <h5 className='pb-2'>
              Select the most suitable bot for your needs. Whether you're
              setting up a Sales Bot to engage with customers or a Chatbot that
              interacts via PDF documents, this choice will determine how your
              chatbot will serve your clients.
            </h5>
            <div className='bg-gray-200/50 p-3 rounded-md'>
              <Select
                defaultValue={botType}
                onValueChange={(bot) => {
                  if (
                    (hasActiveMembership === "STANDARD" ||
                      hasActiveMembership === "PRO") &&
                    bot === "Custom"
                  ) {
                    alert("Customize prompt is not allowed for basic users.");
                    return;
                  }
                  setBotType(bot as botType);
                }}
              >
                <SelectTrigger className='p-3 w-full'>
                  <SelectValue placeholder='Choose a bot type that fits your needs' />
                </SelectTrigger>
                <SelectContent>
                  {botTypeData?.map((bot) => (
                    <SelectItem
                      key={bot?.value}
                      value={bot?.value}
                      disabled={
                        (hasActiveMembership === "STANDARD" ||
                          hasActiveMembership === "PRO") &&
                        bot.value === "Custom"
                      }
                      className={`${
                        (hasActiveMembership === "STANDARD" ||
                          hasActiveMembership === "PRO") &&
                        bot.value === "Custom"
                          ? "text-gray-500 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {bot?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {botType === "Custom" && (
            <div>
              <h3 className='font-bold text-lg'>Customize GPT Prompt</h3>
              <div className='bg-gray-200/50 p-3 rounded-md'>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='Enter your customization...'
                  className='w-full h-24 p-3 rounded-md border-gray-300'
                />
              </div>
            </div>
          )}

          <div className='pb-2'>
            <h3 className='font-bold text-lg'>Collect Client Information</h3>
            <h5 className='pb-2'>
              Would you like to gather client details before starting the chat?
            </h5>

            <div className='flex items-center justify-between space-x-4 border p-3 rounded-md '>
              <Label htmlFor='use-own-key'>
                Enable a dialog to request client information before initiating
                the conversation.
              </Label>

              <Switch
                disabled={hasActiveMembership === "STANDARD"}
                id='get-info-before-chat'
                checked={getInfoBeforeChat}
                onCheckedChange={setGetInfoBeforeChat}
              />
            </div>
          </div>

          <div className=' bg-gray-200/50 p-3 rounded-md'>
            <Card
              onClick={() => {
                if (hasActiveMembership !== "STANDARD") {
                  handleDropBot();
                }
              }}
              className={`${
                hasActiveMembership === "STANDARD"
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              } border border-red-500 hover:bg-gray-200/50 hover:border-red-500  group`}
            >
              <CardHeader>
                <CardTitle className='text-black font-bold group-hover:text-red-500'>
                  Delete Chatbot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-500'>
                  Deleting this chatbot is an irreversible action. All
                  associated data and conversations will be permanently removed.
                </p>
              </CardContent>
            </Card>
          </div>
          <Button
            disabled={isPending}
            type='submit'
            className='w-full items-center justify-center bg-gray-200/50 text-black hover:text-white hover:bg-black'
          >
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
