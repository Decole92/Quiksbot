import { ChevronsLeft, ChevronsRight, Zap } from "lucide-react";
import React from "react";
import { SIDE_BAR_MENU } from "./Menu";
import { usePathname, useRouter } from "next/navigation";
import { useGlobalStore } from "@/store/globalStore";
import Link from "next/link";
import { MenuTypes } from "../../../typing";

function MaxMenu() {
  const router = useRouter();
  const [isExtended, setIsExtended] = useGlobalStore((state) => [
    state.isExtended,
    state.setIsExtended,
  ]);

  const pathname = usePathname();
  return (
    <div className='text-black  pt-24 w-[200px]'>
      <ul className='space-y-8'>
        {SIDE_BAR_MENU.map((menu: MenuTypes) => (
          <li
            className={`${
              pathname.includes(menu.path)
                ? `dark:[&]:text-[#E1B177] text-[#E1B177] `
                : ""
            }  hover:text-[#E1B177] dark:text-gray-400 dark:hover:text-[#E1B177] flex items-center cursor-pointer gap-7`}
            onClick={() => router.push(`${menu.path}`)}
            key={menu.label}
          >
            {menu.icon}
            {menu.label}
          </li>
        ))}
      </ul>
      <ul className='absolute bottom-28  space-y-8 dark:text-gray-400'>
        <Link href={"/pricing"}>
          <li
            className={`${
              pathname.includes("/pricing")
                ? `dark:[&]:text-[#E1B177] text-[#E1B177] `
                : ""
            } flex items-center gap-7 hover:text-[#E1B177]`}
          >
            <Zap /> <h3>Upgrade</h3>
          </li>
        </Link>

        <li
          className='cursor-pointer hover:text-[#E1B177]'
          onClick={() => setIsExtended(!isExtended)}
        >
          {isExtended ? <ChevronsLeft /> : <ChevronsRight />}
        </li>
      </ul>
    </div>
  );
}

export default MaxMenu;
