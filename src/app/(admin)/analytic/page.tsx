import AnalyticsClient from "@/components/AnalyticPageComponent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Quiksbot | Analytics",
  description:
    "Boost your business with Quiksbot's AI-powered chatbot analytics. Track chatbot performance, optimize customer interactions, and drive lead generation. Quiksbot's analytics tools help you monitor chatbot engagement, conversion rates, and customer satisfaction. Easily integrate with OpenAI API for custom chat solutions. Learn how chatbots can increase sales, improve customer service, and provide real-time insights. Ideal for businesses looking to embed chatbots, monitor user behavior, and enhance customer engagement with AI-driven analytics.",
  keywords:
    "AI chatbot analytics, chatbot performance tracking, SalesBot analytics, AI chatbot for lead generation, customer service chatbot, chatbot engagement metrics, chatbot conversion tracking, OpenAI API chatbot, website chatbot embedding, chatbot for increasing sales, chatbot for customer satisfaction, AI-powered chatbot analytics, real-time chatbot insights, chatbot optimization, business chatbot analytics, Quiksbot AI solutions, chatbot interaction data, chatbot for business growth, chatbot with PDF interaction, chatbot analytic tools",
};

function AnalyticPage() {
  return <AnalyticsClient />;
}

export default AnalyticPage;
