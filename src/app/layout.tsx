import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { ConvexClerkProvider } from "@/app/providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata() {
  return {
    // title: "AI Chatbot for websites, WhatsApp | Quiksbot",

    title: "Quiksbot • AI Chatbot for Websites • WhatsApp Integration",

    description:
      "Explore how AI chatbots boost sales, provide support, and streamline appointment scheduling to enhance services with Quiksbot, Embed AI chatbots on your website, integrate with WhatsApp, and leverage advanced analytics. Connect using APIs from OpenAI, Anthropic, Grok, and Deepseek for fully customizable chatbot experiences.",
    keywords:
      "free ai, free artificial intelligence, cheap ai, live chatbot, live chat, ai scheduling appointment, easy ai appointment booking, affordable ai,  affordable artificial intelligence, low budget ai, ai chatbot, chatbot ai,  chat ai, chatbot analytics, chatbot integration, customer service chatbot, chat ai online, ai chat online, user experience, machine learning, natural language, LLM, openai chat, openai, quiksbot, claude ai, deepseek ai, claude chat, ai deepseek chat, claude ai chat, chat ai claude, claude api key, quick ai learning, ai chat, ai bot, ai chat free, ai chatbot free, ai chatbot online, ai chatbot online free, ai texting bot, ai to talk to, artificial intelligence online chat, chat artificial intelligence, talk to artificial, email marketing, marketing campaign tool, ai whatsApp Integration",

    icons: {
      icon: ["/favicon.ico?v=4"],
      apple: ["/favicon.png?v=4"],
      shortcut: ["/favicon.png"],
      sizes: ["32x32", "72x72", "96x96", "144x144", "192x192"],
    },

    twitter: {
      card: "summary_large_image",
    },
    facebook: {
      card: "summary_large_image",
    },
    instagram: {
      card: "summary_large_image",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTIC;
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body className={`${inter.className} bg-transparent `}>
          <link rel='icon' href='/favicon.ico' sizes='any' />
          <Script
            id='google_analytic'
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy='beforeInteractive'
          />

          <Script
            id='google_analytic_inline'
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
              function gtag() {
                dataLayer.push(arguments);
              }
              gtag("js", new Date());
              gtag("config", "${googleAnalyticsId}");`,
            }}
            strategy='beforeInteractive'
          />

          <ConvexClerkProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='light'
              enableSystem
              disableTransitionOnChange
            >
              {children}

              <Toaster
                position='bottom-center'
                className='w-full max-w-sm mx-auto '
              />

              <script
                src='https://www.quiksbot.com/api/chatbotWidget?id=8e2f1bb5-2c1d-40b7-a912-0439bf0eeceb'
                data-name='quiksbot'
                data-address='https://www.quiksbot.com'
                data-widget-size='normal'
                data-widget-button-size='normal'
                defer
              ></script>
            </ThemeProvider>
          </ConvexClerkProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
