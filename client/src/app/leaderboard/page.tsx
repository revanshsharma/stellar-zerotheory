"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@/hooks/wallet";
import { shortAddress } from "@/lib/utils";

interface LeaderboardEntry {
  address: string;
  xp: number;
  wins: number;
  joined: number;
}

export default function LeaderboardPage() {
  const { address, isConnected, connect } = useWallet();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/leaderboard?limit=50");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");
        const data = await res.json();
        setEntries(data.entries || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">🏆 Leaderboard</h1>
        <p className="text-zinc-400">
          Top players ranked by total XP earned through on-chain challenges.
        </p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="glass rounded-xl p-4 animate-pulse flex items-center gap-4"
            >
              <div className="w-8 h-8 bg-zinc-800 rounded-full" />
              <div className="flex-1 h-4 bg-zinc-800 rounded" />
              <div className="w-16 h-4 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl">
          <div className="text-5xl mb-4">👑</div>
          <h2 className="text-xl font-semibold mb-2">No players yet</h2>
          <p className="text-zinc-500 mb-6">
            Be the first to join a challenge and earn XP!
          </p>
          {!isConnected && (
            <button
              onClick={connect}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all"
            >
              Connect Wallet
            </button>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Headers */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800 text-sm text-zinc-500 font-medium">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-2 text-right">XP</div>
            <div className="col-span-2 text-right">Won</div>
            <div className="col-span-2 text-right">Joined</div>
          </div>

          {/* Rows */}
          {entries.map((entry, i) => {
            const isMe = isConnected && address === entry.address;
            const rank = i + 1;
            let rankDisplay = `#${rank}`;
            let rankColor = "text-zinc-400";

            if (rank === 1) {
              rankDisplay = "🥇";
              rankColor = "";
            } else if (rank === 2) {
              rankDisplay = "🥈";
              rankColor = "";
            } else if (rank === 3) {
              rankDisplay = "🥉";
              rankColor = "";
            }

            return (
              <div
                key={entry.address}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                  isMe
                    ? "bg-violet-500/5 border-l-2 border-violet-500"
                    : "hover:bg-zinc-800/30 border-l-2 border-transparent"
                } ${i < entries.length - 1 ? "border-b border-zinc-800/50" : ""}`}
              >
                <div className={`col-span-1 text-lg ${rankColor}`}>
                  {rankDisplay}
                </div>
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {entry.address.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <span
                      className={`font-mono text-sm ${
                        isMe ? "text-violet-400" : "text-zinc-300"
                      }`}
                    >
                      {shortAddress(entry.address)}
                    </span>
                    {isMe && (
                      <span className="ml-2 text-xs text-violet-500">
                        (you)
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 text-right font-mono text-emerald-400 font-semibold">
                  {entry.xp}
                </div>
                <div className="col-span-2 text-right font-mono text-zinc-300">
                  {entry.wins}
                </div>
                <div className="col-span-2 text-right font-mono text-zinc-500">
                  {entry.joined}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
