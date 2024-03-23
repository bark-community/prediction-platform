import React, { useState, useEffect } from 'react';
import { fetchLiquidityPools } from '@/api/pools/liquidity-pools';

const LiquidityPools = () => {
  const [pools, setPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('MarginFi');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLiquidityPools(selectedProvider);
        setPools(data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedProvider]);

  const handleProviderChange = (event) => {
    setSelectedProvider(event.target.value);
  };

  if (isLoading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">Error: {error.message}</div>;
  }

  if (!pools || pools.length === 0) {
    return <div className="text-center text-gray-600">No liquidity pools available</div>;
  }

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Explore Liquidity Pools</h2>
        <p className="text-gray-600 mb-2">
          Discover the available liquidity pools provided by MarginFi and MarinadeFinance. Select a provider to view the pools.
        </p>
      </div>
      <div className="mb-4">
        <label htmlFor="provider" className="mr-2 font-semibold">Select Provider:</label>
        <select
          id="provider"
          value={selectedProvider}
          onChange={handleProviderChange}
          className="rounded-md bg-gray-100 px-3 py-2"
        >
          <option value="MarginFi">MarginFi</option>
          <option value="MarinadeFinance">MarinadeFinance</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Token Symbol</th>
              <th className="px-4 py-2 text-left">Token Name</th>
              <th className="px-4 py-2 text-left">Total Deposits (Native)</th>
              <th className="px-4 py-2 text-left">Total Borrows (Native)</th>
              <th className="px-4 py-2 text-left">Total Deposits (USD Value)</th>
              <th className="px-4 py-2 text-left">Total Borrows (USD Value)</th>
              <th className="px-4 py-2 text-left">Risk Tier</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border px-4 py-2">{pool.tokenSymbol}</td>
                <td className="border px-4 py-2">{pool.tokenName}</td>
                <td className="border px-4 py-2">{pool.totalDepositsNative}</td>
                <td className="border px-4 py-2">{pool.totalBorrowsNative}</td>
                <td className="border px-4 py-2">{pool.totalDepositsUsdValue}</td>
                <td className="border px-4 py-2">{pool.totalBorrowsUsdValue}</td>
                <td className="border px-4 py-2">{pool.riskTier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 text-center text-gray-600">
        Using BARK´s Solana validator set, you pay no fees, earn more yield, and get more utility out of your staked BARK or SOL. Maximum liquidity with Sanctum, maximum MEV rewards with Jito, maximum utility with MarginFi, maximum flexibility with Solana DeFi.
      </div>
    </div>
  );
};

export default LiquidityPools;
