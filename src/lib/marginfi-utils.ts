import {
  Balance,
  Bank,
  MarginRequirementType,
  MarginfiAccount,
  PriceBias,
  RiskTier,
} from "@mrgnlabs/marginfi-client-v2";
import { nativeToUi } from "@mrgnlabs/mrgn-common";
import { Infer, array, assert, object, string } from "superstruct";

// A bank is the entity representing a token supported by the protocol
// It gathers all the parameters and balances for that token
export interface BankSnapshot {
  bankAddress: string; // (base58)
  tokenSymbol: string; // short-form name / ticker
  tokenName: string; // long-form name
  lendingRate: number; // (%)
  borrowingRate: number; // (%)
  totalDeposits: number; // (ui token, accounting for decimals)
  totalBorrows: number; // (ui token, accounting for decimals)
  totalDepositsNative: string; // (native token)
  totalBorrowsNative: string; // (native token)
  totalBorrowsUsdValue: number; // ($)
  totalDepositsUsdValue: number; // ($)
  riskTier: RiskTier;
}

// A user account is the entity representing a user portfolio as a set of deposit and borrow positions
// There can be any number of separate accounts per wallet
export interface UserAccountSnapshot {
  authority: string; // (base58)
  accountAddress: string; // (base58)
  totalDepositsUsdValue: number; // ($)
  totalBorrowsUsdValue: number; // ($)
  initialHealthFactor: number; // (%) metric representing the health of the account wrt to the initial margin requirements (<0% == unable to withdraw collateral or take on additional liabilities)
  maintenanceHealthFactor: number; // (%) metric representing the health of the account wrt to the maintenance margin requirements (<0% == open to partial liquidation)
  liquidationMargin: number; // ($) value remaining before the account is liquidated i.e. value the collat can go down, or the liabilities can go up, before liquidation starts
  positions: UserPositions;
}

export interface UserPositions {
  deposits: UserPosition[];
  borrows: UserPosition[];
}

export interface UserPosition {
  tokenSymbol: string;
  tokenMint: string;
  amount: number;
  usdValue: number;
}

export function shapeBank(bank: Bank, bankMetadata: BankMetadata): BankSnapshot {
  return {
    tokenSymbol: bankMetadata.tokenSymbol,
    tokenName: bankMetadata.tokenName,
    bankAddress: bank.publicKey.toBase58(),
    lendingRate: bank.getInterestRates().lendingRate.times(100).toNumber(),
    borrowingRate: bank.getInterestRates().borrowingRate.times(100).toNumber(),
    totalDepositsNative: bank.totalAssets.toString(),
    totalBorrowsNative: bank.totalLiabilities.toString(),
    totalDeposits: nativeToUi(bank.totalAssets, bank.mintDecimals),
    totalBorrows: nativeToUi(bank.totalLiabilities, bank.mintDecimals),
    totalDepositsUsdValue: bank
      .getAssetUsdValue(bank.totalAssetShares, MarginRequirementType.Equity, PriceBias.None)
      .toNumber(),
    totalBorrowsUsdValue: bank
      .getLiabilityUsdValue(bank.totalLiabilities, MarginRequirementType.Equity, PriceBias.None)
      .toNumber(),
    riskTier: bank.config.riskTier,
  };
}

export function shapeUserAccount(
  marginfiAccount: MarginfiAccount,
  banks: Bank[],
  bankMetadataMap: BankMetadataMap
): UserAccountSnapshot {
  const { assets: assetsEquity, liabilities: liabilitiesEquity } = marginfiAccount.getHealthComponents(
    MarginRequirementType.Equity
  );
  const { assets: assetsMaintenance, liabilities: liabilitiesMaintenance } = marginfiAccount.getHealthComponents(
    MarginRequirementType.Maint
  );
  const { assets: assetsInitial, liabilities: liabilitiesInitial } = marginfiAccount.getHealthComponents(
    MarginRequirementType.Init
  );

  const liquidationMargin = assetsMaintenance.minus(liabilitiesMaintenance).toNumber();

  const positions = marginfiAccount.activeBalances.reduce<UserPositions>(
    (acc, balance) => {
      const { isDeposit, position } = shapePosition(balance, banks, bankMetadataMap);
      if (isDeposit) {
        acc.deposits.push(position);
      } else {
        acc.borrows.push(position);
      }

      return acc;
    },
    { deposits: [], borrows: [] }
  );

  return {
    authority: marginfiAccount.authority.toBase58(),
    accountAddress: marginfiAccount.publicKey.toBase58(),
    totalDepositsUsdValue: assetsEquity.toNumber(),
    totalBorrowsUsdValue: liabilitiesEquity.toNumber(),
    initialHealthFactor: assetsInitial.isZero()
      ? 100
      : assetsInitial.minus(liabilitiesInitial).div(assetsInitial).times(100).toNumber(),
    maintenanceHealthFactor: assetsMaintenance.isZero()
      ? 100
      : assetsMaintenance.minus(liabilitiesMaintenance).div(assetsMaintenance).times(100).toNumber(),
    liquidationMargin,
    positions,
  };
}

export function shapePosition(
  balance: Balance,
  banks: Bank[],
  bankMetadataMap: BankMetadataMap
): { isDeposit: boolean; position: UserPosition } {
  const bank = banks.find((bank) => bank.publicKey.equals(balance.bankPk));
  if (!bank) throw new Error(`Missing bank for ${balance.bankPk.toBase58()}`);

  const bankMetadata = bankMetadataMap[balance.bankPk.toBase58()];
  if (!bankMetadata) {
    throw new Error(`Missing metadata for bank ${balance.bankPk.toBase58()}`);
  }

  const amounts = balance.getQuantity(bank);
  const usdValues = balance.getUsdValue(bank, MarginRequirementType.Equity);
  const isDeposit = usdValues.liabilities.isZero();

  return {
    position: {
      tokenSymbol: bankMetadata.tokenSymbol,
      tokenMint: bank.mint.toBase58(),
      amount: isDeposit
        ? nativeToUi(amounts.assets.toNumber(), bank.mintDecimals)
        : nativeToUi(amounts.liabilities.toNumber(), bank.mintDecimals),
      usdValue: isDeposit ? usdValues.assets.toNumber() : usdValues.liabilities.toNumber(),
    },
    isDeposit,
  };
}

// -------- Helpers

export interface BankMetadata {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
}
type BankMetadataMap = { [address: string]: BankMetadata };

export const BankMetadataRaw = object({
  bankAddress: string(),
  tokenAddress: string(),
  tokenName: string(),
  tokenSymbol: string(),
});

export const BankMetadataList = array(BankMetadataRaw);

export type BankMetadataRaw = Infer<typeof BankMetadataRaw>;
type BankMetadataListRaw = Infer<typeof BankMetadataList>;

export async function loadBankMetadatas(): Promise<{
  [address: string]: BankMetadata;
}> {
  const response = await fetch(`https://storage.googleapis.com/mrgn-public/mrgn-bank-metadata-cache.json`, {
    headers: {
      Accept: "application/json",
    },
    method: "GET",
  });

  if (response.status === 200) {
    const responseData = await response.json();
    assert(responseData, BankMetadataList);
    return parseBankMetadatas(responseData);
  } else {
    throw new Error("Failed to fetch bank metadata");
  }
}

export function parseBankMetadata(bankMetadataRaw: BankMetadataRaw): BankMetadata {
  return {
    tokenAddress: bankMetadataRaw.tokenAddress,
    tokenName: bankMetadataRaw.tokenName,
    tokenSymbol: bankMetadataRaw.tokenSymbol,
  };
}

export function parseBankMetadatas(bankMetadataListRaw: BankMetadataListRaw): {
  [symbol: string]: BankMetadata;
} {
  return bankMetadataListRaw.reduce(
    (config, current, _) => ({
      [current.bankAddress]: parseBankMetadata(current),
      ...config,
    }),
    {} as {
      [address: string]: BankMetadata;
    }
  );
}