import React from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import logo from "../../public/golden.png";
import { Inter, Montserrat } from "next/font/google";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";

const inter = Montserrat({ weight: "600", subsets: ["latin"] });
function Header() {
  return (
    <header className='fixed z-50 w-full justify-between flex flex-row p-5 bg-white items-center md:drop-shadow-sm h-20'>
      <Link href='/' className='flex flex-row items-center space-x-2'>
        {/* <Avatar seed='PAPAFAM Support Agent' /> */}
        <Image
          src={logo}
          alt='logo'
          width={100}
          height={100}
          className='rounded-full h-24 p-4'
        />
        <div className='space-y-1'>
          <h1 className='font-thin text-black text-2xl'>Quiks Bot</h1>
          {/* <h4 className={`${inter} text-xs text-black`}>
            Your customisable chatbot
          </h4> */}
        </div>
      </Link>
      <div>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton showName />
        </SignedIn>
      </div>
    </header>
  );
}

export default Header;
