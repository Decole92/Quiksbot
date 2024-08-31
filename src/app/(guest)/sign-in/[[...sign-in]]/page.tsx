import { SignIn } from "@clerk/nextjs";
import React from "react";

function LoginPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full'>
      <SignIn />;
    </div>
  );
}

export default LoginPage;
