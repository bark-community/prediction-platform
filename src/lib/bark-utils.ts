import {
    Balance,
    Bark,
    BarkRequirementType,
    BarkAccount,
    PriceBias,
    RiskTier,
  } from "@barkprotocol/bark-client-v1";
  import { nativeToUi } from "@barkprotocol/bark-common";
  import { Infer, array, assert, object, string } from "superstruct";
  
  // A Bark is the entity representing a token supported by the protocol
  // It gathers all the parameters and balances for that token
  export interface BarkSnapshot {
    barkAddress: string; // (base58)
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
  
  export function shapeBark(bark: Bark, barkMetadata: BarkMetadata): BarkSnapshot {
    return {
      tokenSymbol: barkMetadata.tokenSymbol,
      tokenName: barkMetadata.tokenName,
      barkAddress: bark.publicKey.toBase58(),
      lendingRate: bark.getInterestRates().lendingRate.times(100).toNumber(),
      borrowingRate: bark.getInterestRates().borrowingRate.times(100).toNumber(),
      totalDepositsNative: bark.totalAssets.toString(),
      totalBorrowsNative: bark.totalLiabilities.toString(),
      totalDeposits: nativeToUi(bark.totalAssets, bark.mintDecimals),
      totalBorrows: nativeToUi(bark.totalLiabilities, bark.mintDecimals),
      totalDepositsUsdValue: bark
        .getAssetUsdValue(bark.totalAssetShares, BarkRequirementType.Equity, PriceBias.None)
        .toNumber(),
      totalBorrowsUsdValue: bark
        .getLiabilityUsdValue(bark.totalLiabilities, BarkRequirementType.Equity, PriceBias.None)
        .toNumber(),
      riskTier: bark.config.riskTier,
    };
  }
  
  export function shapeUserAccount(
    barkAccount: BarkAccount,
    barks: Bark[],
    barkMetadataMap: BarkMetadataMap
  ): UserAccountSnapshot {
    const { assets: assetsEquity, liabilities: liabilitiesEquity } = barkAccount.getHealthComponents(
      BarkRequirementType.Equity
    );
    const { assets: assetsMaintenance, liabilities: liabilitiesMaintenance } = barkAccount.getHealthComponents(
      BarkRequirementType.Maint
    );
    const { assets: assetsInitial, liabilities: liabilitiesInitial } = barkAccount.getHealthComponents(
      BarkRequirementType.Init
    );
  
    const liquidationMargin = assetsMaintenance.minus(liabilitiesMaintenance).toNumber();
  
    const positions = barkAccount.activeBalances.reduce<UserPositions>(
      (acc, balance) => {
        const { isDeposit, position } = shapePosition(balance, barks, barkMetadataMap);
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
      authority: barkAccount.authority.toBase58(),
      accountAddress: barkAccount.publicKey.toBase58(),
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
    barks: Bark[],
    barkMetadataMap: BarkMetadataMap
  ): { isDeposit: boolean; position: UserPosition } {
    const bark = barks.find((bark) => bark.publicKey.equals(balance.barkPk));
    if (!bark) throw new Error(`Missing bark for ${balance.barkPk.toBase58()}`);
  
    const barkMetadata = barkMetadataMap[balance.barkPk.toBase58()];
    if (!barkMetadata) {
      throw new Error(`Missing metadata for bark ${balance.barkPk.toBase58()}`);
    }
  
    const amounts = balance.getQuantity(bark);
    const usdValues = balance.getUsdValue(bark, MarginRequirementType.Equity);
    const isDeposit = usdValues.liabilities.isZero();
  
    return {
      position: {
        tokenSymbol: barkMetadata.tokenSymbol,
        tokenMint: bark.mint.toBase58(),
        amount: isDeposit
          ? nativeToUi(amounts.assets.toNumber(), bark.mintDecimals)
          : nativeToUi(amounts.liabilities.toNumber(), bark.mintDecimals),
        usdValue: isDeposit ? usdValues.assets.toNumber() : usdValues.liabilities.toNumber(),
      },
      isDeposit,
    };
  }
  
  // -------- Helpers
  
  export interface BarkMetadata {
    tokenAddress: string;
    tokenName: string;
    tokenSymbol: string;
  }
  type BarkMetadataMap = { [address: string]: BarkMetadata };
  
  export const BarkMetadataRaw = object({
    barkAddress: string(),
    tokenAddress: string(),
    tokenName: string(),
    tokenSymbol: string(),
  });
  
  export const BarkMetadataList = array(BarkMetadataRaw);
  
  export type BarkMetadataRaw = Infer<typeof BarkMetadataRaw>;
  type BarkMetadataListRaw = Infer<typeof BarkMetadataList>;
  
  export async function loadBarkMetadatas
  