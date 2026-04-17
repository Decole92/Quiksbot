import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Image from "next/image";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import useSubcription from "@/hook/useSubscription";
import deepseek_logo from "../../public/deepseek_logo.png";
import { BadgeCheckIcon, CheckCheck, Key } from "lucide-react";

type ObjectTypes = {
  handleKey: (e: React.FormEvent<HTMLFormElement>) => void;
  ImageSrc: string;
  label: string;
  useCustomKey: boolean;
  setUseCustomKey: (value: boolean) => void;
  apiKey: string;
  setApiKey: (value: string) => void;
  userPrevKey: string;
  formTransition: boolean;
};
function IntegrationObject({
  handleKey,
  ImageSrc,
  label,
  useCustomKey,
  setUseCustomKey,
  apiKey,
  setApiKey,
  userPrevKey,
  formTransition,
}: ObjectTypes) {
  const { hasActiveMembership } = useSubcription();

  return (
    <form onSubmit={handleKey} className='w-full '>
      <Card className='dark:bg-gray-900 dark:text-gray-400 hover:shadow-lg  transition-shadow'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4'>
            <Image
              alt={ImageSrc}
              src={ImageSrc}
              height={50}
              width={50}
              className={`${
                label?.includes("Grok") ? "invert dark:invert-0" : null
              } ${
                label?.includes("Anthropic") || label?.includes("Openai")
                  ? "dark:invert"
                  : null
              }`}
            />
          </div>
          <CardTitle>{label} API</CardTitle>

          <CardDescription>
            Configure your {label} API key settings.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col  items-center gap-2'>
            <Label htmlFor='use-custom-key' className='flex items-center gap-2'>
              Use Own API Key to enjoy our features without any limitation or
              restriction
            </Label>

            {hasActiveMembership !== "ULTIMATE" && (
              <Label
                htmlFor='use-custom-key'
                className='flex items-center gap-2 text-red-100'
              >
                Only users with ULTIMATE tier.
              </Label>
            )}

            <div className='flex flex-row items-center justify-between gap-2'>
              {userPrevKey ? (
                <BadgeCheckIcon className='fill-green-500 text-green-100 h-8 w-8 flex-1' />
              ) : null}
              <Switch
                disabled={hasActiveMembership !== "ULTIMATE"}
                id={label + "use-custom-key"}
                checked={useCustomKey}
                onCheckedChange={setUseCustomKey}
              />
            </div>
          </div>
          {useCustomKey && (
            <div className='space-y-2'>
              <Label htmlFor='openai-key'>Paste Your {label} API Key </Label>
              <Input
                disabled={hasActiveMembership !== "ULTIMATE"}
                id={label + "key"}
                type='password'
                placeholder='sk-xxxxxxx'
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className='w-full items-center'>
          {useCustomKey ? (
            <Button
              type='submit'
              // disabled={hasActiveMembership !== "ULTIMATE" || formTransition}
              className='w-full bg-gray-200/50 hover:bg-[#E1B177] dark:hover:bg-[#E1B177] dark:hover:text-gray-200 text-gray-700 dark:bg-gray-950 hover:text-gray-100'
            >
              Save API Key Settings
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </form>
  );
}

export default IntegrationObject;
