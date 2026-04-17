import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import Link from "next/link";
import React from "react";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
function SocialLinks() {
  return (
    <div className='flex items-center space-x-5'>
      <Link href='https://www.facebook.com/decole.mills.96' target='_blank'>
        <FacebookIcon
          target='_blank'
          href='_blank'
          fontSize='small'
          className='cursor-pointer'
        />
      </Link>

      <Link target='_blank' href='https://www.instagram.com/mrdecole/'>
        <InstagramIcon
          href='_blank'
          fontSize='small'
          className='cursor-pointer'
        />
      </Link>

      <Link target='_blank' href='https://x.com/AugustineUdeh4'>
        <XIcon href='_blank' fontSize='small' className='cursor-pointer' />
      </Link>
      <Link target='_blank' href='https://www.linkedin.com/in/decolemills/'>
        <LinkedInIcon
          href='_blank'
          fontSize='small'
          className='cursor-pointer'
        />
      </Link>
    </div>
  );
}

export default SocialLinks;
