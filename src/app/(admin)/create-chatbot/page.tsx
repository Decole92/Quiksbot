import React from "react";
import { Metadata } from "next";
import CreatePageComponent from "@/components/CreatepageComponent";
export const metadata: Metadata = {
  title: "Quiksbot | Create chatbot",
  description:
    "Create and train AI chatbots in seconds with Quiksbot. Use AI chatbots to increase sales, enhance customer service, and automate website interactions. Quickly embed custom chatbots on your website, track chatbot analytics, and leverage OpenAI API integration for advanced customization. Quiksbot offers SalesBots for lead generation, chatbots with PDF interaction, and the ability to export chat logs in CSV or PDF formats for efficient data management.",
  keywords:
    "create ai chatbot, train chatbot,  ai chatbot, ai chatbot for sales, chatbot creation platform, lead generation chatbot, website chatbot embedding, customer service chatbot, chatbot analytics, OpenAI API chatbot, customizable chatbot, chatbot for business automation, chatbot with PDF interaction, quick chatbot setup, chatbot for lead engagement, AI-powered SalesBot, LLM, upload pdf & chat, pdf interaction",
};

function CreatePage() {
  return <CreatePageComponent />;
}

export default CreatePage;
