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
    ],
    buttonText: "",
    buttonLink: "#",
    description: "Perfect for small teams exploring AI-powered chatbots.",
  },
  {
    name: "Pro",
    price: "$49.99",
    features: [
      "22 PDF Documents",
      "Unlimited AI Chat Messages",
      "Delete & Manage Bots",
      "Switch Between Chat with PDF & Salesbots",
      "Switch Between ChatGPT Models",
      "Access Chatbot Analytics",
      "Client Can Switch to Live Agents",
      "Chat with Memory Record",
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
