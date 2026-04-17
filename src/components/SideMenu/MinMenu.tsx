import { ChevronsLeft, ChevronsRight, Zap } from "lucide-react";
import React from "react";
import { SIDE_BAR_MENU } from "./Menu";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useGlobalStore } from "@/store/globalStore";

function MinMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [isExtended, setIsExtended] = useGlobalStore((state) => [
    state.isExtended,
    state.setIsExtended,
  ]);
  return (
    <div className='text-black dark:text-gray-400 space-y-20 pt-24 '>
      <ul className='dark:text-gray-400 space-y-8'>
        {SIDE_BAR_MENU.map((menu: any) => (
          <li
            className={`${
              pathname?.includes(menu.path)
                ? "text-[#E1B177] dark:[&]:text-[#E1B177]"
                : ""
            } cursor-pointer dark:text-gray-400 hover:text-[#E1B177] dark:hover:text-[#E1B177]`}
            onClick={() => router.push(`${menu.path}`)}
            key={menu.label}
          >
            {menu.icon}
          </li>
        ))}
      </ul>
      <ul className='absolute bottom-28 space-y-8 dark:text-gray-400 '>
        <li
          className={`${
            pathname.includes("/pricing")
              ? "text-[#E1B177] dark:text-[#E1B177]"
              : ""
          } hover:text-[#E1B177] cursor-pointer `}
          onClick={() => router.push("/pricing")}
        >
          <Zap />
        </li>
        <li
          className='cursor-pointer hover:text-[#E1B177] '
          onClick={() => setIsExtended(!isExtended)}
        >
          {isExtended ? <ChevronsLeft /> : <ChevronsRight />}
        </li>
      </ul>
    </div>
  );
}

export default MinMenu;
