"use client";

import { useGlobalStore } from "@/store/globalStore";
import MaxMenu from "./SideMenu/MaxMenu";
import MinMenu from "./SideMenu/MinMenu";
import { cn } from "@/lib/utils";

function Sidebar() {
  const [isExtended, setIsExtended] = useGlobalStore((state) => [
    state.isExtended,
    state.setIsExtended,
  ]);
  return (
    <div className='bg-white md:min-h-screen h-full md:p-5 p-3 fixed z-20 fill-mode-forwards   '>
      {isExtended ? <MaxMenu /> : <MinMenu />}
    </div>
  );
}

export default Sidebar;
