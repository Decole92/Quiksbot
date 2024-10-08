import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import logo from "../../public/circlegolden.png";
import { Button } from "./ui/button";
import { Montserrat } from "next/font/google";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
const Inter = Montserrat({ weight: "600", subsets: ["latin"] });
function Mainheader() {
  const { setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className=' lg:px-6 h-16 bg-transparent dark:bg-transparent dark:text-gray-400 sticky top-0 backdrop-blur-sm z-20 p-2'>
      <div className='flex items-center '>
        <Link
          title='homepage'
          className='flex items-center justify-center gap-3 md:gap-5 lg:gap-5'
          href='/'
        >
          <Image
            src={logo}
            alt='logo'
            width={100}
            height={100}
            className='h-10 w-10 md:w-16 md:h-16 lg:w-16 lg:h-16 rounded-full'
          />
          <div className='-space-y-0.5 lg:space-y-1 md:space-y-1'>
            <h3 className='font-thin text-black text-2xl dark:text-[#E1B177]'>
              Quiksbot
            </h3>
            <h4 className={`${Inter} text-xs text-black dark:text-gray-400`}>
              Chat smarter, not harder.
            </h4>
          </div>
        </Link>
        <nav className='ml-auto flex gap-3 sm:gap-6 items-center'>
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
          <Link
            className='text-sm font-medium hover:underline underline-offset-4 hidden sm:inline-block'
            href='#features'
            title='features'
          >
            Features
          </Link>
          <Link
            className='text-sm font-medium hover:underline underline-offset-4 hidden sm:inline-block'
            href='#pricing'
            title='pricing'
          >
            Pricing
          </Link>
          <Link href='/dashboard' title='dashboard'>
            <Button className='hidden sm:inline-block bg-gray-950 dark:text-gray-400 dark:bg-gray-950 dark:hover:text-gray-200 hover:bg-[#E1B177] dark:hover:bg-[#E1B177]'>
              Get started
            </Button>
          </Link>

          <Button
            variant='ghost'
            size='icon'
            className='sm:hidden'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className='h-6 w-6 ' />
            ) : (
              <Menu className='h-6 w-6' />
            )}
          </Button>
        </nav>
      </div>
      {mobileMenuOpen && (
        <div className='sm:hidden '>
          <nav className='flex flex-col items-center p-2 space-y-2 bg-gray-100 dark:bg-gray-900 gap-3 border-gray-900 border-b rounded-b-lg'>
            <Link
              className='text-sm font-medium hover:underline underline-offset-4 '
              href='#features'
              title='features'
            >
              <Button
                variant={"ghost"}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                Features
              </Button>
            </Link>
            <Link
              className='text-sm font-medium hover:underline underline-offset-4'
              href='#pricing'
              title='pricing'
            >
              <Button
                variant={"ghost"}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                Pricing
              </Button>
            </Link>
            <Link
              href='/dashboard'
              title='dashboard'
              className='max-w-md mx-auto '
            >
              <Button className='w-full dark:bg-gray-950 dark:text-gray-400 bg-gray-900 text-gray-100 '>
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Mainheader;
