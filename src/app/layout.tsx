import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { EdgeStoreProvider } from "@/lib/edgestore";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata() {
  return {
    title: "AI Chatbot for websites | Chat with Pdf File | Quiksbot",
    description:
      "Explore how AI chatbot boosts sales and enhances service with chatbot embedding, advanced analytics, PDF interactions, and OpenAI API integration using quiksbot.",
    keywords:
      "ai chatbot, chatbot ai, chat with pdf, chat ai, chatbot analytics, PDF interaction, chatbot integration, customer service chatbot, chat ai online, ai chat online, user experience, machine learning, natural language, LLM, openai chat, openai, quiksbot, quick ai learning, ai chat, ai bot, ai chat free, ai chatbot free, ai chatbot online, ai chatbot online free, ai texting bot, ai to talk to, artificial intelligence online chat, chat artificial intelligence, talk to artificial intelligence",

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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTIC;
  return (
    <ClerkProvider>
      <html lang='en'>
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

          <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem
            disableTransitionOnChange
          >
            <EdgeStoreProvider>
              {children}

              <Toaster
                position='bottom-center'
                className='w-full max-w-sm mx-auto '
              />
            </EdgeStoreProvider>

            <Script
              src='https://quiksbot.com/api/chatbotWidget?id=c8a0dfff-81fa-4ce4-be5e-67a8caff94ce'
              data-name='quiksbot'
              data-address='https://quiksbot.com'
              data-widget-size='normal'
              data-widget-button-size='normal'
              defer
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
