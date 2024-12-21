"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { WalletIcon, ChartBarIcon, CogIcon } from "@heroicons/react/24/outline";
import { ConnectButton, lightTheme } from "thirdweb/react";
import { client } from "@/app/client";
import { avalanche, avalancheFuji, ethereum, modeTestnet, bsc, base } from "thirdweb/chains";
import OktoConnect from "./OktoConnect";

const navItems = [
  {
    name: "Portfolio",
    href: "/",
    icon: ChartBarIcon
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: WalletIcon
  },
  {
    name: "Settings",
    href: "/settings",
    icon: CogIcon
  }
];

export function Navbar() {
  const pathname = usePathname();

  // Hide navbar on deck page
  if (pathname === "/deck") return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--card-dark)]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-[var(--primary-blue)] to-[var(--secondary-blue)] bg-clip-text text-transparent">
                SolMate
              </span>
            </Link>
          </div>

          <div className="hidden sm:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${isActive
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute inset-0 bg-[var(--primary-blue)]/10 rounded-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <OktoConnect />
            {/* <ConnectButton
              client={client}
              theme={lightTheme()}
              chains={[avalancheFuji, avalanche, modeTestnet, ethereum, bsc, base]}
              connectButton={{
                style: {
                  fontSize: '0.75rem !important',
                  height: '2.5rem !important',
                },
                label: 'Sign In',
              }}
            // accountAbstraction={{
            //   chain: avalancheFuji,
            //   sponsorGas: true,
            // }}
            /> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
