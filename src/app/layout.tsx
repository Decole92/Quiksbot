import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { EdgeStoreProvider } from "@/lib/edgestore";
import { ThemeProvider } from "@/components/ThemeProvider";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuiksBot",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* <Script
        src='https://app.wonderchat.io/scripts/wonderchat.js'
        data-name='wonderchat'
        data-address='app.wonderchat.io'
        data-id='clypsx2j9042411ytv26gubmx'
        data-widget-size='normal'
        data-widget-button-size='normal'
        defer
      /> */}
      <html lang='en'>
        <body className={`${inter.className}   bg-gray-100 `}>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
          >
            <EdgeStoreProvider>{children}</EdgeStoreProvider>
            <Toaster position='bottom-center' />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
