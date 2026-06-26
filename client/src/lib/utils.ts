import {
  nativeToScVal,
  scValToNative,
  Address,
  xdr,
} from "@stellar/stellar-sdk";

export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const RPC_URL = "https://soroban-testnet.stellar.org";

export function shortAddress(addr: string): string {
  if (!addr) return "";
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export function formatXlm(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(2);
}

// ScVal converters for contract interaction
export function toScValString(v: string) {
  return nativeToScVal(v, { type: "string" });
}

export function toScValU32(v: number) {
  return nativeToScVal(v, { type: "u32" });
}

export function toScValI128(v: number | bigint) {
  return nativeToScVal(v, { type: "i128" });
}

export function toScValAddress(v: string) {
  return new Address(v).toScVal();
}

export function toScValBool(v: boolean) {
  return nativeToScVal(v);
}

export function toScValSymbol(v: string) {
  return nativeToScVal(v, { type: "symbol" });
}

export function toScValU64(v: number | bigint) {
  return nativeToScVal(v, { type: "u64" });
}

export function toScValI64(v: number | bigint) {
  return nativeToScVal(v, { type: "i64" });
}

export function parseScVal(sv: xdr.ScVal): any {
  return scValToNative(sv);
}
