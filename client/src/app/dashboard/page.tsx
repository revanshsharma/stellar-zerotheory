"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/wallet";
import ChallengeCard from "@/components/ChallengeCard";
import {
  getPlayerStats,
  getChallengeCount,
  getChallenge,
  getChallengePlayers,
  joinChallenge,
  type PlayerStats,
  type Challenge,
} from "@/hooks/contract";
import { shortAddress } from "@/lib/utils";

export default function DashboardPage() {
  const { address, isConnected, connect, signWithFreighter } = useWallet();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!address) return;
    try {
      setLoading(true);
      const [playerStats, count] = await Promise.all([
        getPlayerStats(address),
        getChallengeCount(),
      ]);
      setStats(playerStats);

      const items: Challenge[] = [];
      const joined = new Set<number>();

      for (let i = 1; i <= count; i++) {
        try {
          const challenge = await getChallenge(i);
          items.push(challenge);

          if (!challenge.completed) {
            try {
              const players = await getChallengePlayers(challenge.id);
              if (players.some((p) => p === address)) {
                joined.add(challenge.id);
              }
            } catch {
              // skip
            }
          }
        } catch {
          // skip
        }
      }

      setChallenges(items);
      setJoinedIds(joined);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleJoin = async (challengeId: number) => {
    if (!address) return;
    setJoining(challengeId);
    setError(null);
    try {
      await joinChallenge(address, challengeId, signWithFreighter);
      await loadDashboard();
    } catch (err: any) {
      setError(err?.message || "Failed to join");
    } finally {
      setJoining(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-12 max-w-md">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-2xl font-bold mb-3">Dashboard</h1>
          <p className="text-zinc-400 mb-6">
            Connect your wallet to view your dashboard.
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

  const myChallenges = challenges.filter((c) => joinedIds.has(c.id));
  const wonChallenges = challenges.filter(
    (c) => c.completed && c.winner === address
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-1">
            Track your progress and manage your challenges.
          </p>
        </div>
        <Link
          href="/challenges"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
        >
          Browse Challenges
        </Link>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="glass rounded-xl p-6 animate-pulse h-24"
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="glass rounded-xl p-6">
              <div className="text-3xl font-bold bg-gradient-to-b from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-1">
                {stats?.xp ?? 0}
              </div>
              <div className="text-sm text-zinc-500">Total XP</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-1">
                {stats?.challenges_won ?? 0}
              </div>
              <div className="text-sm text-zinc-500">Challenges Won</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-3xl font-bold text-cyan-400 mb-1">
                {stats?.challenges_joined ?? 0}
              </div>
              <div className="text-sm text-zinc-500">Challenges Joined</div>
            </div>
            <div className="glass rounded-xl p-6">
              <div className="text-3xl font-bold text-amber-400 mb-1">
                {myChallenges.length}
              </div>
              <div className="text-sm text-zinc-500">Active Challenges</div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="glass rounded-xl p-6 mb-10">
            <h2 className="text-sm font-medium text-zinc-500 mb-2">Wallet</h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono text-zinc-300">
                {address ? shortAddress(address) : ""}
              </span>
            </div>
          </div>

          {/* Active Challenges */}
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-4">Active Challenges</h2>
            {myChallenges.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-zinc-400 mb-4">
                  You haven&apos;t joined any challenges yet.
                </p>
                <Link
                  href="/challenges"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
                >
                  Browse Challenges
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myChallenges
                  .filter((c) => !c.completed)
                  .map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      isJoined={true}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Completed / Won */}
          {wonChallenges.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">🏆 Completed</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wonChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isJoined={true}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
