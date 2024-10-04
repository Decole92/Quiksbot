import React from "react";
import { Metadata } from "next";
import CreatePageComponent from "@/components/CreatepageComponent";
export const metadata: Metadata = {
  title: "Quiksbot | Create chatbot",
  description:
    "Create AI chatbots with Quiksbot to boost sales, enhance service, embed on sites, track analytics, and use OpenAI integration. Export chat logs for easy data management.",
  keywords:
    "create ai chatbot, train chatbot,  ai chatbot, ai chatbot for sales, chatbot creation platform, lead generation chatbot, website chatbot embedding, customer service chatbot, chatbot analytics, OpenAI API chatbot, customizable chatbot, chatbot for business automation, chatbot with PDF interaction, quick chatbot setup, chatbot for lead engagement, AI-powered SalesBot, LLM, upload pdf & chat, pdf interaction",
};

function CreatePage() {
  return <CreatePageComponent />;
}

export default CreatePage;
