import React from 'react';

interface MarginFiPool {
  tokenSymbol: string;
  tokenName: string;
  bankAddress: string;
  lendingRate: number;
  borrowingRate: number;
  totalDepositsNative: string;
  totalBorrowsNative: string;
  totalDeposits: number;
  totalBorrows: number;
  totalDepositsUsdValue: number;
  totalBorrowsUsdValue: number;
  riskTier: string;
}

interface MarginFiPoolsProps {
  pools: MarginFiPool[];
}

const MarginFiPools: React.FC<MarginFiPoolsProps> = ({ pools }) => {
  return (
    <div>
      <h2>MarginFi Pools</h2>
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 text-left">Token Symbol</th>
              <th className="px-4 py-2 text-left">Token Name</th>
              <th className="px-4 py-2 text-left">Bank Address</th>
              <th className="px-4 py-2 text-left">Lending Rate</th>
              <th className="px-4 py-2 text-left">Borrowing Rate</th>
              <th className="px-4 py-2 text-left">Total Deposits (Native)</th>
              <th className="px-4 py-2 text-left">Total Borrows (Native)</th>
              <th className="px-4 py-2 text-left">Total Deposits (USD Value)</th>
              <th className="px-4 py-2 text-left">Total Borrows (USD Value)</th>
              <th className="px-4 py-2 text-left">Risk Tier</th>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool, index) => (
              <tr key={index} className={(index + 1) % 2 === 0 ? 'bg-gray-100' : ''}>
                <td className="border px-4 py-2">{pool.tokenSymbol}</td>
                <td className="border px-4 py-2">{pool.tokenName}</td>
                <td className="border px-4 py-2">{pool.bankAddress}</td>
                <td className="border px-4 py-2">{pool.lendingRate}</td>
                <td className="border px-4 py-2">{pool.borrowingRate}</td>
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
    </div>
  );
};

export default MarginFiPools;
