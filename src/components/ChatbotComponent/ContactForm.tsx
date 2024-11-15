"use client";
import React, { useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Send, User } from "lucide-react";
import { updateGuestDetails } from "@/actions/chat";
import { useGlobalStore } from "@/store/globalStore";

function ContactForm({ id }: { id: string }) {
  const [feedback, setFeedback] = useGlobalStore((state) => [
    state.feedback,
    state.setFeedback,
  ]);
  const [userDetails, setUserDetails] = useState({ name: "", email: "" });

  const [isPending, startTransition] = useTransition();
  const handleInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      await updateGuestDetails({ userDetails, id });
      setFeedback(true);
    });
  };
  // text-center text-sm text-gray-600 p-2 bg-transparent
  return (
    <Card className='w-full max-w-md  sm:max-w-[425px] '>
      <form onSubmit={handleInfoSubmit}>
        {feedback ? (
          <div className='bg-gray-200 shadow-md p-3 rounded-md'>
            <h4>
              Thank you {userDetails?.name}, We will get back to you soon.
            </h4>
          </div>
        ) : (
          <div className='shadow-sm  dark:bg-gray-950'>
            <CardHeader className='space-y-1'>
              <CardTitle className='text-xl font-bold text-center'>
                Contact Us
              </CardTitle>
              <CardDescription className='text-center text-xs text-gray-600'>
                Please fill in your details , We&#39;ll get back to you shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name' className='text-sm font-medium'>
                    Name
                  </Label>
                  <div className='relative'>
                    <Input
                      id='name'
                      placeholder='Enter your name'
                      value={userDetails.name}
                      onChange={(e) =>
                        setUserDetails((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      className='pl-10'
                    />
                    <User
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                      size={18}
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email' className='text-sm font-medium'>
                    Email
                  </Label>
                  <div className='relative'>
                    <Input
                      id='email'
                      type='email'
                      placeholder='Enter your email'
                      value={userDetails.email}
                      onChange={(e) =>
                        setUserDetails((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                      className='pl-10'
                    />
                    <Mail
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                      size={18}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-[#E1B177] to-[#E1B177]/50 hover:bg-transparent transition-all duration-200 hover:text-gray-100'
                disabled={isPending || !userDetails}
              >
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Submiting...
                  </>
                ) : (
                  <>
                    <Send className='mr-2 h-4 w-4' />
                    Submit
                  </>
                )}
              </Button>
            </CardFooter>
          </div>
        )}
      </form>
    </Card>
  );
}

export default ContactForm;
