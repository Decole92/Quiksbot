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
            src='https://quiksbot.com/api/chatbotWidget'
            data-name='quiksbot'
            data-address='https://quiksbot.com'
            data-id='9462b5d9-4625-4a89-8fa6-987517d573d9'
            data-widget-size='normal'
            data-widget-button-size='normal'
            defer
          ></script>

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
