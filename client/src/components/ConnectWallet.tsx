"use client";

import { useWallet } from "@/hooks/wallet";

export default function ConnectWallet() {
  const { address, isConnected, isConnecting, connect, disconnect, error } =
    useWallet();

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl">
          🔗
        </div>
        <div>
          <p className="text-sm text-zinc-400 mb-1">Connected Wallet</p>
          <p className="font-mono text-zinc-200 text-sm break-all">
            {address}
          </p>
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-all"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl">
        💼
      </div>
      <div>
        <p className="text-lg font-semibold text-zinc-200 mb-1">
          Connect Your Wallet
        </p>
        <p className="text-sm text-zinc-500">
          Connect Freighter to interact with ZeroTheory challenges
        </p>
      </div>
      <button
        onClick={connect}
        disabled={isConnecting}
        className="px-6 py-3 text-sm font-medium rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-violet-500/20"
      >
        {isConnecting ? "Connecting..." : "Connect Freighter Wallet"}
      </button>
      {error && (
        <p className="text-xs text-red-400 max-w-xs">{error}</p>
      )}
      <p className="text-xs text-zinc-600 mt-2">
        Don&apos;t have Freighter?{" "}
        <a
          href="https://freighter.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 hover:text-violet-300 underline"
        >
          Install it here
        </a>
      </p>
    </div>
  );
}
