import axios from 'axios';

// Define the endpoint for fetching liquidity pool data
const LIQUIDITY_POOLS_API_URL = 'https://api.example.com/liquidity-pools';

// Define the cache for storing fetched liquidity pool data
let liquidityPoolCache: LiquidityPool[] | null = null;

// Define the types for liquidity pool data
interface LiquidityPool {
  tokenSymbol: string;
  tokenName: string;
  totalDeposits: number;
  totalBorrows: number;
  totalDepositsUsdValue: number;
  totalBorrowsUsdValue: number;
  riskTier: string;
}

// Fetch liquidity pool data from the API or cache
export const fetchLiquidityPools = async (): Promise<LiquidityPool[]> => {
  try {
    // Check if data is already cached
    if (liquidityPoolCache) {
      return liquidityPoolCache;
    }

    // Fetch data from the API
    const response = await axios.get(LIQUIDITY_POOLS_API_URL);
    if (response.status === 200) {
      // Cache the data
      liquidityPoolCache = response.data as LiquidityPool[];
      return liquidityPoolCache;
    } else {
      throw new Error('Failed to fetch liquidity pools');
    }
  } catch (error) {
    console.error('Error fetching liquidity pools:', error);
    throw error;
  }
};
