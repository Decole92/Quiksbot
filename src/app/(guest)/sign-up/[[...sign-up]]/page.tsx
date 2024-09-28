import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Sign Up for Quiksbot | AI Chatbots & PDF Interaction",
  description:
    "Create your account on Quiksbot to access AI-powered chatbots for lead generation, chatbot analytics, business automation, and PDF interaction. Explore flexible pricing: Free, Pro, or Ultimate. Customize your AI using OpenAI API, switch between chat models, chat with PDFs, and export logs as CSV or PDF. Ideal for small businesses and enterprises looking for scalable AI solutions.",
  keywords:
    "ai chatbot sign up, Quiksbot registration, business chatbot platform, sign up for AI chatbots, chat with PDF, lead generation chatbot, website chatbot integration, OpenAI chatbot, chatbot analytics, scalable AI solutions, small business chatbot, Free plan chatbot, machine learning chatbot, natural language processing chatbot, LLM chatbot, PDF chatbot, chatbot registration page",
};

function SignUpPage() {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-full dark:bg-gray-950 dark:text-gray-400'>
      <div className='text-center mb-8'>
        <h1 className='text-4xl font-bold dark:text-gray-100 text-gray-900'>
          Get started with{" "}
          <Link href='/'>
            <span className='text-[#E1B177]'>Quiksbot</span>
          </Link>
          <br />
          <span className='font-thin uppercase pt-2'>Kindly Sign up here</span>
        </h1>
        <h3 className='mt-2 text-lg text-gray-500'>
          Register to manage your account and access the AI-powered chatbot
          platform, including PDF interaction.
        </h3>
      </div>
      <SignUp />
    </div>
  );
}

export default SignUpPage;
