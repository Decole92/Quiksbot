import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BASE_URL } from "../../constant/url";
import Chatbot from "@/components/Bot/Chatbot";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiksbot",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang='en'>
        <body className={`${inter.className}  bg-gray-100 dark:bg-gray-950  `}>
          <script
            src={`${BASE_URL}/api/chatbotWidget`}
            data-name='quiksbot'
            data-address={`${BASE_URL}`}
            data-id='e3fb7e4c-ce42-4406-8d8f-2e5965bc4d3d'
            data-widget-size='normal'
            data-widget-button-size='normal'
            defer
          />

          <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem
            disableTransitionOnChange
          >
            <EdgeStoreProvider>
              {children}
              <Toaster position='bottom-center' />
            </EdgeStoreProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
