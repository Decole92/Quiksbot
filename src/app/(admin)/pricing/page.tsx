import PricingClient from "@/components/pricingComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiksbot | Pricing",
  description:
    "Boost your business with Quiksbot AI chatbots. Explore pricing: Free, Pro ($29.99), Ultimate ($99.99). Get lead generation, analytics, PDF interaction, and OpenAI integration.",
  keywords:
    "AI chatbot pricing, ai chatbot free trial, AI-powered salesbot, lead generation chatbot, chatbot analytics, PDF chatbot, chatbot for business, OpenAI API integration, chatbot plans, chatbot for small businesses, chatbot customization, Free Basic plan, Pro chatbot plan, Ultimate chatbot features, chatbot subscription, Quiksbot pricing plans, user experience, machine learning, natural language",
};

export default function Pricing() {
  return <PricingClient />;
}
