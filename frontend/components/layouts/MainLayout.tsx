"use client";

import { Navbar } from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar - fixed height */}
      <Navbar className="h-16" />

      {/* Main content - takes remaining space */}
      <main className="flex-grow pt-16 pb-16">
        {children}
      </main>

      {/* Footer - fixed height */}
      <Footer className="h-16" />
    </div>
  );
}
