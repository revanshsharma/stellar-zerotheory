# ZeroTheory — Web3 Skill-Up Platform

Learn, build, and earn on-chain with Soroban smart contracts on Stellar.

ZeroTheory is a blockchain-powered challenge platform where admins create on-chain challenges, players join them, and winners earn XP and reputation — all verified on the Stellar network.

## Project Structure

```
.
├── contract/                          # Soroban smart contract workspace
│   ├── Cargo.toml                     # Workspace root (soroban-sdk v25)
│   ├── contracts/contract/
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs                 # ZeroTheory smart contract
│   │       └── test.rs                # Contract tests
│   └── README.md
├── client/                            # Next.js frontend
│   ├── src/
│   │   ├── app/                       # Next.js App Router pages
│   │   │   ├── page.tsx               # Landing page
│   │   │   ├── challenges/            # Challenge listing & creation
│   │   │   ├── dashboard/             # Player dashboard
│   │   │   ├── leaderboard/           # Leaderboard
│   │   │   └── profile/              # Player profile
│   │   ├── components/                # UI components
│   │   ├── hooks/
│   │   │   ├── contract.ts            # Contract interaction helpers
│   │   │   └── wallet.ts              # Freighter wallet integration
│   │   └── lib/utils.ts              # Shared utilities
│   └── package.json                   # Next.js 16 + Stellar SDK
├── README.md                          # This file
```

## Smart Contract

The contract (`ZeroTheory`) manages:

- **Challenges** — on-chain records with title, category, stake, creator, players, and winner
- **Player Stats** — XP, challenges won, challenges joined per address
- **Admin Auth** — only the admin can create and complete challenges

### Contract Functions

| Function | Auth | Description |
|---|---|---|
| `init(admin)` | — | Initialize the contract with an admin address |
| `create_challenge(creator, title, category, stake)` | admin | Create a new challenge, returns challenge ID |
| `join_challenge(player, challenge_id)` | player | Join an active challenge |
| `complete_challenge(caller, challenge_id, winner)` | admin | Mark challenge complete, award XP |
| `get_challenge(challenge_id)` | read | Get challenge details |
| `get_player_stats(player)` | read | Get player XP and stats |
| `get_challenge_players(challenge_id)` | read | Get list of player addresses in a challenge |
| `get_challenge_count()` | read | Get total number of challenges |

## Getting Started

### Prerequisites

- Rust toolchain with `wasm32v1-none` target
- Stellar CLI (`stellar`)
- Node.js 20+ and `bun`
- Freighter wallet browser extension

### Build & Test the Contract

```bash
# Build the contract
cd contract && stellar contract build

# Run tests
cargo test
```

### Deploy to Testnet

```bash
# Generate a funded keypair
stellar keys generate dev --network testnet --fund

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/contract.wasm \
  --source-account dev --network testnet
```

Copy the returned contract address (`C...`) and update `CONTRACT_ADDRESS` in `client/src/hooks/contract.ts`.

### Run the Frontend

```bash
cd client
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your Freighter wallet.

## Tech Stack

- **Smart Contract**: Rust + Soroban SDK v25
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Blockchain**: Stellar testnet
- **Wallet**: Freighter
- **SDK**: @stellar/stellar-sdk v16, @stellar/freighter-api v6

## Testnet Faucet

To fund a wallet on Stellar testnet, use the [Stellar Lab friendbot](https://laboratory.stellar.org/#account-creator?network=testnet).
