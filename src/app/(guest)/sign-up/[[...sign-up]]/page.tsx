import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Sign Up | AI Chatbots & PDF Interaction | Quiksbot",
  description:
    "Create an account on Quiksbot for AI chatbots, lead generation, and PDF interaction. Choose from Free, Pro, or Ultimate plans. Customize with OpenAI API.",
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
          <span hidden className='font-thin uppercase pt-2'>
            Kindly Sign up here to our ai chatbot that you can embed inside your
            website which allows you to also chat with your pdf file .
          </span>
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
