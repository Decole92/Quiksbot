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
  DownloadIcon,
  WebcamIcon,
  MailIcon,
} from "lucide-react";

export const plans = [
  {
    name: "Basic",
    price: "Free",
    originalPrice: "Free",
    features: [
      "Train Chatbot with 2 PDF Documents",
      "Train Chatbot with Your Website Content",
      "12 AI Chat Credits",
      "Switch Between Different Chatbot",
      "Embed Chatbot on Your Website",
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
    originalPrice: "$49.99",
    features: [
      "Train Chatbot with 10 PDF Documents",
      "Train Chatbot with Your Website Content",
      "Unlimited AI Chat Messages",
      "Email Marketing Campaign Integration",
      "Embed Chatbot on Your Website",
      "Manage & Delete Chatbots",
      "Switch Between Chatbot type",
      "Switch Between ChatGPT Models",
      "Access Detailed Chatbot Analytics",
      "Clients Can Connect to Live Agents",
      "Chat with Memory Capabilities",
      "Notify when customers switch to live mode",
      "Remove Quiksbot Watermark",
      "Download Chat Logs",
    ],
    buttonText: "Choose Pro",
    buttonLink: "#",
    isMostPopular: true,
    description:
      "Perfect for businesses looking for advanced AI chatbot customization and engagement tools.",
  },
  {
    name: "Ultimate",
    price: "$99.99",
    originalPrice: "$149.99",
    features: [
      "Train Chatbot with 20 PDF Documents",
      "Unlimited AI Chat Messages",
      "Email Marketing Campaign",
      "Embed Chatbot on Your Website",
      "Remove Quiksbot Watermark",
      "Train Chatbot with Your Website Content",
      "Manage & Delete Chatbots",
      "Switch Between Chatbot type",
      "Switch Between ChatGPT Models",
      "Access Chatbot Analytics",
      "Client Can Switch to Live Agents",
      "Chat with Memory Record",
      "Use Custom OpenAI API Keys",
      "Customize AI Prompts",
      "Download Chatlogs",
      "Notify when customers switch to live mode",
    ],
    buttonText: "Upgrade to Ultimate",
    buttonLink: "#",
    description:
      "Best for enterprises seeking full control and advanced customization.",
  },
];

export const botTypeData = [
  {
    value: "Defaults",
    label:
      "Default Bot - Engage visitors, capture leads, and streamline general customer interactions.",
  },
  // {
  //   value: "Sales",
  //   label:
  //     "Sales Bot - Drive engagement and boost conversions by guiding prospects through the sales funnel.",
  // },
  {
    value: "Services",
    label:
      "Services Bot - Provide detailed responses to inquiries using information from uploaded documents.",
  },
  // {
  //   value: "Support",
  //   label:
  //     "Support Bot - Efficiently manage tickets and deliver accurate responses based on reference PDFs.",
  // },
  {
    value: "Custom",
    label:
      "Custom Bot - Design a personalized bot with custom prompts and tailored interactions.",
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
    name: "Lead Generation",
    description:
      "Deploy a SalesBot to engage visitors, generate leads, and convert them into customers.",
    icon: BotIcon,
  },
  {
    name: "Download Chatlog in PDF Format",
    description:
      "Download complete chat logs in PDF format for record-keeping and future reference.",
    icon: DownloadIcon,
  },
  {
    name: "Train Chatbot with Your Content",
    description:
      "Empower your chatbot with knowledge from your website, context, and PDFs to deliver precise responses.",
    icon: GlobeIcon,
  },
  {
    name: "Email Marketing Campaigns",
    description:
      "Design targeted email campaigns with customizable content, recipient management, and performance tracking.",
    icon: MailIcon,
  },
];
