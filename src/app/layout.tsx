import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

import { EdgeStoreProvider } from "@/lib/edgestore";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BASE_URL } from "../../constant/url";
import Chatbot from "@/components/Bot/Chatbot";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata() {
  return {
    title:
      "AI Chatbot for Websites | Engage Leads with AI-Powered SalesBot | Quiksbot",
    description:
      "Explore how AI chatbots can boost sales and enhance customer service. Learn about chatbot embedding, advanced analytics, and integrating with OpenAI API. Quiksbot offers features for lead generation, PDF interactions, and exporting chat logs. Perfect for websites looking to improve engagement and manage customer data efficiently.",
    keywords:
      "AI chatbot, SalesBot, website chatbot, lead generation, chatbot analytics, OpenAI API, PDF interaction, chatbot integration, customer service chatbot, chat log export",

    icons: {
      icon: ["/favicon.ico?v=4"],
      apple: ["/favicon.png?v=4"],
      shortcut: ["/favicon.png"],
      sizes: ["32x32", "72x72", "96x96", "144x144", "192x192"], // Common sizes
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
    <ClerkProvider publishableKey={publishableKey}>
      <html lang='en'>
        <body className={`${inter.className} bg-transparent `}>
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
            <EdgeStoreProvider>{children}</EdgeStoreProvider>
            <Script
              src='http://localhost:3000/api/chatbotWidget'
              data-name='quiksbot'
              data-address='http://localhost:3000'
              data-position='right'
              data-id='9656a02f-5657-425b-a01f-57668c173039'
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
