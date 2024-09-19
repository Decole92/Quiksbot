import ChatInterface from "@/components/ChatInterface";
import ConversationMenu from "@/components/ConversationMenu";
import { Metadata } from "next";

import React from "react";

export const metadata: Metadata = {
  title:
    "AI Chatbot for Websites | Engage Leads with AI-Powered SalesBot | Quiksbot Chatlogs",
  description:
    "Learn how to use AI-powered chatbots to increase sales and improve customer service. With Quiksbot, you can easily embed chatbots on your website, track chatbot analytics, and integrate custom OpenAI APIs. Export your chat logs in CSV or PDF formats for better data management and insights. Perfect for lead generation, PDF interactions, and business automation. Manage your chatbot's performance and enhance customer engagement through detailed chatlog exports and analytics.",
  keywords:
    "AI chatbot chatlogs, export chatbot chat logs, CSV chat log export, PDF chat log export, chatbot data management, chatbot analytics, AI chatbot for sales, customer service chatbot, website chatbot embedding, OpenAI API integration, lead generation chatbot, chatbot with PDF interaction, business chatbot automation, export chat data, chatbot performance tracking, AI-powered SalesBot, chatbot chatlog insights, Quiksbot chatbot solutions, export chat history, chatbot for websites",
};
function Chatlog() {
  return (
    <div className='flex h-full lg:min-h-screen md:min-h-screen mt-16 w-full md:max-w-3xl md:mx-auto lg:max-w-6xl lg:mx-auto  '>
      <ConversationMenu />

      <div className='flex-1 p-8 hidden md:inline-block lg:inline-block '>
        <ChatInterface />
      </div>
    </div>
  );
}

export default Chatlog;
