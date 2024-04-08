import { Connection, PublicKey } from "@solana/web3.js";
import { MarginfiClient, getConfig } from "@mrgnlabs/marginfi-client-v2";
import { NextResponse } from "next/server";
import { loadBankMetadatas, shapeBank, shapeUserAccount } from "@/lib/marginfi-utils";

export async function GET(request: Request) {
  try {
    // const rpcEndpoint = "https://rpc-public.hellomoon.io";
    //   const rpcEndpoint = "https://api.mainnet-beta.solana.com";
    const rpcEndpoint = process.env.RPC_ENDPOINT || "";
    const connection = new Connection(rpcEndpoint, "confirmed");
    const clientConfig = await getConfig("production");
    const client = await MarginfiClient.fetch(clientConfig, {} as any, connection);
    const bankMetadataMap = await loadBankMetadatas();

    const banksRaw = [...client.group.banks.values()];
    const banksShaped = banksRaw.map((bank) => {
      const bankAddress = bank.publicKey.toBase58();
      const bankMetadata = bankMetadataMap[bankAddress];
      if (!bankMetadata) {
        throw new Error(`Missing metadata for bank ${bankAddress}`);
      }
      return shapeBank(bank, bankMetadata);
    });

    // const SAMPLE_WALLET = new PublicKey("FHsALmky5sQLUx6CrjWRLRfc4WQYjv4ecmWML3eLLAB1");
    // const marginfiAccounts = await client.getMarginfiAccountsForAuthority(SAMPLE_WALLET);
    // const userAccountsShaped = marginfiAccounts.map((account) => shapeUserAccount(account, banksRaw, bankMetadataMap));

    // Return the data as a JSON response
    // return NextResponse.json({ banksShaped, userAccountsShaped });
    return NextResponse.json(banksShaped);
  } catch (error) {
    console.error("Error fetching data:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      // Handle the case where error is not an Error object
      return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
    }
  }
}