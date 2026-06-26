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
    const addressStr = url.searchParams.get("address");

    if (!addressStr) {
      return Response.json(
        { error: "address query parameter is required" },
        { status: 400 }
      );
    }

    const [stats, count] = await Promise.all([
      simulateContractCall("get_player_stats", [
        new Address(addressStr).toScVal(),
      ]).catch(() => ({ xp: 0, challenges_won: 0, challenges_joined: 0 })),
      simulateContractCall("get_challenge_count", []).catch(() => 0),
    ]);

    return Response.json({
      address: addressStr,
      xp: Number(stats.xp),
      challenges_won: Number(stats.challenges_won),
      challenges_joined: Number(stats.challenges_joined),
      total_challenges: Number(count),
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
