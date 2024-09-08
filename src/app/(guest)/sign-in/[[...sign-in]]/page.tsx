import { SignIn } from "@clerk/nextjs";
import React from "react";

function LoginPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full'>
      <h4>Sign in page here</h4>
      <SignIn />
    </div>
  );
}

export default LoginPage;
