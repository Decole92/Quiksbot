import { ChevronsLeft, ChevronsRight, Zap } from "lucide-react";
import React from "react";
import { SIDE_BAR_MENU } from "./Menu";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store/globalStore";

function MinMenu() {
  const router = useRouter();
  const [isExtended, setIsExtended] = useGlobalStore((state) => [
    state.isExtended,
    state.setIsExtended,
  ]);
  return (
    <div className='text-black space-y-20 pt-24 '>
      <ul className=' space-y-8'>
        {SIDE_BAR_MENU.map((menu: any) => (
          <li
            className='cursor-pointer'
            onClick={() => router.push(`${menu.path}`)}
            key={menu.label}
          >
            {menu.icon}
          </li>
        ))}
      </ul>
      <ul className=' absolute bottom-28 space-y-8 '>
        <li>
          <Zap />
        </li>
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

export default MinMenu;
