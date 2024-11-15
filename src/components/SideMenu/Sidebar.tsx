"use client";

import { useGlobalStore } from "@/store/globalStore";
import MaxMenu from "./MaxMenu";
import MinMenu from "./MinMenu";

function Sidebar() {
  const [isExtended, setIsExtended] = useGlobalStore((state) => [
    state.isExtended,
    state.setIsExtended,
  ]);

  return (
    <div
      className={`bg-gray-100 dark:bg-gray-900 dark:text-[#E1B177] md:min-h-screen h-full p-7 fixed z-20 fill-mode-forwards transition-all duration-300 ${
        isExtended ? "w-64" : "w-20"
      }`}
    >
      {/* // <div className='bg-gray-100 dark:bg-gray-900 dark:text-[#E1B177] md:min-h-screen h-full md:p-5 p-3.5 fixed z-20 fill-mode-forwards   '> */}
      {isExtended ? <MaxMenu /> : <MinMenu />}
    </div>
  );
}

export default Sidebar;
