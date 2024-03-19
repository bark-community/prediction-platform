import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PublicKey, AccountInfo, ParsedAccountData, Connection } from "@solana/web3.js";
import { MintLayout } from "@solana/spl-token";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeSince(blockTime: number | null | undefined): string {
  if (blockTime === null || blockTime === undefined) {
    return "Unknown time";
  }

  const eventDate = new Date(blockTime * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - eventDate.getTime()) / 1000);
  const diffInHours = diffInSeconds / 3600;
  const diffInDays = diffInHours / 24;

  if (diffInHours < 24) {
    return `${diffInHours.toFixed()} hours ago`;
  } else {
    return `${diffInDays.toFixed()} days ago`;
  }
}

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return str.substring(0, len) + "..." + str.substring(str.length - len, str.length);
  }
  return str;
}

export type EnhancedAccount = {
  pubkey: PublicKey;
  account: AccountInfo<ParsedAccountData>;
  isMintAuthority: boolean;
};

type TokenAccount = {
  pubkey: PublicKey;
  account: AccountInfo<ParsedAccountData>;
};

export async function enhanceAccountsWithMintAuthority(
  accounts: TokenAccount[],
  connection: Connection,
  userAddress: PublicKey
): Promise<EnhancedAccount[]> {
  const enhancedAccounts = await Promise.all(
    accounts.map(async (account) => {
      const mintAddress = new PublicKey(account.account.data.parsed.info.mint);
      const mintAccountInfo = await connection.getAccountInfo(mintAddress);
      if (!mintAccountInfo) throw new Error("Failed to find mint account");

      const mintData = MintLayout.decode(mintAccountInfo.data);
      const isMintAuthority = mintData.mintAuthority && new PublicKey(mintData.mintAuthority).equals(userAddress);

      // Ensure the returned object matches the EnhancedAccount type
      return {
        pubkey: account.pubkey,
        account: account.account,
        isMintAuthority,
      };
    })
  );

  return enhancedAccounts;
}