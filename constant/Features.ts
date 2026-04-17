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
  MailIcon,
  CalendarCheck,
  FileText,
} from "lucide-react";

export const plans = [
  {
    name: "Basic",
    price: "",
    originalPrice: "Free",
    features: [
      "Train Chatbot with 2 PDF Documents",
      "Train Chatbot with Your Website Content",
      "12 AI Chat Credits",
      "Switch Between Different Chatbot",
      "Embed Chatbot on Your Website",
      "Chat with Memory Record",
      "Download Chatlogs",
      "Allow users to create only 1 chatbot",
    ],
    buttonText: "",
    buttonLink: "#",
    description: "Perfect for small teams exploring AI-powered chatbots.",
  },
  {
    name: "Pro",
    price: "$14.99",
    originalPrice: "$29.99",
    features: [
      "Train Chatbot with 10 PDF Documents",
      "Train Chatbot with Your Website Content",
      "Unlimited AI Chat Messages",
      "Email Marketing Campaign Integration",
      "Embed Chatbot on Your Website",
      "Manage & Delete Chatbots",
      "Switch Between Chatbot type",
      "Switch Between AI Models",
      "Access Detailed Chatbot Analytics",
      "Clients Can Connect to Live Agents",
      "Chat with Memory Capabilities",
      "Notify when customers switch to live mode",
      "Remove Quiksbot Watermark",
      "Download Chat Logs",
      "Up to 5 Chatbots",
      "WhatsApp Integration",
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
    originalPrice: "$169.99",
    features: [
      "Train Chatbot with 20 PDF Documents",
      "Unlimited AI Chat Messages",
      "Email Marketing Campaign",
      "Embed Chatbot on Your Website",
      "Remove Quiksbot Watermark",
      "Train Chatbot with Your Website Content",
      "Manage & Delete Chatbots",
      "Switch Between Chatbot type",
      "Switch Between AI Models",
      "Access Chatbot Analytics",
      "Client Can Switch to Live Agents",
      "Chat with Memory Record",
      "Use Custom API Keys like Openai key, anthropic key, etc.",
      "Customize AI Prompts",
      "Download Chatlogs",
      "Notify when customers switch to live mode",
      "Unlimited Chatbots",
      "WhatsApp Integration",
    ],
    buttonText: "Upgrade to Ultimate",
    buttonLink: "#",
    description:
      "Best for enterprises seeking full control and advanced customization.",
  },
];

export const botTypeData = [
  {
    value: "Sales",
    label:
      "Sales Bot - Drive engagement and boost conversions by guiding prospects through the sales funnel.",
  },
  {
    value: "Appointment",
    label:
      "Appointment Bot - Facilitates scheduling and booking appointments seamlessly.",
  },
  {
    value: "Support",
    label:
      "Support Bot - Efficiently provides accurate responses to customer inquiries.",
  },
  {
    value: "Custom",
    label:
      "Custom Bot - Design a personalized bot with unique prompts and tailored interactions.",
  },
];

export const features = [
  {
    name: "Schedule Appointment",
    description:
      "Use Quiksbot to schedule appointments quickly and effortlessly.",
    icon: CalendarCheck,
  },

  {
    name: "Website Chatbot Embed & WhatsApp Integration",
    description:
      "Seamlessly embed a customizable chatbot on your website or connect via WhatsApp to engage visitors and capture leads.",
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
      "Switch between different AI models like ChatGPT, Grok, Claude, Deepseek to get the most suitable responses for your needs.",
    icon: SettingsIcon,
  },
  {
    name: "Client-to-Live Agent Transition",
    description:
      "Allow customers to switch from chatting with the bot to live agents when needed.",
    icon: UsersIcon,
  },
  {
    name: "Custom API Keys ",
    description:
      "Use your own XAI key, OpenAI key, Deepseek key, Anthropic key for full control and customization over chatbot behavior.",
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
      "Deploy  Sales Agent, Support Agent, Appointment Agent to engage visitors, generate leads, and convert them into customers.",
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
    icon: FileText,
  },
  {
    name: "Email Marketing Campaigns",
    description:
      "Design targeted email campaigns with customizable content, recipient management, and performance tracking.",
    icon: MailIcon,
  },
];
