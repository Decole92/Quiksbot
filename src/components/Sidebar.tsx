"use client";

import { useGlobalStore } from "@/store/globalStore";
import MaxMenu from "./SideMenu/MaxMenu";
import MinMenu from "./SideMenu/MinMenu";
import { cn } from "@/lib/utils";
import { onMailer } from "@/actions/customer";
import { useEffect } from "react";

function Sidebar() {
  const [isExtended, setIsExtended] = useGlobalStore((state) => [
    state.isExtended,
    state.setIsExtended,
  ]);

  return (
    <div className='bg-gray-100 dark:bg-gray-900 dark:text-[#E1B177] md:min-h-screen h-full md:p-5 p-3 fixed z-20 fill-mode-forwards   '>
      {isExtended ? <MaxMenu /> : <MinMenu />}
    </div>
  );
}

export default Sidebar;
