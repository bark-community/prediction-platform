"use client";

import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ExplorerLink } from "../cluster/cluster-ui";
import { ellipsify } from "@/lib/utils";
import { AccountBalance, AccountTransactions, AirdropModal, ReceiveModal, SendModal } from "./account-ui";
import { ArrowUpRightFromSquare } from "lucide-react";

export default function AccountDetailFeature() {
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

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-2xl py-5 sm:py-8 lg:py-9">
        <div className="text-center">
          <AccountBalance address={address} />
          <div className="mt-2 leading-8 text-gray-500">
            <div className="inline-flex items-center">
              <ExplorerLink path={`account/${address}`} label={ellipsify(address.toString())} />
              <ArrowUpRightFromSquare className="ml-1 h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-x-6">
            <AirdropModal address={address} />

            <SendModal address={address} />

            <ReceiveModal address={address} />
          </div>
        </div>
      </div>
      <AccountTransactions address={address} />
    </div>
  );
}
