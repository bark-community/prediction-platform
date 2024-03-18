"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "@/providers/solana-provider";
import { TokenAccounts } from "./token-ui";

export default function TokenListFeature() {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return (
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    );
  } else {
    return <TokenAccounts address={publicKey} />;
  }
}
