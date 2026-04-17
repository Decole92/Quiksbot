"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BASE_URL } from "../../../constant/url";

export default function Banner() {
  const targetDate = new Date("2025-05-30T00:00:00").getTime(); // Replace with your target date
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetDate - now;
      return difference > 0 ? Math.floor(difference / 1000) : 0; // Time in seconds
    };

    // Set initial timeLeft once the component is mounted
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (time: number) => {
    const days = Math.floor(time / (24 * 3600));
    const hours = Math.floor((time % (24 * 3600)) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };
  return (
    <div className='relative h-8 overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white'>
      <div className='absolute inset-0 bg-gradient-to-r from-teal-400/20 via-purple-400/20 to-rose-400/20'></div>
      <div className='relative h-full max-w-7xl mx-auto px-4 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <AlertTriangle className='w-4 h-4 text-amber-300 animate-pulse' />
          <span className='text-xs font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-400'>
            PROMO
          </span>
        </div>
        <div className='text-xs font-bold bg-gradient-to-r from-teal-400 via-purple-400 to-rose-400 text-transparent bg-clip-text animate-pulse'>
          UP TO 50% OFF
        </div>
        <div className='flex items-center space-x-2'>
          <span className='text-xs font-mono hidden sm:block '>
            {timeLeft !== null ? formatTime(timeLeft) : "Loading..."}
          </span>
          <Link href={`${BASE_URL}/pricing`}>
            <Button
              size='sm'
              variant='ghost'
              className='h-6 px-2 text-xs text-amber-300 hover:text-amber-100 hover:bg-amber-300/20'
            >
              Subscribe Now <ArrowRight className='ml-1 h-3 w-3' />
            </Button>
          </Link>
        </div>
      </div>
      <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-purple-400 to-rose-400'></div>
    </div>
  );
}
