"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const checkConnection = useCallback(async () => {
    try {
      const connected = await isConnected();
      if (connected.isConnected) {
        const allowed = await isAllowed();
        if (allowed.isAllowed) {
          const addr = await getAddress();
          setState({
            address: addr.address,
            isConnected: true,
            isConnecting: false,
            error: null,
          });
        }
      }
    } catch {
      // Freighter not installed
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Freighter wallet not detected. Please install Freighter.",
        }));
        return;
      }

      await requestAccess();
      const allowed = await isAllowed();
      if (!allowed.isAllowed) {
        setState((prev) => ({
          ...prev,
          isConnecting: false,
          error: "Access to Freighter was denied.",
        }));
        return;
      }

      const addr = await getAddress();
      setState({
        address: addr.address,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (err: any) {
      setState({
        address: null,
        isConnected: false,
        isConnecting: false,
        error: err?.message || "Failed to connect wallet",
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const signWithFreighter = useCallback(
    async (txXdr: string): Promise<string> => {
      const result = await signTransaction(txXdr, {
        networkPassphrase: "Test SDF Network ; September 2015",
      });
      return result.signedTxXdr;
    },
    []
  );

  return {
    ...state,
    connect,
    disconnect,
    checkConnection,
    signWithFreighter,
  };
}
