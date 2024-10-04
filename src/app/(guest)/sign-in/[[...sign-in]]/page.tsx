import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Login | AI Chatbots & PDF Interaction | Quiksbot",
  description:
    "Log in to Quiksbot for AI chatbots, lead generation, analytics, and business automation. Flexible plans: Free, Pro, or Ultimate. Export logs, customize with OpenAI API ",
  keywords:
    "ai chatbot login, Quiksbot login, business chatbot platform, AI chatbots for business, chatbot login page, lead generation chatbot, website chatbot embedding, OpenAI chatbot integration, chatbot analytics, scalable AI solutions, small business chatbot, Free plan chatbot, machine learning chatbot, natural language processing chatbot, LLM chatbot",
};
function LoginPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full dark:bg-gray-950 dark:text-gray-400'>
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold dark:text-gray-100 text-gray-900'>
          Welcome to{" "}
          <Link href='/'>
            <span className='text-[#E1B177]'>Quiksbot</span>
          </Link>
          <br />
          <span hidden className='font-thin uppercase pt-2'>
            Kindly login to continue with our ai chatbot that you can embed
            inside your website which allows you to also chat with your pdf
            file.
          </span>
        </h1>

        <h3 className='mt-2 text-lg text-gray-500'>
          Login to manage your account and access the AI-powered chatbot
          platform, including PDF interaction.
        </h3>
      </div>
      <SignIn />
    </div>
  );
}

export default LoginPage;
