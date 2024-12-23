"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`fixed bottom-0 left-0 right-0 text-white border-t ${className}`}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="text-sm text-gray-600">
          © 2024 Solmate. All rights reserved.
        </div>

        <div className="flex items-center space-x-4">
          <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
            Privacy Policy
          </a>
          <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
