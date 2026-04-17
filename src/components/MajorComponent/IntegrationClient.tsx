"use client";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BadgeCheckIcon,
  CheckCheckIcon,
  CheckCircle2,
  Key,
  Mail,
  MailCheck,
  Send,
  Settings2,
} from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { createMailOptions } from "@/actions/mailOption";
import useSubcription from "@/hook/useSubscription";
import useSWR from "swr";
import { getUserById, updateKey } from "@/actions/user";
import { useAuth, useUser } from "@clerk/nextjs";
import whatsapp from "../../../public/WhatsApp.png";
import Image from "next/image";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
import openai_logo from "../../../public/openai_logo.svg";
import deepseek from "../../../public/deepseek_logo.png";
import IntegrationObject from "../IntegrationObject";
import anthropic_logo from "../../../public/anthropic.png";
import xai_logo from "../../../public/grok.png";
import WhatsAppComponent from "../WhatsappComponent";
type IntegrationOption = {
  name: string;
  icon: React.ReactNode;
  steps: string[];
};
interface FacebookSDK {
  init: (config: { appId: string; version: string }) => void;
  login: (callback: (response: any) => void, config: { scope: string }) => void;
}
declare global {
  interface Window {
    FB: FacebookSDK;
  }
}

const integrationOptions: IntegrationOption[] = [
  {
    name: "Mail",
    icon: <Mail className='h-10 w-10 text-red-500' />,
    steps: [
      "Sign in to your Google account",
      "Allow access to your Gmail",
      "Configure email sync settings",
      "Verify the connection",
    ],
  },
];

const IntegrationClient = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { userId } = useAuth();
  const {
    data: MailData,
    mutate,
    isLoading,
  } = useSWR(
    userId ? `/api/getUser/${userId}` : null,
    async () => await getUserById(userId as string)
  );
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    userEmail: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    userEmail: "",
    port: "",
    password: "",
  });

  const [aiKey, setAiKey] = useState({
    openAiKey: "",
    deepseekAiKey: "",
    anthropicKey: "",
    xaiKey: "",
  });

  const [useAiKey, setUseAiKey] = useState({
    useDeepseekAiKey: false,
    useOpenaiKey: false,
    useAnthropicKey: false,
    useXaiKey: false,
  });

  const [isOpenai, startAddingOpenai] = useTransition();
  const [isDeepseek, startAddingDeepseekai] = useTransition();
  const [isAnthropic, startAddingAnthropicAi] = useTransition();
  const [isXai, startAddingXai] = useTransition();
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value === "true" ? true : false,
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Email validation
    if (!formData.userEmail) {
      newErrors.userEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.userEmail)) {
      newErrors.userEmail = "Invalid email format";
    }

    // Port validation
    if (!formData.port) {
      newErrors.port = "Port is required";
    } else if (formData.port < 1 || formData.port > 65535) {
      newErrors.port = "Invalid port number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const configure = MailData?.mailId;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        startTransition(async () => {
          const response = await createMailOptions(formData);

          if (response?.success) {
            alert("Mail configuration saved successfully!");
            setIsOpen(false);
            await mutate();
          } else {
            throw new Error(`Error: error has occured`);
          }
        });
      } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred while saving configuration");
      }
    }
  };

  const handleOpenaiKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return;

    startAddingOpenai(async () => {
      const promise = updateKey(
        aiKey?.openAiKey,
        useAiKey?.useOpenaiKey,
        "openai"
      );
      // setUseOpenaiKey(false);
      setUseAiKey((value) => ({ ...value, useOpenaiKey: false }));
      mutate();
      toast.promise(promise, {
        loading: "Updating Account with your own OpenAI key...",
        success: "OpenAi key connected to your account.",
        error: "Error occurs while trying to update your own openai key",
      });
    });
  };

  const handleDeepseekaiKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startAddingDeepseekai(async () => {
      const promise = updateKey(
        aiKey?.deepseekAiKey,
        useAiKey?.useDeepseekAiKey,
        "deekseekai"
      );
      setUseAiKey((value) => ({ ...value, useDeepseekAiKey: false }));
      mutate();

      toast.promise(promise, {
        loading: "Updating Account with your own DeepSeek key...",
        success: "Deepseek key connected to your account.",
        error: "Error occurs while trying to update your own deepseek key",
      });
    });
  };

  const handleAnthropicKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startAddingAnthropicAi(async () => {
      const promise = updateKey(
        aiKey?.anthropicKey,
        useAiKey?.useAnthropicKey,
        "anthropicai"
      );
      setUseAiKey((value) => ({ ...value, useAnthropicKey: false }));
      mutate();

      toast.promise(promise, {
        loading: "Updating Account with your own Anthropic key...",
        success: "Anthropic key connected to your account.",
        error: "Error occurs while trying to update your own Anthropic key",
      });
    });
  };

  const handleXaiKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startAddingXai(async () => {
      const promise = updateKey(aiKey?.xaiKey, useAiKey?.useXaiKey, "xai");
      setUseAiKey((value) => ({ ...value, useXaiKey: false }));
      mutate();

      toast.promise(promise, {
        loading: "Updating Account with your own Anthropic key...",
        success: "Anthropic key connected to your account.",
        error: "Error occurs while trying to update your own Anthropic key",
      });
    });
  };
  useEffect(() => {
    if (!userId) return;
    const fetchUserOpenAiKey = async () => {
      const data = await getUserById(userId!);
      if (data?.openAikey !== null) {
        // setUseOpenaiKey(true);
        setAiKey((value) => ({ ...value, openAiKey: data?.openAikey! }));
      }
      if (data?.deekseekAikey !== null) {
        setAiKey((value) => ({
          ...value,
          deepseekAiKey: data?.deekseekAikey!,
        }));
      }

      if (data?.anthropicAikey !== null) {
        setAiKey((value) => ({
          ...value,
          anthropicKey: data?.anthropicAikey!,
        }));
      }

      if (data?.xaiKey !== null) {
        setAiKey((value) => ({
          ...value,
          xaiKey: data?.xaiKey!,
        }));
      }
    };
    fetchUserOpenAiKey();
  }, [userId]);

  const configureWhatsApp = false;
  // //   pnel rtsi wnmi qhss

  return (
    <div className='mt-20 h-full space-y-4 w-full md:max-w-3xl md:mx-auto lg:max-w-5xl lg:mx-auto p-5'>
      <header className='mb-5'>
        <h1 className='text-4xl font-thin text-[#E1B177]'>Integrations</h1>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* {integrationOptions.map((option) => ( */}

        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4'>
              <Mail className='h-10 w-10 text-red-500' />
            </div>
            <CardTitle>Mail</CardTitle>
            <CardDescription>
              Integration with popular email services like Gmail and custom
              Domain SMTP servers
            </CardDescription>
            {configure ? (
              <CardDescription>
                Configured with{" "}
                <span className='text-green-700'>{MailData?.email}</span>
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className='flex justify-center'>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <div className='flex items-center '>
                {configure ? (
                  <BadgeCheckIcon className='fill-green-500 text-green-100 h-8 w-8' />
                ) : (
                  <DialogTrigger asChild>
                    <Button
                      className=' bg-black/70  dark:bg-gray-900 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:text-gray-200  '
                      onClick={() => setIsOpen(true)}
                    >
                      Connect
                    </Button>
                  </DialogTrigger>
                )}
                <DialogTrigger className='ml-3'>
                  {configure ? (
                    <Button variant='outline'>
                      <Settings2 />
                    </Button>
                  ) : null}
                </DialogTrigger>
              </div>

              <DialogContent>
                {/* <Card className="w-full max-w-md mx-auto"> */}
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Mail Configuration</DialogTitle>
                  </DialogHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <Label htmlFor='host'>SMTP Host</Label>
                      <Input
                        id='host'
                        name='host'
                        value={formData.host}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            host: e.target.value,
                          }));
                        }}
                        placeholder='Enter SMTP host'
                      />
                    </div>

                    <div>
                      <Label htmlFor='port'>Port</Label>
                      <Input
                        id='port'
                        name='port'
                        type='number'
                        value={formData.port}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            port: parseInt(e.target.value),
                          }));
                        }}
                        placeholder='Enter port number'
                      />
                      {errors.port && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.port}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor='secure'>Secure Connection</Label>
                      <Select
                        name='secure'
                        value={formData.secure.toString()}
                        onValueChange={(value) =>
                          handleSelectChange("secure", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select secure connection' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='true'>Yes</SelectItem>
                          <SelectItem value='false'>No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='userEmail'>User Email</Label>
                      <Input
                        id='userEmail'
                        name='userEmail'
                        type='email'
                        value={formData.userEmail}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            userEmail: e.target.value,
                          }))
                        }
                        placeholder='Enter your email'
                      />
                      {errors.userEmail && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.userEmail}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor='password'>Email Password</Label>
                      <Input
                        id='password'
                        name='password'
                        type='password'
                        value={formData.password}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        placeholder='Enter email password'
                      />
                      {errors.password && (
                        <p className='text-red-500 text-sm mt-1'>
                          {errors.password}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <DialogFooter>
                    <Button
                      disabled={isPending || !formData || isLoading}
                      type='submit'
                      className='w-full  bg-black/70  dark:bg-gray-900 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:text-gray-200'
                    >
                      {isPending ? "Saving..." : "Save Configuration"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
        {/* ))} */}

        {/* <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4'>
              <Image
                src={whatsapp}
                alt='whatsapp'
                width={100}
                height={100}
                className='h-10 w-10 text-red-500'
              />
            </div>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>
              Connect your chatbot to a WhatsApp number and let it respond to
              messages from your customers.
            </CardDescription>
            {configureWhatsApp ? (
              <CardDescription>
                <dt>
                  Assign to <span className='text-green-700'>Quiksbot</span>
                </dt>
                <dt>Goto chatbot connect to get share link</dt>
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className='flex justify-center'>
            {configureWhatsApp ? (
              <div></div>
            ) : (
              <Button
                disabled
                variant={"outline"}
                //  className=' bg-black/70  dark:bg-gray-900 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:text-gray-200  '
                // onClick={() => handleWhatsAppSdk()}
              >
                Coming soon
              </Button>
            )}
          </CardContent>
        </Card> */}

        <IntegrationObject
          handleKey={handleOpenaiKey}
          ImageSrc={openai_logo}
          label='Openai'
          useCustomKey={useAiKey?.useOpenaiKey!}
          // setUseCustomKey={setUseOpenaiKey}
          setUseCustomKey={(value) =>
            setUseAiKey((prev) => ({ ...prev, useOpenaiKey: value }))
          }
          apiKey={aiKey?.openAiKey}
          setApiKey={(value) =>
            setAiKey((prev) => ({ ...prev, openAiKey: value }))
          }
          userPrevKey={MailData?.openAikey as string}
          formTransition={isOpenai}
        />

        <IntegrationObject
          handleKey={handleDeepseekaiKey}
          ImageSrc={deepseek as any}
          label='DeepSeek'
          useCustomKey={useAiKey?.useDeepseekAiKey}
          setUseCustomKey={(value) =>
            setUseAiKey((prev) => ({ ...prev, useDeepseekAiKey: value }))
          }
          apiKey={aiKey?.deepseekAiKey}
          setApiKey={(value) =>
            setAiKey((prev) => ({ ...prev, deepseekAiKey: value }))
          }
          userPrevKey={MailData?.deekseekAikey as string}
          formTransition={isDeepseek}
        />

        <IntegrationObject
          handleKey={handleAnthropicKey}
          ImageSrc={anthropic_logo as any}
          label='Anthropic'
          useCustomKey={useAiKey?.useAnthropicKey}
          setUseCustomKey={(value) =>
            setUseAiKey((prev) => ({ ...prev, useAnthropicKey: value }))
          }
          apiKey={aiKey?.anthropicKey}
          setApiKey={(value) =>
            setAiKey((prev) => ({ ...prev, anthropicKey: value }))
          }
          userPrevKey={MailData?.anthropicAikey as string}
          formTransition={isAnthropic}
        />

        <IntegrationObject
          handleKey={handleXaiKey}
          ImageSrc={xai_logo as any}
          label='Grok'
          useCustomKey={useAiKey?.useXaiKey}
          setUseCustomKey={(value) =>
            setUseAiKey((prev) => ({ ...prev, useXaiKey: value }))
          }
          apiKey={aiKey?.xaiKey}
          setApiKey={(value) =>
            setAiKey((prev) => ({ ...prev, xaiKey: value }))
          }
          userPrevKey={MailData?.xaiKey as string}
          formTransition={isXai}
        />
      </div>
    </div>
  );
};
export default IntegrationClient;
