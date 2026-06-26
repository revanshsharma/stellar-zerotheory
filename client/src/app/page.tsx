"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/wallet";
import { useEffect, useState } from "react";
import {
  getChallengeCount,
  type PlayerStats,
} from "@/hooks/contract";
import { shortAddress } from "@/lib/utils";

const features = [
  {
    title: "On-Chain Challenges",
    desc: "Battle through real Soroban smart contract challenges. Stake XLM, solve problems, and prove your Web3 skills.",
    icon: "⚔️",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Earn XP & Rewards",
    desc: "Level up your skills with every challenge completed. Earn experience points and XLM rewards for winning.",
    icon: "🏆",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Build Real DApps",
    desc: "Work on practical blockchain projects — tokens, DEXs, NFTs, DAOs. Your code goes live on Stellar testnet.",
    icon: "🔨",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Web3 Career Path",
    desc: "Follow curated learning tracks from zero to Soroban hero. Showcase your verified on-chain achievements.",
    icon: "🚀",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Stellar Payments",
    desc: "Challenge stakes use real XLM transactions. Win or learn — every interaction prepares you for mainnet.",
    icon: "💎",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Community Leaderboard",
    desc: "Compete globally. Your rank reflects real on-chain achievements. Top players earn recognition and rewards.",
    icon: "👑",
    gradient: "from-yellow-500 to-amber-500",
  },
];

const stats = [
  { label: "Challenges Live", value: "—", suffix: "" },
  { label: "Active Players", value: "—", suffix: "" },
  { label: "Total XP Earned", value: "—", suffix: "" },
  { label: "XLM Staked", value: "—", suffix: "" },
];

export default function Home() {
  const { address, isConnected, connect } = useWallet();
  const [challengeCount, setChallengeCount] = useState<number>(0);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    getChallengeCount()
      .then((c) => setChallengeCount(c))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (address) {
      import("@/hooks/contract")
        .then((m) =>
          m.getPlayerStats(address).then((s) => setPlayerStats(s))
        )
        .catch(() => {});
    }
  }, [address]);

  const displayStats = [
    { label: "Challenges Live", value: challengeCount.toString(), suffix: "" },
    { label: "Active Players", value: "—", suffix: "" },
    { label: "Total XP Earned", value: playerStats ? playerStats.xp.toString() : "—", suffix: "" },
    { label: "XLM Staked", value: "—", suffix: "" },
  ];

  return (
    <div className="flex flex-col">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "3s" }} />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-sm text-violet-300 font-medium">
                  Built on Stellar + Soroban
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Learn. Build.
                <br />
                <span className="text-gradient">Earn On-Chain.</span>
              </h1>
              <p className="text-lg sm:text-xl text-zinc-400 max-w-xl mb-8 leading-relaxed">
                ZeroTheory is the unified Web3 skill-up platform where you
                complete on-chain challenges, earn XP, win XLM rewards, and
                prove your blockchain development skills — all on Stellar.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {isConnected && address ? (
                  <Link
                    href="/challenges"
                    className="px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 glow"
                  >
                    Explore Challenges →
                  </Link>
                ) : (
                  <button
                    onClick={connect}
                    className="px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 glow"
                  >
                    Connect Wallet to Start
                  </button>
                )}
                <Link
                  href="#features"
                  className="px-8 py-4 text-base font-semibold rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right - Stats Cube */}
            <div className="flex-1 max-w-lg w-full animate-slide-up">
              <div className="glass rounded-2xl p-8 glow">
                <div className="grid grid-cols-2 gap-6">
                  {displayStats.map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-3xl font-bold bg-gradient-to-b from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                        {s.value}
                      </div>
                      <div className="text-sm text-zinc-500 mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
                {address && (
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">Wallet</span>
                      <span className="text-sm font-mono text-violet-400">
                        {shortAddress(address)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="text-gradient">level up</span>
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              ZeroTheory combines learning, gaming, and real blockchain
              experience into one unified platform.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group glass rounded-xl p-6 hover:border-zinc-700 transition-all duration-300 hover:glow"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${f.gradient} flex items-center justify-center text-xl mb-4`}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-violet-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-2xl p-12 glow">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to start your{" "}
              <span className="text-gradient">Web3 journey?</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-lg mx-auto">
              Connect your Freighter wallet, pick a challenge, and start earning
              on-chain achievements today.
            </p>
            {isConnected && address ? (
              <Link
                href="/challenges"
                className="inline-flex px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-xl shadow-violet-500/25 glow"
              >
                Browse Challenges
              </Link>
            ) : (
              <button
                onClick={connect}
                className="inline-flex px-8 py-4 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-xl shadow-violet-500/25 glow"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
