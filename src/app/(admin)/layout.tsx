import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
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
      <div className=''>
        <Header />

        <div className='flex md:max-h-screen w-full h-full  '>
          <Sidebar />
          <div className='w-full md:min-h-screen h-full flex flex-col pl-10 md:pl-4'>
            {children}
          </div>
        </div>
        <Toaster position='bottom-center' />
      </div>
    </ClerkLoaded>
  );
}

export default Adminlayout;
