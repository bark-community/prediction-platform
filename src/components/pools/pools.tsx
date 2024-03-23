"use client"

import { useState, useEffect } from "react";
import { fetchLiquidityPools } from "@/api/pools/liquidity-pools";

const LiquidityPools = () => {
  const [liquidityPools, setLiquidityPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLiquidityPools();
        setLiquidityPools(data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h2>Liquidity Pools</h2>
      <table>
        <thead>
          <tr>
            <th>Token Symbol</th>
            <th>Token Name</th>
            <th>Total Deposits (Native)</th>
            <th>Total Borrows (Native)</th>
            <th>Total Deposits (USD Value)</th>
            <th>Total Borrows (USD Value)</th>
            <th>Risk Tier</th>
          </tr>
        </thead>
        <tbody>
          {liquidityPools.map((pool, index) => (
            <tr key={index}>
              <td>{pool.tokenSymbol}</td>
              <td>{pool.tokenName}</td>
              <td>{pool.totalDepositsNative}</td>
              <td>{pool.totalBorrowsNative}</td>
              <td>{pool.totalDepositsUsdValue}</td>
              <td>{pool.totalBorrowsUsdValue}</td>
              <td>{pool.riskTier}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LiquidityPools;
