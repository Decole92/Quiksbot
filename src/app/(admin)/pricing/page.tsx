import PricingClient from "@/components/pricingComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quiksbot | Pricing",
  description:
    "Boost your business with Quiksbot's AI chatbots. Explore flexible pricing plans: Basic (Free), Pro ($29.99), or Ultimate ($99.99). Quiksbot offers advanced lead generation, chatbot analytics, PDF interaction, website chatbot embedding, and more. Customize your AI with OpenAI API, switch between chat models, and export chat logs as CSV or PDF. Perfect for small teams, businesses, and enterprises looking for full control and scalability.",
  keywords:
    "AI chatbot pricing, ai chatbot free trial, AI-powered salesbot, lead generation chatbot, chatbot analytics, PDF chatbot, chatbot for business, OpenAI API integration, chatbot plans, chatbot for small businesses, chatbot customization, Free Basic plan, Pro chatbot plan, Ultimate chatbot features, chatbot subscription, Quiksbot pricing plans, user experience, machine learning, natural language",
};

export default function Pricing() {
  return <PricingClient />;
}
