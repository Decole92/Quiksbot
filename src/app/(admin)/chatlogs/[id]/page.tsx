import ViewMessageClient from "@/components/MajorComponent/ViewMessageClient";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Quiksbot | Chatbot Messages",
  description:
    "Learn how to use AI-powered chatbots to increase sales and improve customer service. With Quiksbot, you can easily embed chatbots on your website, track chatbot analytics, and integrate custom OpenAI APIs. Export your chat logs in CSV or PDF formats for better data management and insights. Perfect for lead generation, PDF interactions, and business automation. Manage your chatbot's performance and enhance customer engagement through detailed chatlog exports and analytics.",
  keywords:
    "ai chatlogs, export chatbot Pdf, PDF chat log export, ai chatbot data management, chatbot analytics, AI chatbot for sales, customer service chatbot, website chatbot embedding, OpenAI API integration, lead generation chatbot, chatbot with PDF interaction, export chat data, chatbot performance tracking, AI-powered SalesBot, chatbot chatlog insights, Quiksbot chatbot solutions, chatbot for websites",
};
function ViewMessage({ params: { id } }: { params: { id: string } }) {
  return (
    <div className='h-screen flex flex-col md:max-h-screen lg:max-h-screen   md:max-w-3xl md:mx-auto lg:max-w-3xl lg:mx-auto w-full bg-gray-100 dark:bg-transparent md:rounded-t-lg  mt-20'>
      <ViewMessageClient selectedChatRoomId={id} />
    </div>
  );
}

export default ViewMessage;
