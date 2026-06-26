"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/wallet";
import ChallengeCard from "@/components/ChallengeCard";
import {
  getChallengeCount,
  getChallenge,
  getChallengePlayers,
  joinChallenge,
  type Challenge,
} from "@/hooks/contract";

const categories = [
  "All",
  "Development",
  "DeFi",
  "Build",
  "Coding",
  "Design",
  "Security",
];

export default function ChallengesPage() {
  const { address, isConnected, connect, signWithFreighter } = useWallet();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const [activeCategory, setActiveCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);

  const loadChallenges = useCallback(async () => {
    try {
      const count = await getChallengeCount();
      const items: Challenge[] = [];
      for (let i = 1; i <= count; i++) {
        try {
          items.push(await getChallenge(i));
        } catch {
          // skip missing
        }
      }
      setChallenges(items);

      // Check which ones user joined
      if (address) {
        const joined = new Set<number>();
        for (const c of items) {
          if (c.completed) continue;
          try {
            const players = await getChallengePlayers(c.id);
            if (players.some((p) => p === address)) {
              joined.add(c.id);
            }
          } catch {
            // skip
          }
        }
        setJoinedIds(joined);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleJoin = async (challengeId: number) => {
    if (!address) {
      await connect();
      return;
    }
    setJoining(challengeId);
    setError(null);
    try {
      await joinChallenge(address, challengeId, signWithFreighter);
      setJoinedIds((prev) => new Set(prev).add(challengeId));
      await loadChallenges();
    } catch (err: any) {
      setError(err?.message || "Failed to join challenge");
    } finally {
      setJoining(null);
    }
  };

  const filtered =
    activeCategory === "All"
      ? challenges
      : challenges.filter((c) => c.category === activeCategory);

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-12 max-w-md">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold mb-3">Connect Your Wallet</h1>
          <p className="text-zinc-400 mb-6">
            Connect your Freighter wallet to browse and join challenges.
          </p>
          <button
            onClick={connect}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="text-zinc-400 mt-1">
            Complete challenges, earn XP, and win XLM rewards.
          </p>
        </div>
        <Link
          href="/challenges/create"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
        >
          + Create Challenge
        </Link>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="glass rounded-xl p-5 animate-pulse h-48"
            >
              <div className="h-1.5 bg-zinc-800 rounded-full mb-4 w-1/3" />
              <div className="h-5 bg-zinc-800 rounded-full mb-3 w-2/3" />
              <div className="h-4 bg-zinc-800 rounded-full mb-2 w-1/2" />
              <div className="h-4 bg-zinc-800 rounded-full w-1/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold text-zinc-300 mb-2">
            No challenges found
          </h2>
          <p className="text-zinc-500 mb-6">
            {challenges.length === 0
              ? "No challenges have been created yet. Be the first!"
              : `No challenges in "${activeCategory}" category.`}
          </p>
          {challenges.length === 0 && (
            <Link
              href="/challenges/create"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
            >
              Create Challenge
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onJoin={handleJoin}
              isJoined={joinedIds.has(challenge.id)}
              isAdmin={
                !!address && challenge.creator === address
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
