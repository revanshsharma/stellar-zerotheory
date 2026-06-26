"use client";

import type { Challenge } from "@/hooks/contract";

const categoryColors: Record<string, string> = {
  Development: "from-cyan-500 to-blue-500",
  DeFi: "from-emerald-500 to-teal-500",
  Build: "from-orange-500 to-red-500",
  Coding: "from-violet-500 to-purple-500",
  Design: "from-pink-500 to-rose-500",
  Security: "from-yellow-500 to-amber-500",
  default: "from-zinc-500 to-zinc-600",
};

const categoryIcons: Record<string, string> = {
  Development: "⚡",
  DeFi: "💰",
  Build: "🔨",
  Coding: "💻",
  Design: "🎨",
  Security: "🔒",
  default: "🎯",
};

interface Props {
  challenge: Challenge;
  onJoin?: (id: number) => void;
  isJoined?: boolean;
  isAdmin?: boolean;
}

export default function ChallengeCard({
  challenge,
  onJoin,
  isJoined,
  isAdmin,
}: Props) {
  const gradient =
    categoryColors[challenge.category] || categoryColors.default;
  const icon = categoryIcons[challenge.category] || categoryIcons.default;

  return (
    <div className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5">
      {/* Category bar */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{icon}</span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white`}
            >
              {challenge.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                challenge.completed ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <span className="text-xs text-zinc-500">
              {challenge.completed ? "Completed" : "Active"}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-zinc-100 mb-2 group-hover:text-violet-400 transition-colors">
          {challenge.title}
        </h3>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Stake:</span>
            <span className="font-mono text-emerald-400 font-medium">
              {challenge.stake} XLM
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500">Players:</span>
            <span className="text-zinc-300 font-mono">
              {challenge.player_count}
            </span>
          </div>
        </div>

        {/* Actions */}
        {!challenge.completed && (
          <div className="flex items-center gap-2">
            {isJoined ? (
              <span className="px-4 py-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg font-medium">
                ✓ Joined
              </span>
            ) : (
              <button
                onClick={() => onJoin?.(challenge.id)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-violet-500/20"
              >
                Join Challenge
              </button>
            )}
            {isAdmin && (
              <button className="px-3 py-2 text-xs text-amber-400 bg-amber-500/10 rounded-lg hover:bg-amber-500/20 transition-colors">
                Complete
              </button>
            )}
          </div>
        )}

        {challenge.completed && challenge.winner && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
            <span className="text-xs text-emerald-400">
              🏆 Won by {challenge.winner.slice(0, 6)}...
              {challenge.winner.slice(-4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
