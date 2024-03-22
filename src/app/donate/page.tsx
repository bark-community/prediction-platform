"use client";
import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCluster } from "@/components/cluster/cluster-data-access";
import { FaDollarSign, FaEuroSign, FaBitcoin, FaEthereum, FaLink, FaMoneyBillAlt } from 'react-icons/fa';

const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/USD";

const currencies = [
  { symbol: "USD", icon: <FaDollarSign />, name: "US Dollar" },
  { symbol: "EUR", icon: <FaEuroSign />, name: "Euro" },
  { symbol: "BTC", icon: <FaBitcoin />, name: "Bitcoin" },
  { symbol: "ETH", icon: <FaEthereum />, name: "Ethereum" },
  { symbol: "SOL", icon: <FaEthereum />, name: "Solana" },
  { symbol: "LINK", icon: <FaLink />, name: "Chainlink" },
  { symbol: "BARK", icon: <FaMoneyBillAlt />, name: "BARK" },
  { symbol: "USDC", icon: <FaDollarSign />, name: "USD Coin" },
  { symbol: "EURC", icon: <FaEuroSign />, name: "EUR Coin" },
];

const charities = [
  { name: "Ukrain Charity AID", address: "charity-a-address" },
  { name: "Charity B", address: "charity-b-address" },
  { name: "Charity C", address: "charity-c-address" },
  // Add more charities as needed
];

export default function DonatePage() {
  const wallet = useWallet();
  const { cluster } = useCluster();
  const [donationAmount, setDonationAmount] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedCharity, setSelectedCharity] = useState("");
  const [usdEquivalent, setUsdEquivalent] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExchangeRates();
  }, [selectedCurrency]);

  const fetchExchangeRates = () => {
    setLoading(true);
    fetch(EXCHANGE_RATE_API)
      .then((response) => response.json())
      .then((data) => {
        const exchangeRates = data.rates;
        const usdRate = exchangeRates[selectedCurrency];
        setUsdEquivalent(donationAmount / usdRate);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching exchange rates:", error);
        setError("Error fetching exchange rates");
        setLoading(false);
      });
  };

  const handleDonation = () => {
    if (!selectedCharity) {
      setError("Please select a charity");
      return;
    }
    if (donationAmount <= 0) {
      setError("Donation amount must be greater than zero");
      return;
    }
    setError("");
    console.log(`Donating ${donationAmount} ${selectedCurrency} to ${selectedCharity}`);
    // Add donation logic here

    // Clear input fields and reset state
    setDonationAmount(0);
    setSelectedCharity("");
    setError("");
  };

  const handleCancel = () => {
    // Clear input fields and reset state
    setDonationAmount(0);
    setSelectedCurrency("USD");
    setSelectedCharity("");
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-4">Donate</h1>
      <p className="text-lg mb-4">Your donation will help support various charitable organizations and causes around the world.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Donation Details</h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Amount ({currencies.find(cur => cur.symbol === selectedCurrency).name})</label>
            <input
              type="number"
              className="border border-gray-300 rounded-md w-full py-2 px-3"
              value={donationAmount}
              onChange={(e) => setDonationAmount(parseFloat(e.target.value))}
              placeholder="Enter donation amount"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Currency</label>
            <select
              className="border border-gray-300 rounded-md w-full py-2 px-3"
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
            >
              {currencies.map(({ symbol, icon, name }) => (
                <option key={symbol} value={symbol}>
                  {icon} {name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Charity</label>
            <select
              className="border border-gray-300 rounded-md w-full py-2 px-3"
              value={selectedCharity}
              onChange={(e) => setSelectedCharity(e.target.value)}
            >
              <option value="">Select Charity</option>
              {charities.map((charity) => (
                <option key={charity.address} value={charity.address}>
                  {charity.name}
                </option>
              ))}
            </select>
          </div>
          <button
            className={`bg-primary text-white py-2 px-4 rounded-md mr-2 ${loading || !selectedCharity || donationAmount <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'}`}
            onClick={handleDonation}
            disabled={loading || !selectedCharity || donationAmount <= 0}
          >
            {loading ? "Donating..." : "Donate"}
          </button>
          <button
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-700 dark:bg-gray-800"
            onClick={handleCancel}
          >
            Cancel
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">USDC Equivalent</h2>
          <p className="text-lg font-semibold">{usdEquivalent.toFixed(2)} USDC</p>
        </div>
      </div>
    </div>
  );
}