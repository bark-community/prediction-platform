"use client";

import dynamic from "next/dynamic";

import { WalletError } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
// import { CoinbaseWalletAdapter } from "@solana/wallet-adapter-wallets";
import { ReactNode, useCallback, useMemo } from "react";
import { toWalletAdapterNetwork, useCluster } from "../components/cluster/cluster-data-access";

require("@solana/wallet-adapter-react-ui/styles.css");

export const WalletButton = dynamic(async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton, {
  ssr: false,
});

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster();
  const endpoint = useMemo(() => cluster.endpoint, [cluster]);
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter({
        network: toWalletAdapterNetwork(cluster.network),
      }),
      // new CoinbaseWalletAdapter({
      //   network: toWalletAdapterNetwork(cluster.network),
      // }),
    ],
    [cluster]
  );

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}