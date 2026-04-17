import Image from "next/image";
import React from "react";
import logo from "../../../../public/golden.png";
export default function loading() {
  return (
    <div className='flex flex-col  items-center w-full h-full mt-20'>
      <div>
        <Image
          src={logo}
          alt='logo'
          width={50}
          height={50}
          className='rounded-full animate-spin'
        />
      </div>
    </div>
  );
}
