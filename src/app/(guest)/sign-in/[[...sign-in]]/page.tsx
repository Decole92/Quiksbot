import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Login to Quiksbot | AI Chatbots & PDF Interaction",
  description:
    "Log in to Quiksbot to access powerful AI chatbots for lead generation, chatbot analytics, and business automation. Choose from flexible pricing plans: Free, Pro, or Ultimate. Customize your AI with OpenAI API, switch chat models, and export logs as CSV or PDF. Ideal for small teams, businesses, and enterprises seeking scalable AI solutions.",
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
          <span className='font-thin uppercase pt-2'>
            Kindly login to continue
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
