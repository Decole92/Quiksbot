import { ChevronsLeft, ChevronsRight, Zap } from "lucide-react";
import React from "react";
import { SIDE_BAR_MENU } from "./Menu";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store/globalStore";
import Link from "next/link";

function MaxMenu() {
  const router = useRouter();
  const [isExtended, setIsExtended] = useGlobalStore((state) => [
    state.isExtended,
    state.setIsExtended,
  ]);
  return (
    <div className='text-black  pt-24 w-[200px]'>
      <ul className='space-y-8'>
        {SIDE_BAR_MENU.map((menu: MenuTypes) => (
          <li
            className='cursor-pointer flex items-center gap-7'
            onClick={() => router.push(`${menu.path}`)}
            key={menu.label}
          >
            {menu.icon}
            {menu.label}
          </li>
        ))}
      </ul>
      <ul className='absolute bottom-28  space-y-8 '>
        <Link href={"/pricing"}>
          <li className='flex items-center gap-7'>
            <Zap /> <h3>Upgrade</h3>
          </li>
        </Link>

        <li
          className='cursor-pointer'
          onClick={() => setIsExtended(!isExtended)}
        >
          {isExtended ? <ChevronsLeft /> : <ChevronsRight />}
        </li>
      </ul>
    </div>
  );
}

export default MaxMenu;
