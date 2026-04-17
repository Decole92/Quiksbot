import Header from "@/components/Header";
import Sidebar from "@/components/SideMenu/Sidebar";
import { Toaster } from "@/components/ui/toaster";

import { ClerkLoaded, RedirectToSignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import React from "react";

async function Adminlayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkLoaded>
      <div className='min-h-screen bg-background'>
        <Header />

        <div className='flex w-full'>
          <Sidebar />
          <main className='flex-1 '>
            <div className='w-full md:min-h-screen h-full flex flex-col pl-16 md:pl-4'>
              {children}
            </div>
          </main>
        </div>
      </div>
    </ClerkLoaded>
  );
}

export default Adminlayout;
