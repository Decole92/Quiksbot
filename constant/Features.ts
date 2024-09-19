import {
  FileTextIcon,
  Bot,
  SettingsIcon,
  BarChartIcon,
  UsersIcon,
  KeyIcon,
  CodeIcon,
  BotIcon,
  GlobeIcon,
  Cpu,
} from "lucide-react";

export const plans = [
  {
    name: "Basic",
    price: "Free",
    features: [
      "2 PDF Documents",
      "25 AI Chat Credits",
      "Switch Between Chat with PDF & Salesbots",
      "Website Chatbot Embedding",
      "Chat with Memory Record",
      "Download Chatlogs ",
    ],
    buttonText: "",
    buttonLink: "#",
    description: "Perfect for small teams exploring AI-powered chatbots.",
  },
  {
    name: "Pro",
    price: "$29.99",
    features: [
      "22 PDF Documents",
      "Unlimited AI Chat Messages",
      "Delete & Manage Bots",
      "Switch Between Chat with PDF & Salesbots",
      "Switch Between ChatGPT Models",
      "Access Chatbot Analytics",
      "Client Can Switch to Live Agents",
      "Chat with Memory Record",
      "Download Chatlogs (including customer details and chat messages)",
    ],
    buttonText: "Choose to Pro",
    buttonLink: "#",
    isMostPopular: true,
    description:
      "Ideal for growing businesses needing advanced AI chatbot tools.",
  },
  {
    name: "Ultimate",
    price: "$99.99",
    features: [
      "50 PDF Documents",
      "Unlimited AI Chat Messages",
      "Delete & Manage Bots",
      "Switch Between Chat with PDF & Salesbots",
      "Switch Between ChatGPT Models",
      "Access Chatbot Analytics",
      "Client Can Switch to Live Agents",
      "Chat with Memory Record",
      "Use Custom OpenAI API Keys",
      "Customize AI Prompts",
      "Download Chatlogs (including customer details and chat messages)",
      "Alerts when Potential Customers Switching to Live Mode",
    ],
    buttonText: "Upgrade to Ultimate",
    buttonLink: "#",
    description:
      "Best for enterprises seeking full control and advanced customization.",
  },
];

export const botTypeData = [
  {
    value: "SalesBot",
    label: "Sales Bot Customer Service - Engage and convert leads",
  },
  {
    value: "ChatPdf",
    label: "Chat with PDF Only - Answer queries based on your uploaded",
  },
  {
    value: "Custom",
    label: "Customize your own prompt",
  },
];

export const features = [
  {
    name: "Store your PDF Document",
    description:
      "Keep all your important PDF files securely stored and easily accessed.",
    icon: FileTextIcon,
  },
  {
    name: "AI Chat with PDF",
    description:
      "Interact with your PDF documents using AI-powered chat, answering queries and extracting information.",
    icon: Bot,
  },
  {
    name: "Embed Chatbot on Website",
    description:
      "Easily embed customizable chatbots on your website to engage visitors and capture leads.",
    icon: GlobeIcon,
  },
  {
    name: "Chatbot Analytics",
    description:
      "Gain valuable insights from detailed chatbot analytics and performance tracking.",
    icon: BarChartIcon,
  },
  {
    name: "Switch Between AI Models",
    description:
      "Switch between different AI models like ChatGPT to get the most suitable responses for your needs.",
    icon: SettingsIcon,
  },
  {
    name: "Client-to-Live Agent Transition",
    description:
      "Allow customers to switch from chatting with the bot to live agents when needed.",
    icon: UsersIcon,
  },
  {
    name: "Custom OpenAI API Keys",
    description:
      "Use your own OpenAI API keys for full control and customization over chatbot behavior.",
    icon: KeyIcon,
  },
  {
    name: "Chat with Memory Record",
    description:
      "Maintain a chat memory record, allowing for more personalized conversations with the bot.",
    icon: Cpu,
  },
  {
    name: "Customize AI Prompts",
    description:
      "Tailor the AI's responses by customizing its prompts to fit your business needs.",
    icon: CodeIcon,
  },
  {
    name: "SalesBot for Lead Generation",
    description:
      "Deploy a SalesBot to engage visitors, generate leads, and convert them into customers.",
    icon: BotIcon,
  },
];
