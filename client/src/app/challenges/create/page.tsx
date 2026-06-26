"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/wallet";
import { createChallenge } from "@/hooks/contract";

const categories = [
  "Development",
  "DeFi",
  "Build",
  "Coding",
  "Design",
  "Security",
];

export default function CreateChallengePage() {
  const router = useRouter();
  const { address, isConnected, connect, signWithFreighter } = useWallet();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Development");
  const [stake, setStake] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      await connect();
      return;
    }
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    const stakeNum = parseInt(stake);
    if (isNaN(stakeNum) || stakeNum <= 0) {
      setError("Stake must be a positive number");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createChallenge(
        address,
        title.trim(),
        category,
        stakeNum,
        signWithFreighter
      );
      router.push("/challenges");
    } catch (err: any) {
      setError(err?.message || "Failed to create challenge");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center glass rounded-2xl p-12 max-w-md">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold mb-3">Connect to Create</h1>
          <p className="text-zinc-400 mb-6">
            Connect your wallet to create challenges.
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="glass rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-2">Create Challenge</h1>
        <p className="text-zinc-400 mb-8">
          Design a new challenge for the ZeroTheory community.
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Challenge Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Build a Soroban Token"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              disabled={submitting}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              disabled={submitting}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stake */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Stake Amount (XLM)
            </label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="100"
              min="1"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              disabled={submitting}
            />
            <p className="text-xs text-zinc-600 mt-1">
              The stake is a symbolic amount. On testnet, use any amount.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : (
              "Create Challenge"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
