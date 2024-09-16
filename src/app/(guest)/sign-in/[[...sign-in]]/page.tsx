import { SignIn } from "@clerk/nextjs";
import React from "react";

function LoginPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full dark:bg-gray-950 dark:text-gray-400'>
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold dark:text-gray-100 text-gray-900'>
          Welcome to <span className='text-[#E1B177]'>Quiksbot</span>
        </h1>
        <p className='mt-2 text-lg text-gray-500'>
          Login to manage your account and access the AI-powered chatbot
          platform
        </p>
      </div>
      <SignIn />
    </div>
  );
}

export default LoginPage;
