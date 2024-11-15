import React from "react";
import { Metadata } from "next";
import SettingsPageClient from "@/components/MajorComponent/SettingsComponent";

export const metadata: Metadata = {
  title: "Quiksbot | Settings",
  description:
    "Discover how to use AI chatbots to enhance sales, improve customer service, and automate lead generation. Learn how to embed AI chatbots on your website, analyze performance with chatbot analytics, and integrate custom OpenAI API. Export chat logs as CSV or PDF, manage your subscription, and access advanced features like light theme customization and subscription upgrades.",
  keywords:
    "AI chatbot, website chatbot, sales chatbot, chatbot for lead generation, chatbot analytics, OpenAI API integration, PDF interaction, chatlog export, customer service chatbot, upgrade subscription, chatbot settings, light theme chatbot",
};

function SettingsPage() {
  return <SettingsPageClient />;
}

export default SettingsPage;
