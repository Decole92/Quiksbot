import { SignUp } from "@clerk/nextjs";
import React from "react";

function SignUpPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full'>
      <SignUp />
    </div>
  );
}

export default SignUpPage;
