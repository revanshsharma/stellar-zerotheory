# ZeroTheory Contract

Soroban smart contract for the ZeroTheory Web3 skill-up platform.

## Structure

```
contract/
├── Cargo.toml                  # Workspace root (soroban-sdk v25)
├── contracts/contract/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs              # Contract implementation
│       └── test.rs             # Unit tests
└── target/                     # Build artifacts
```

## Build

```bash
stellar contract build
```

## Test

```bash
cargo test
```

## Deploy

```bash
stellar keys generate dev --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32v1-none/release/contract.wasm \
  --source-account dev --network testnet
```
