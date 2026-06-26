"use client";

import { useEffect, useState } from "react";
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

export default function ProfilePage() {
  const { address, isConnected, connect, signWithFreighter } = useWallet();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [wonChallenges, setWonChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<number | null>(null);

  useEffect(() => {
    if (!address) return;
    (async () => {
      try {
        setLoading(true);
        const [playerStats, count] = await Promise.all([
          getPlayerStats(address),
          getChallengeCount(),
        ]);
        setStats(playerStats);

        const won: Challenge[] = [];
        for (let i = 1; i <= count; i++) {
          try {
            const c = await getChallenge(i);
            if (c.completed && c.winner === address) {
              won.push(c);
            }
          } catch {
            // skip
          }
        }
        setWonChallenges(won);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [address]);

  const handleJoin = async (challengeId: number) => {
    if (!address) return;
    setJoining(challengeId);
    try {
      await joinChallenge(address, challengeId, signWithFreighter);
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
          <div className="text-5xl mb-4">👤</div>
          <h1 className="text-2xl font-bold mb-3">Profile</h1>
          <p className="text-zinc-400 mb-6">
            Connect your wallet to view your profile.
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
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-zinc-800 animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-xl p-6 animate-pulse h-24" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-violet-500/25">
              {address ? address.slice(2, 4).toUpperCase() : "?"}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold mb-1">
                {address ? shortAddress(address) : "Anonymous"}
              </h1>
              {address && (
                <p className="text-sm text-zinc-500 font-mono break-all">
                  {address}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-zinc-400">Connected</span>
                </div>
                <span className="text-xs text-zinc-600">Testnet</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-b from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {stats?.xp ?? 0}
              </div>
              <div className="text-sm text-zinc-500 mt-1">Experience</div>
              <div className="mt-2 w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                  style={{
                    width: `${Math.min((stats?.xp ?? 0) / 10, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-emerald-400">
                {stats?.challenges_won ?? 0}
              </div>
              <div className="text-sm text-zinc-500 mt-1">Won</div>
              <div className="text-2xl mt-2">🏆</div>
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400">
                {stats?.challenges_joined ?? 0}
              </div>
              <div className="text-sm text-zinc-500 mt-1">Joined</div>
              <div className="text-2xl mt-2">📋</div>
            </div>
          </div>

          {/* XP Level Badge */}
          <div className="glass rounded-xl p-6 mb-10">
            <h2 className="text-sm font-medium text-zinc-500 mb-3">Level</h2>
            <div className="flex items-center gap-4">
              <div className="text-3xl">
                {stats && stats.xp >= 500
                  ? "🔥"
                  : stats && stats.xp >= 200
                  ? "⚡"
                  : stats && stats.xp >= 50
                  ? "🌱"
                  : "🥚"}
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {stats && stats.xp >= 500
                    ? "Soroban Master"
                    : stats && stats.xp >= 200
                    ? "Crypto Wizard"
                    : stats && stats.xp >= 50
                    ? "Blockchain Apprentice"
                    : "Rookie"}
                </div>
                <div className="text-sm text-zinc-500">
                  {stats?.xp ?? 0} / {stats && stats.xp >= 500 ? "∞" : stats && stats.xp >= 200 ? "500" : stats && stats.xp >= 50 ? "200" : "50"} XP to next level
                </div>
              </div>
            </div>
          </div>

          {/* Won Challenges */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              🏆 Won Challenges ({wonChallenges.length})
            </h2>
            {wonChallenges.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-zinc-400">
                  No challenges won yet. Keep learning and competing!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wonChallenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isJoined={true}
                    onJoin={handleJoin}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
