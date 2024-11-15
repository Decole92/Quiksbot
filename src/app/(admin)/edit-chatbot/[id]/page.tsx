import EditPageClient from "@/components/MajorComponent/EditPageComponent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Quiksbot | Edit chatbot",
  description:
    "Create and train AI chatbots in seconds with Quiksbot. Use AI chatbots to increase sales, enhance customer service, and automate website interactions. Quickly embed custom chatbots on your website, track chatbot analytics, and leverage OpenAI API integration for advanced customization. Quiksbot offers SalesBots for lead generation, chatbots with PDF interaction, and the ability to export chat logs in CSV or PDF formats for efficient data management.",
  keywords:
    "create AI chatbot, train chatbot, AI chatbot for sales, chatbot creation platform, lead generation chatbot, website chatbot embedding, customer service chatbot, chatbot analytics, OpenAI API chatbot, customizable chatbot, chatbot for business automation, chatbot with PDF interaction, export chat logs, CSV chat export, quick chatbot setup, chatbot for lead engagement, AI-powered SalesBot, Quiksbot chatbot solutions, chatbot data export, chatbot for websites",
};

function EditPage({ params: { id } }: { params: { id: string } }) {
  return <EditPageClient id={id} />;
}

export default EditPage;
