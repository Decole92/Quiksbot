import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ClerkLoaded, RedirectToSignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import React from "react";

async function Adminlayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // const { userId } = await auth();

  // if (!userId) RedirectToSignIn();
  return (
    <ClerkLoaded>
      <Header />
      <div className='flex md:max-h-screen w-full h-full '>
        <Sidebar />
        <div className='w-full h-screen flex flex-col pl-10 md:pl-4'>
          {children}
        </div>
      </div>
    </ClerkLoaded>
  );
}

export default Adminlayout;
