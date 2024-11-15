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
import { getUserById, updateOpenAiKey } from "@/actions/user";
import { useAuth, useUser } from "@clerk/nextjs";
import whatsapp from "../../../public/WhatsApp.png";
import Image from "next/image";
import { toast } from "sonner";
import { Switch } from "../ui/switch";
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
  const [openAIKey, setOpenAIKey] = useState("");
  const [useCustomKey, setUseCustomKey] = useState(false);
  const { hasActiveMembership } = useSubcription();
  const [isOpenai, startAddingOpenai] = useTransition();

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
    console.log("this is here");
    if (validateForm()) {
      console.log("this is here inside validateform");
      try {
        startTransition(async () => {
          const response = await createMailOptions(formData);

          if (response?.success) {
            alert("Mail configuration saved successfully!");
            setIsOpen(false);
            await mutate();
          } else {
            // const errorData = await response?.json();
            alert(`Error: error has occured`);
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
      const promise = updateOpenAiKey(openAIKey, useCustomKey);
      toast.promise(promise, {
        loading: "Updating Account with your own OpenAI key...",
        success: "OpenAi key connected to your account.",
        error: "Error occurs while trying to update your own openai key",
      });
    });
  };

  useEffect(() => {
    if (!userId) return;
    const fetchUserOpenAiKey = async () => {
      const data = await getUserById(userId!);
      if (data?.openAikey !== null) {
        setUseCustomKey(true);
      }
      setOpenAIKey(data?.openAikey!);
    };
    fetchUserOpenAiKey();
  }, [userId]);

  const configureWhatsApp = false;
  //   pnel rtsi wnmi qhss

  const handleWhatsAppSdk = async () => {
    const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    const redirectUri = `${window.location.origin}/whatsapp/callback`;
    const facebookAuthUrl = `https://www.facebook.com/v16.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${redirectUri}&scope=whatsapp_business_management,whatsapp_business_messaging`;

    window.location.href = facebookAuthUrl;
  };

  return (
    <div className='mt-20 h-full space-y-4 w-full md:max-w-3xl md:mx-auto lg:max-w-5xl lg:mx-auto p-5'>
      <header className='mb-5'>
        <h1 className='text-4xl font-thin text-[#E1B177]'>Integrations</h1>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <form
          onSubmit={handleOpenaiKey}
          className='w-full hover:shadow-lg transition-shadow'
        >
          <Card className='dark:bg-gray-900 dark:text-gray-400 '>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4'>
                <Key className='h-10 w-10 text-black-500' />
              </div>
              <CardTitle>OpenAI API</CardTitle>

              <CardDescription>
                Configure your OpenAI API key settings.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-col  items-center gap-2'>
                <Label
                  htmlFor='use-custom-key'
                  className='flex items-center gap-2'
                >
                  Use Own API Key to enjoy our features without any limitation
                  or restriction
                </Label>
                {hasActiveMembership !== "ULTIMATE" && (
                  <Label
                    htmlFor='use-custom-key'
                    className='flex items-center gap-2 text-red-100'
                  >
                    Only users with ULTIMATE tier.
                  </Label>
                )}
                <Switch
                  disabled={hasActiveMembership !== "ULTIMATE"}
                  id='use-custom-key'
                  checked={useCustomKey}
                  onCheckedChange={setUseCustomKey}
                />
              </div>
              {useCustomKey && (
                <div className='space-y-2'>
                  <Label htmlFor='openai-key'>Enter your OpenAI API </Label>
                  <Input
                    disabled={hasActiveMembership !== "ULTIMATE"}
                    id='openai-key'
                    type='password'
                    placeholder='sk-xxxxxxx'
                    value={openAIKey}
                    onChange={(e) => setOpenAIKey(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className='w-full items-center'>
              <Button
                type='submit'
                disabled={
                  hasActiveMembership !== "ULTIMATE" || isOpenai || !openAIKey
                }
                className='w-full bg-gray-200/50 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:hover:text-gray-200 text-gray-700 dark:bg-gray-950 hover:text-gray-100'
              >
                Save API Key Settings
              </Button>
            </CardFooter>
          </Card>
        </form>

        {/* {integrationOptions.map((option) => ( */}
        <Card className='hover:shadow-lg transition-shadow'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4'>
              <Mail className='h-10 w-10 text-red-500' />
            </div>
            <CardTitle>Mail</CardTitle>
            <CardDescription>
              Integrate with Gmail, Domain SMTP, etc{" "}
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

        <Card className='hover:shadow-lg transition-shadow'>
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
                // className=' bg-black/70  dark:bg-gray-900 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:text-gray-200  '
                // onClick={() => handleWhatsAppSdk()}
              >
                Coming soon
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default IntegrationClient;
