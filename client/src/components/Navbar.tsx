"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/wallet";
import { shortAddress } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { address, isConnected, isConnecting, connect, disconnect, error } =
    useWallet();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/challenges", label: "Challenges" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white text-sm group-hover:shadow-lg group-hover:shadow-violet-500/25 transition-all duration-300">
              ZT
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              ZeroTheory
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-violet-500/10 text-violet-400"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center gap-3">
            {isConnected && address ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm text-zinc-300 font-mono">
                    {shortAddress(address)}
                  </span>
                </div>
                <button
                  onClick={disconnect}
                  className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
            {error && (
              <span className="hidden lg:block text-xs text-red-400 max-w-xs truncate">
                {error}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
