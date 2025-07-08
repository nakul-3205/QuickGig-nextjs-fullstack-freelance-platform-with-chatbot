// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'

import { ClerkProvider } from "@clerk/nextjs";
import Chatbot from "@/components/Chatbot";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickGig",
  description: "Freelancer meets Gigs!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      {/* The 'dark' class will be added/removed by HomePage's JavaScript on this html tag */}
      <html lang="en" suppressHydrationWarning>
        <body
          className={`
            ${geistSans.variable} 
            ${geistMono.variable} 
            antialiased 
          `}
        >
          {children}
           <Toaster position="top-right" reverseOrder={false} />
           <Chatbot/>
        </body>
      </html>
    </ClerkProvider>
  );
}
