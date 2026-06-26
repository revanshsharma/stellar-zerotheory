export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white text-xs">
                ZT
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                ZeroTheory
              </span>
            </div>
            <p className="text-sm text-zinc-500 max-w-md">
              The unified skill-up gaming platform on Stellar. Earn, learn, and
              level up your Web3 journey through on-chain challenges.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">
              Platform
            </h3>
            <ul className="space-y-2">
              {["Challenges", "Dashboard", "Leaderboard", "FAQ"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-3">
              Network
            </h3>
            <ul className="space-y-2">
              {["Stellar Docs", "Soroban Docs", "Freighter", "Status"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} ZeroTheory. Built on Stellar.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-600">Powered by Soroban</span>
            <span className="text-zinc-700">•</span>
            <span className="text-xs text-zinc-600">Testnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
