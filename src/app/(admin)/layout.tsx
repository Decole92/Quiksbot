import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ClerkLoaded, RedirectToSignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import React from "react";

async function Adminlayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // const { userId } = await auth();

  //if (!userId) RedirectToSignIn();
  return (
    <ClerkLoaded>
      {/* <div className='flex flex-col flex-1 '> */}
      {/* <div className='max-h-screen'>
        <Header />
        <div className='flex'>
          <Sidebar />

          <div className='flex-1 pl-14 md:p-5 p-3 '>{children}</div>
        </div>

      </div> */}
      <Header />
      <div className='flex md:max-h-screen w-full h-full'>
        <Sidebar />
        <div className='w-full h-screen flex flex-col pl-10 md:pl-4'>
          {children}
        </div>
      </div>
    </ClerkLoaded>
  );
}

export default Adminlayout;
