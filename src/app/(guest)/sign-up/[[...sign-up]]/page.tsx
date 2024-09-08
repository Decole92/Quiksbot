import { SignUp } from "@clerk/nextjs";
import React from "react";

function SignUpPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full'>
      <h4>Sign in page here</h4>
      <SignUp />
    </div>
  );
}

export default SignUpPage;
