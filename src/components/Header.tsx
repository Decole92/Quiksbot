"use client";
import React, { useState } from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import logo from "../../public/circlegolden.png";
import { Montserrat } from "next/font/google";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import CreditBar from "./CreditBar";
import useSubcription from "@/hook/useSubscription";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const Inter = Montserrat({ weight: "600", subsets: ["latin"] });

function Header() {
  const { hasActiveMembership, usedCredits, totalCredits } = useSubcription();
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  return (
    <header className='fixed z-50 w-full justify-between flex flex-row p-5 dark:bg-gray-900  bg-gray-100 items-center h-20'>
      <Link
        href='/'
        className='flex flex-row items-center gap-2 md:gap-3 lg:gap-3'
      >
        <Image
          src={logo}
          alt='logo'
          width={100}
          height={100}
          className='h-10 w-10 md:w-16 md:h-16 lg:w-16 lg:h-16 rounded-full'
        />
        <div className='lg:space-y-1 md:space-y-1 -space-y-0.5'>
          <h1 className='font-thin text-black text-2xl dark:text-[#E1B177]'>
            QuiksBot
          </h1>
          <h4 className={`${Inter} text-xs text-black dark:text-gray-400`}>
            Chat smarter, not harder.
          </h4>
        </div>
      </Link>
      <div className='flex flex-row items-center gap-2 md:gap-5 lg:gap-5 '>
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
        {hasActiveMembership === "STANDARD" ? (
          <>
            <div className='hidden md:block lg:block'>
              <CreditBar />
            </div>
            <div className='md:hidden lg:hidden inline-flex flex-col'>
              <p className='text-xs font-thin'>CR left </p>
              <p className='text-sm dark:text-gray-400 text-gray-950'>
                {totalCredits - usedCredits}
              </p>
            </div>
          </>
        ) : (
          <div className='hidden md:block lg:block'>
            {hasActiveMembership === "PRO" ? (
              <Button
                className='
                bg-gradient-to-r from-[#E1B177] to-[#D4A36B]
                hover:from-[#D4A36B] hover:to-[#E1B177]
                text-white font-semibold
                border-2 border-[#C79661]
                shadow-lg
                transition-all duration-300
                transform hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-[#C79661] focus:ring-opacity-50
                flex items-center gap-2
                px-6 py-3
              '
              >
                <Star className='w-5 h-5' />
                Pro
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/pricing")}
                className={`
                relative overflow-hidden
                bg-gradient-to-r from-[#E1B177] via-[#D4A36B] to-[#C79661]
                text-white font-bold
                border-2 border-[#C79661]
                shadow-lg
                transition-all duration-300 ease-in-out
                hover:shadow-xl
                focus:outline-none focus:ring-2 focus:ring-[#C79661] focus:ring-opacity-50
                px-8 py-4 text-lg
                ${isHovered ? "animate-pulse" : ""}
              `}
                style={{
                  clipPath:
                    "polygon(92% 0, 100% 25%, 100% 100%, 8% 100%, 0% 75%, 0 0)",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <span className='relative z-10 flex items-center gap-2'>
                  <Star className='w-6 h-6' />
                  <span className='text-shadow'>Ultimate</span>
                </span>
                <span
                  className={`
                  absolute inset-0 bg-gradient-to-r from-[#F1C187] via-[#E4B37B] to-[#D7A671]
                  opacity-0 transition-opacity duration-300 ease-in-out
                  ${isHovered ? "opacity-100" : ""}
                `}
                />
              </Button>
            )}
          </div>
        )}
        <div className='md:col-span-2 lg:col-span-2 col-span-5'>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export default Header;
