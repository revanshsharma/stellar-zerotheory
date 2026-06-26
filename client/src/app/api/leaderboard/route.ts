import {
  rpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
  Keypair,
  Account,
  Address,
  Operation,
  xdr,
} from "@stellar/stellar-sdk";

const RPC_URL = "https://soroban-testnet.stellar.org";
const CONTRACT_ADDRESS = "CCJX7PIJ7QMUN7QU6JNMFINL3VVIOAF5XKFO5Q7LBFN2WQNPZRIQ3G2V"; // Replace after deploy
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const server = new rpc.Server(RPC_URL);

const simAccount = new Account(Keypair.random().publicKey(), "0");

interface LeaderboardEntry {
  address: string;
  xp: number;
  wins: number;
  joined: number;
}

function makeContractCall(method: string, args: xdr.ScVal[]): xdr.Operation {
  return Operation.invokeContractFunction({
    contract: CONTRACT_ADDRESS,
    function: method,
    args,
  });
}

async function simulateContractCall(method: string, args: xdr.ScVal[]): Promise<any> {
  const tx = new TransactionBuilder(simAccount, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(makeContractCall(method, args))
    .setTimeout(300)
    .build();

  const result = await server.simulateTransaction(tx);
  if (!("result" in result) || !result.result) {
    throw new Error("Simulation failed");
  }
  return scValToNative(result.result.retval);
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);

    const challengeCount = Number(
      await simulateContractCall("get_challenge_count", [])
    );

    const playerSet = new Set<string>();

    for (let i = 1; i <= challengeCount; i++) {
      try {
        const players = await simulateContractCall("get_challenge_players", [
          nativeToScVal(i, { type: "u64" }),
        ]);
        if (Array.isArray(players)) {
          players.forEach((p: any) => playerSet.add(p.toString()));
        }
      } catch {
        // skip challenges that error
      }
    }

    const entries: LeaderboardEntry[] = [];
    for (const addr of playerSet) {
      try {
        const stats = await simulateContractCall("get_player_stats", [
          new Address(addr).toScVal(),
        ]);
        entries.push({
          address: addr,
          xp: Number(stats.xp),
          wins: Number(stats.challenges_won),
          joined: Number(stats.challenges_joined),
        });
      } catch {
        // skip players that error
      }
    }

    entries.sort((a, b) => b.xp - a.xp);
    const top = entries.slice(0, limit);

    return Response.json({ entries: top, total: entries.length });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
