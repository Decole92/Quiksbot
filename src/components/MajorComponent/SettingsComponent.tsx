"use client";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, Key, Moon, Settings, Sun, SunMoon } from "lucide-react";
import Link from "next/link";
import useSubcription from "@/hook/useSubscription";
import { createStripePortal } from "@/actions/stripe";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";

import { toast } from "sonner";
import { getUserById, updateOpenAiKey } from "@/actions/user";
import { useTheme } from "next-themes";

export default function SettingsPageClient() {
  const [openAIKey, setOpenAIKey] = useState("");
  const [useCustomKey, setUseCustomKey] = useState(false);
  const { hasActiveMembership } = useSubcription();
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const router = useRouter();
  const { setTheme } = useTheme();

  const handleUpgrade = async () => {
    if (!user) return;
    if (hasActiveMembership === "PRO" || hasActiveMembership === "ULTIMATE") {
      try {
        const stripePortal = await createStripePortal();
        router.push(stripePortal);
      } catch (error) {
        console.error("Error creating Stripe portal:", error);
      }
    } else {
      router.push("/pricing");
    }
  };

  const handleOpenaiKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    startTransition(async () => {
      const promise = updateOpenAiKey(openAIKey, useCustomKey);
      toast.promise(promise, {
        loading: "Updating Account with your own OpenAI key...",
        success: "OpenAi key connected to your account.",
        error: "Error occurs while trying to update your own openai key",
      });
    });
  };

  useEffect(() => {
    if (!user?.id) return;
    const fetchUserOpenAiKey = async () => {
      const data = await getUserById(user?.id!);
      if (data?.openAikey !== null) {
        setUseCustomKey(true);
      }
      setOpenAIKey(data?.openAikey!);
    };
    fetchUserOpenAiKey();
  }, [user]);
  return (
    <div className='container w-full py-10 md:max-w-3xl md:mx-auto lg:max-w-5xl lg:mx-auto mt-20 '>
      <header className='mb-5'>
        <h1
          className='text-4xl font-thin text-[#E1B177]
'
        >
          Settings
        </h1>
      </header>

      <div className='space-y-10'>
        <form onSubmit={handleOpenaiKey}>
          <Card className='dark:bg-gray-900 dark:text-gray-400'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Key className='h-5 w-5' />
                OpenAI API Key
              </CardTitle>
              <CardDescription>
                Configure your OpenAI API key settings.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
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
            <CardFooter>
              <Button
                type='submit'
                disabled={
                  hasActiveMembership !== "ULTIMATE" || isPending || !openAIKey
                }
                className='bg-gray-200/50 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:hover:text-gray-200 text-gray-700 dark:bg-gray-950 hover:text-gray-100'
              >
                Save API Key Settings
              </Button>
            </CardFooter>
          </Card>
        </form>
        <Card className='dark:bg-gray-900 dark:text-gray-400'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Payment Management
            </CardTitle>
            <CardDescription>
              Manage your subscription and payment methods.
            </CardDescription>
          </CardHeader>
          {/* Pro Plan - $19.99/month */}
          <CardContent className='space-y-4'>
            <div className='flex justify-between items-center'>
              <div>
                <h3 className='font-semibold'>Current Plan</h3>
                <p className='text-sm text-muted-foreground'>
                  {hasActiveMembership === "STANDARD"
                    ? "Free"
                    : hasActiveMembership === "PRO"
                    ? "Pro Plan - $49.99"
                    : "Ultimate - $99.99"}
                </p>
              </div>
              <Button
                // disabled={isPending}
                onClick={handleUpgrade}
                className='bg-gray-200/50 text-gray-700 dark:text-gray-400 hover:bg-[#E1B177] dark:bg-gray-950 dark:hover:bg-[#E1B177]  dark:hover:text-gray-200'
              >
                {hasActiveMembership === "PRO" ||
                hasActiveMembership === "ULTIMATE"
                  ? "Manage Plan"
                  : "Upgrade to Plan"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className='flex justify-end'>
            <Link
              href='/pricing'
              className='border px-3 py-2 rounded-md bg-gray-200/50 dark:bg-gray-950 dark:hover:bg-[#E1B177] text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-[#E1B177] hover:text-gray-100 '
            >
              View Pricing
            </Link>
          </CardFooter>
        </Card>

        <Card className='dark:bg-gray-900 dark:text-gray-400'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              Other Settings
            </CardTitle>
            <CardDescription>
              Additional account settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='dark-mode' className='flex items-center gap-2'>
                Theme interface mode
              </Label>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon'>
                    <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
                    <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
                    <span className='sr-only'>Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
