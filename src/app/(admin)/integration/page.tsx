import IntegrationClient from "@/components/MajorComponent/IntegrationClient";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Quiksbot | Integration",
  description:
    "Boost your business with Quiksbot's AI chatbot analytics. Track performance, optimize interactions, drive leads, and monitor engagement. Integrate with OpenAI for custom solutions.",
  keywords:
    "AI chatbot analytics, chatbot performance tracking, SalesBot analytics, AI chatbot for lead generation, customer service chatbot, chatbot engagement metrics, chatbot conversion tracking, OpenAI API chatbot, website chatbot embedding, chatbot for increasing sales, chatbot for customer satisfaction, AI-powered chatbot analytics, real-time chatbot insights, chatbot optimization, business chatbot analytics, Quiksbot AI solutions, chatbot interaction data, chatbot for business growth, chatbot with PDF interaction, chatbot analytic tools",
};

function IntegrationPage() {
  return <IntegrationClient />;
}

export default IntegrationPage;
