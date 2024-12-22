"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import "./globals.css";
import { Inter } from "next/font/google";
import { MainLayout } from "@/components/layouts/MainLayout";
import { ThirdwebProvider } from "thirdweb/react";
import { QueryClient, QueryClientProvider } from 'react-query';
import Provider from "./Provider";
import AppWalletProvider from "@/components/AppWalletProvider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const queryClient = new QueryClient();

  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body
        className={`${inter.className} bg-dark-navy min-h-screen antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <Provider>
            <AppWalletProvider>
              <MainLayout>{children}</MainLayout>
            </AppWalletProvider>
          </Provider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
