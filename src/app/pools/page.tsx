"use client";
import { useState, useEffect } from "react";
import { BankSnapshot, UserAccountSnapshot } from "@/lib/marginfi-utils";

const dummyData = [
  {
    tokenSymbol: "BLZE",
    tokenName: "Blaze",
    bankAddress: "6Fk3bzhqmUqupk6sN5CbfYMdafvyzDdqDNHW5CsJzq8K",
    lendingRate: 0.08327364146415393,
    borrowingRate: 6.030457675365639,
    totalDepositsNative: "750883416689270166.023857919346652885004",
    totalBorrowsNative: "61287412279775759.415009829494114065708",
    totalDeposits: 750883416.6892701,
    totalBorrows: 61287412.27977576,
    totalDepositsUsdValue: 1053459.3982783784,
    totalBorrowsUsdValue: 86217.51345745844,
    riskTier: "Isolated",
  },
  {
    tokenSymbol: "RENDER",
    tokenName: "Render Token",
    bankAddress: "EbuSnXdFz1R4VPdaJ96KQQQmeYgZTHSzpNW94Tw1PE3H",
    lendingRate: 0.000937377902475624,
    borrowingRate: 5.109328587199132,
    totalDepositsNative: "48192699983673.9942611258980575466140103",
    totalBorrowsNative: "417333845744.40937463091464099266953396",
    totalDeposits: 481926.99983673997,
    totalBorrows: 4173.338457444093,
    totalDepositsUsdValue: 6396568.0086644655,
    totalBorrowsUsdValue: 55434.64764398824,
    riskTier: "Isolated",
  },
  {
    tokenSymbol: "BARK",
    tokenName: "BARK",
    bankAddress: "BARKhLzdWbyZiP3LNoD9boy7MrAy4CVXEToDyYGeEBKF",
    lendingRate: 0.000807377902475624,
    borrowingRate: 5.809328587199132,
    totalDepositsNative: "98192699983679.9042611258980575466140103",
    totalBorrowsNative: "517333845744.40937463091464099266953396",
    totalDeposits: 581926.99983673997,
    totalBorrows: 5173.338457444093,
    totalDepositsUsdValue: 7396568.0086644655,
    totalBorrowsUsdValue: 65434.64764398824,
    riskTier: "Isolated",
  },
  {
    tokenSymbol: "bSOL",
    tokenName: "BlazeStake Staked SOL (bSOL)",
    bankAddress: "6hS9i46WyTq1KXcoa2Chas2Txh9TJAVr6n1t3tnrE23K",
    lendingRate: 0.1198062286516877,
    borrowingRate: 6.235993192980865,
    totalDepositsNative: "399852357470989.592665824171088383042756",
    totalBorrowsNative: "39145726101501.692711625808038021932922",
    totalDeposits: 399852.3574709896,
    totalBorrows: 39145.72610150169,
    totalDepositsUsdValue: 85708961.3991947,
    totalBorrowsUsdValue: 8444764.248287894,
    riskTier: "Collateral",
  },
  {
    tokenSymbol: "wstETH",
    tokenName: "Lido Wrapped Staked ETH",
    bankAddress: "9g3Tug2WbDwekghbPn2u3V84tvikAMBZiFbPUfkjwKNH",
    lendingRate: 0.00019778373537858242,
    borrowingRate: 5.0502194171188135,
    totalDepositsNative: "14687404821.249592800688361259411122277",
    totalBorrowsNative: "58423200.7215955360561915367680491265136",
    totalDeposits: 146.87404821249592,
    totalBorrows: 0.5842320072159554,
    totalDepositsUsdValue: 612254.3839720436,
    totalBorrowsUsdValue: 2439.794028119078,
    riskTier: "Isolated",
  },
  {
    tokenSymbol: "WBTC",
    tokenName: "Wrapped BTC (Portal)",
    bankAddress: "BKsfDJCMbYep6gr9pq8PsmJbb5XGLHbAJzUV8vmorz7a",
    lendingRate: 0.022364559305303146,
    borrowingRate: 5.53401880757313,
    totalDepositsNative: "22338784818.2947575659511895820283258828",
    totalBorrowsNative: "944897523.271028461197760548892801446854",
    totalDeposits: 223.38784818294758,
    totalBorrows: 9.448975232710284,
    totalDepositsUsdValue: 15142321.609969193,
    totalBorrowsUsdValue: 651047.8057256909,
    riskTier: "Collateral",
  },
];

// interface Data {
//   banksShaped: BankSnapshot[];
//   userAccountsShaped: UserAccountSnapshot[];
// }

const ClientComponent = () => {
  // const [data, setData] = useState<Data | null>(dummyData);
  const [data, setData] = useState(dummyData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await fetch("/api/pools");
  //       const data = await response.json();
  //       if (response.ok) {
  //         setData(data);
  //       } else {
  //         setError(new Error(data.error));
  //       }
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         setError(error);
  //       } else {
  //         setError(new Error("An unknown error occurred"));
  //       }
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  // const { banksShaped, userAccountsShaped } = data;

  return (
    <div>
      <h2>Banks</h2>
      {data.map((bank, index) => (
        <div key={index}>
          <pre>{JSON.stringify(bank, null, 2)}</pre>
        </div>
      ))}

      {/* <h2>User Accounts</h2>
      {userAccountsShaped.map((account, index) => (
        <div key={index}>
          <pre>{JSON.stringify(account, null, 2)}</pre>
        </div>
      ))} */}
    </div>
  );
};

export default ClientComponent;