"use client";

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
import { RPC_URL, NETWORK_PASSPHRASE } from "@/lib/utils";

const CONTRACT_ADDRESS = "CCJX7PIJ7QMUN7QU6JNMFINL3VVIOAF5XKFO5Q7LBFN2WQNPZRIQ3G2V"; // Replace after deploy
const server = new rpc.Server(RPC_URL);

export interface Challenge {
  id: number;
  creator: string;
  title: string;
  category: string;
  stake: number;
  completed: boolean;
  winner: string | null;
  player_count: number;
}

export interface PlayerStats {
  xp: number;
  challenges_won: number;
  challenges_joined: number;
}

function parseChallenge(val: any): Challenge {
  return {
    id: Number(val.id),
    creator: val.creator?.toString() || "",
    title: val.title?.toString() || "",
    category: val.category?.toString() || "",
    stake: Number(val.stake),
    completed: Boolean(val.completed),
    winner: val.winner ? val.winner.toString() : null,
    player_count: Number(val.player_count),
  };
}

function parsePlayerStats(val: any): PlayerStats {
  return {
    xp: Number(val.xp),
    challenges_won: Number(val.challenges_won),
    challenges_joined: Number(val.challenges_joined),
  };
}

async function getAccount(publicKey: string) {
  try {
    return await server.getAccount(publicKey);
  } catch {
    throw new Error(
      "Account not funded on testnet. Use the Stellar Lab friendbot to fund it."
    );
  }
}

function buildContractOp(method: string, args: xdr.ScVal[]): xdr.Operation {
  return Operation.invokeContractFunction({
    contract: CONTRACT_ADDRESS,
    function: method,
    args,
  });
}

async function signAndSend(
  txXdr: string,
  signTx: (xdr: string) => Promise<string>
) {
  const signedTxXdr = await signTx(txXdr);
  const tx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  const sendResult = await server.sendTransaction(tx);

  if (sendResult.status === "PENDING") {
    let result = await server.getTransaction(sendResult.hash);
    let attempts = 0;
    while (result.status === "NOT_FOUND" && attempts < 30) {
      await new Promise((r) => setTimeout(r, 1000));
      result = await server.getTransaction(sendResult.hash);
      attempts++;
    }
    if (result.status === "SUCCESS") {
      return result;
    }
    throw new Error(`Transaction failed`);
  }
  throw new Error(`Failed to send transaction`);
}

async function simulateRead(method: string, args: xdr.ScVal[]): Promise<any> {
  const source = new Account(Keypair.random().publicKey(), "0");
  const tx = new TransactionBuilder(source, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(buildContractOp(method, args))
    .setTimeout(300)
    .build();

  const result = await server.simulateTransaction(tx);
  if (!("result" in result) || !result.result) {
    throw new Error("Simulation failed");
  }
  return scValToNative(result.result.retval);
}

// ─── Read Functions ─────────────────────────────────────────────

export async function getChallenge(challengeId: number): Promise<Challenge> {
  const val = await simulateRead("get_challenge", [
    nativeToScVal(challengeId, { type: "u64" }),
  ]);
  return parseChallenge(val);
}

export async function getPlayerStats(
  playerAddress: string
): Promise<PlayerStats> {
  const val = await simulateRead("get_player_stats", [
    new Address(playerAddress).toScVal(),
  ]);
  return parsePlayerStats(val);
}

export async function getChallengeCount(): Promise<number> {
  const val = await simulateRead("get_challenge_count", []);
  return Number(val);
}

export async function getChallengePlayers(
  challengeId: number
): Promise<string[]> {
  const val = await simulateRead("get_challenge_players", [
    nativeToScVal(challengeId, { type: "u64" }),
  ]);
  if (!Array.isArray(val)) return [];
  return (val as any[]).map((a: any) => a.toString());
}

// ─── Write Functions ────────────────────────────────────────────

async function simulateWrite(
  caller: string,
  method: string,
  args: xdr.ScVal[],
  signTx: (xdr: string) => Promise<string>
) {
  const account = await getAccount(caller);
  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(buildContractOp(method, args))
    .setTimeout(300)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!("result" in sim) || !sim.result) {
    throw new Error("Simulation failed");
  }

  const preparedTx = rpc.assembleTransaction(tx, sim).build();
  const result = await signAndSend(
    preparedTx.toEnvelope().toXDR("base64"),
    signTx
  );
  return result;
}

export async function createChallenge(
  caller: string,
  title: string,
  category: string,
  stake: number,
  signTx: (xdr: string) => Promise<string>
) {
  return simulateWrite(caller, "create_challenge", [
    nativeToScVal(title, { type: "string" }),
    nativeToScVal(category, { type: "string" }),
    nativeToScVal(stake, { type: "i128" }),
  ], signTx);
}

export async function joinChallenge(
  caller: string,
  challengeId: number,
  signTx: (xdr: string) => Promise<string>
) {
  return simulateWrite(caller, "join_challenge", [
    nativeToScVal(challengeId, { type: "u64" }),
  ], signTx);
}

export async function completeChallenge(
  caller: string,
  challengeId: number,
  winner: string,
  signTx: (xdr: string) => Promise<string>
) {
  return simulateWrite(caller, "complete_challenge", [
    nativeToScVal(challengeId, { type: "u64" }),
    new Address(winner).toScVal(),
  ], signTx);
}
