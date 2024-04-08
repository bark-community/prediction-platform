"use client";
import { TokenAccounts } from "./token-ui";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { PublicKey } from "@solana/web3.js";

export default function TokenDetailFeature() {
  const params = useParams();

  const address = useMemo(() => {
    if (!params.address) {
      return;
    }
    try {
      return new PublicKey(params.address);
    } catch (e) {
      console.log(`Invalid public key`, e);
    }
  }, [params]);

  if (!address) {
    return <div>Error loading account</div>;
  }

  return <TokenAccounts address={address} />;
}