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
import { botTypeData } from "../../../constant/Features";
import { toast } from "sonner";
import { adjustBotType, updateBotSettings } from "@/actions/customer";
import { deleteBot } from "@/actions/bot";
import { redirect, useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AvailabilityCalender from "../AvailibilityCalender";

import { useUser } from "@clerk/nextjs";

function SettingsPage({ chatbot }: { chatbot: any }) {
  const [getInfoBeforeChat, setGetInfoBeforeChat] = useState<boolean>(
    chatbot?.getDetails || false,
  );
  const { user } = useUser();
  const [liveAgent, setLiveAgent] = useState<boolean>(
    chatbot?.liveAgent || false,
  );
  const [selectedModel, setSelectedModel] = useState(chatbot?.chatModel);
  const [botType, setBotType] = useState(chatbot?.botType);
  const [models, setModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<string>(
    chatbot && (chatbot?.prompt as string),
  );
  const router = useRouter();
  const { hasActiveMembership, loading } = useSubcription();
  const [isPending, startTransiton] = useTransition();
  const [openModel, setOpenModel] = useState(false);

  const handleUpdateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransiton(async () => {
      if (
        !hasActiveMembership ||
        (hasActiveMembership === "STANDARD" &&
          (selectedModel?.includes("gpt-4") ||
            selectedModel.includes("claude") ||
            selectedModel?.includes("grok"))) ||
        selectedModel?.includes("deepseek")
      )
        return;

      const promise = updateBotSettings(
        selectedModel,
        getInfoBeforeChat,
        chatbot?.id,
        liveAgent,
      );

      toast.promise(promise, {
        loading: "Settings gpt model & get client details...",
        success: `${chatbot?.name} Settings updated`,
        error: "error has occur while trying to update the bot settings",
      });
    });
  };

  const handleBotType = async (newBotType: string) => {
    const promise = adjustBotType(newBotType, chatbot?.id);

    toast.promise(promise, {
      loading: "Setting chatbot type...",
      success: `${newBotType} Updated.`,
      error: "error has occur while trying to update bot types!",
    });
  };

  const handleDropBot = async () => {
    if (!hasActiveMembership || hasActiveMembership === "STANDARD") {
      alert("Please upgrade your plan to manage your chatbot...");
      return;
    }
    const fetch = deleteBot(chatbot?.sourceId!, chatbot);

    toast.promise(fetch, {
      loading: `Deleting ${chatbot?.name}...`,
      success: `${chatbot?.name}  Deleted.`,
      error: "error has occur while trying to delete bot",
    });
    setOpenModel(false);

    const result = await fetch;

    if (result.completed) {
      router.push("/dashboard");
    }
  };
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/getModel");
        const data = await response.json();

        setModels(data?.modelOptions);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, [chatbot, hasActiveMembership]);

  return (
    <div>
      <Dialog open={openModel} onOpenChange={(open) => setOpenModel(open)}>
        <DialogContent className='sm:max-w-md bg-white dark:bg-gray-900'>
          <DialogHeader className='text-[#E1B177]'>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to permanently
              delete this {chatbot?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className='flex items-center space-x-2'>
            <Button
              className=' w-full text-gray-500 bg-gray-100 dark:bg-transparent hover:bg-black hover:text-white  '
              onClick={() => setOpenModel(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDropBot()}
              // variant='destructive'
              className='px-3 w-full bg-red-500 hover:bg-red-300 '
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className='border border-gray-300 rounded-md p-5 md:p-7 lg:p-7 h-full max-w-5xl mx-auto bg-white dark:bg-gray-900'>
        <h3 className='text-2xl pb-4 font-thin'>Bot Settings</h3>
        <div className='grid lg:grid-cols-5 h-full rounded-lg gap-5'>
          <form
            onSubmit={handleUpdateForm}
            className='col-span-5 lg:col-span-5 space-y-4 border p-4 rounded-md'
          >
            <div className='pb-2'>
              <h3 className='font-bold text-lg'>Select AI Model</h3>
              <h5 className='pb-2'>
                Choose the AI model that best fits your chatbot&#39;s purpose.
                Each model offers different capabilities.
              </h5>
              <div className='bg-gray-200/50 p-3 rounded-md dark:bg-gray-950'>
                <Select
                  defaultValue={selectedModel}
                  onValueChange={(model) => {
                    if (
                      hasActiveMembership === "STANDARD" &&
                      (model.includes("gpt-4") ||
                        model.includes("claude") ||
                        model.includes("grok") ||
                        model?.includes("deepseek"))
                    ) {
                      alert(
                        "GPT-4 | claude models are not allowed for basic users.",
                      );
                      return;
                    } else {
                      setSelectedModel(model);
                    }
                  }}
                >
                  <SelectTrigger className='p-3 w-full dark:bg-gray-900'>
                    <SelectValue placeholder='Choose a model' />
                  </SelectTrigger>
                  <SelectContent>
                    {hasActiveMembership && models && models?.length > 0 ? (
                      <>
                        {models.map((model: any) => (
                          <SelectItem
                            disabled={
                              hasActiveMembership === "STANDARD" &&
                              (model?.value?.includes("gpt-4") ||
                                model?.value?.includes("claude") ||
                                model?.label?.includes("grok") ||
                                model?.label?.includes("deepseek"))
                            }
                            className={`${
                              hasActiveMembership === "STANDARD" &&
                              (model.label.includes("gpt-4") ||
                                model.label.includes("claude") ||
                                model?.label?.includes("grok") ||
                                model?.label?.includes("deepseek"))
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
                    ) : (
                      <p className='p-2'>Loading...</p>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {botType === "Custom" && (
              <div>
                <h3 className='font-bold text-lg'>Customize GPT Prompt</h3>
                <div className='bg-gray-200/50 p-3 rounded-md dark:bg-gray-900'>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='Enter your customization...'
                    className='w-full h-24 p-3 rounded-md border-gray-300 dark:bg-gray-900 '
                  />
                </div>
              </div>
            )}

            <div className='pb-2 '>
              <h3 className='font-bold text-lg'>Collect Client Information</h3>
              <h5 className='pb-2'>Would you like to gather client details?</h5>

              <div className='flex items-center justify-between space-x-4 border p-3 rounded-md dark:bg-gray-900'>
                <Label htmlFor='use-own-key'>
                  Enable a form for client information before initiating the
                  conversation.
                </Label>
                {hasActiveMembership === "STANDARD" && (
                  <Label
                    htmlFor='use-custom-key'
                    className='flex items-center gap-2 text-red-100'
                  >
                    Only users with PRO tier.
                  </Label>
                )}
                <Switch
                  disabled={hasActiveMembership === "STANDARD"}
                  id='get-info-before-chat'
                  checked={getInfoBeforeChat}
                  onCheckedChange={setGetInfoBeforeChat}
                />
              </div>
            </div>

            <div className='pb-2'>
              <div className='mb-4'>
                <h3 className='font-bold text-lg mb-2'>Live Agent Transfer</h3>
                <p className='text-muted-foreground text-sm'>
                  Configure automatic escalation to human support
                </p>
              </div>

              <div className='flex items-center justify-between space-x-4 border p-4 rounded-md bg-card'>
                <div className='space-y-1 max-w-[85%]'>
                  <Label htmlFor='live-agent-transfer' className='text-base'>
                    Automated Conversation Escalation
                  </Label>
                  <div className='text-sm text-muted-foreground'>
                    Enable automatic transfer to live agents when:
                    <ul className='list-disc pl-7 mt-1 space-y-1'>
                      <li>Conversation complexity exceeds AI capabilities</li>
                      <li>User frustration is detected</li>
                      <li>Specific keywords or requests are identified</li>
                    </ul>
                  </div>
                </div>
                {hasActiveMembership === "STANDARD" && (
                  <Label
                    htmlFor='use-custom-key'
                    className='flex items-center gap-2 text-red-100'
                  >
                    Only users with PRO tier.
                  </Label>
                )}
                <Switch
                  id='live-agent-transfer'
                  disabled={hasActiveMembership === "STANDARD"}
                  checked={liveAgent}
                  onCheckedChange={setLiveAgent}
                  aria-label='Toggle live agent transfer functionality'
                />
              </div>
            </div>

            <Button
              disabled={isPending}
              type='submit'
              className='w-full dark:hover:bg-[#E1B177] hover:bg-[#E1B177] items-center justify-center bg-gray-200/50 text-black hover:text-white dark:bg-gray-950 dark:text-gray-400 dark:hover:text-gray-200'
            >
              Save Changes
            </Button>
          </form>
        </div>

        <div className='p-2 py-4'>
          <h3 className='font-bold text-lg'>Choose Your Bot Type</h3>
          <h5 className='pb-2'>
            Choose the bot that best fits your needs. Whether it&#39;s a Sales
            Bot to engage customers, a Services Bot for inquiries, or a Support
            Bot for tickets, this decision shapes how your chatbot will serve
            clients.
          </h5>
          <div className='bg-gray-200/50 p-3 rounded-md dark:bg-gray-950'>
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

                handleBotType(bot);
                setBotType(bot);
              }}
            >
              <SelectTrigger className='p-3 w-full dark:bg-gray-900'>
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
          {botType === "Appointment" && (
            <AvailabilityCalender id={chatbot?.id} />
          )}
        </div>

        <div className=' bg-gray-200/50 p-3 rounded-md dark:bg-gray-900 mt-2'>
          <Card
            onClick={() => {
              setOpenModel(true);
            }}
            className={`${
              hasActiveMembership === "STANDARD"
                ? "cursor-not-allowed"
                : "cursor-pointer"
            } border border-red-500  hover:bg-gray-200/50 hover:border-red-500 group dark:bg-gray-950 dark:hover:text-red-500 dark:text-gray-400`}
          >
            <CardHeader>
              <CardTitle className='text-black font-bold group-hover:text-red-500 dark:text-gray-400'>
                Delete Chatbot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-500 '>
                Deleting this chatbot is an irreversible action. All associated
                data and conversations will be permanently removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
