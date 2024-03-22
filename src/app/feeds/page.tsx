"use client";
import { useState, useEffect } from "react";
import { OCR2Feed } from "@chainlink/solana-sdk";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider } from "@project-serum/anchor";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const feeds = [
  {
    iconURL: "/solana.svg",
    symbol: "SOL",
    name: "Solana",
    price: "",
    address: "99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR",
  },
  {
    iconURL: "/bark.svg",
    symbol: "BARK",
    name: "BARK",
    price: "",
    address: "BARKtwgaaR4tn1vaBpUGbmMNSq3Wt7qzfDsSPSBv4orS",
  },
  {
    iconURL: "/bitcoin.svg",
    symbol: "BTC",
    name: "Bitcoin",
    price: "",
    address: "6PxBx93S8x3tno1TsFZwT5VqP8drrRCbCXygEXYNkFJe",
  },
  {
    iconURL: "/ethereum.svg",
    symbol: "ETH",
    name: "Ethereum",
    price: "",
    address: "669U43LNHx7LsVj95uYksnhXUfWKDsdzVqev3V4Jpw3P",
  },
  {
    iconURL: "/chainlink.png",
    symbol: "LINK",
    name: "Chainlink",
    price: "",
    address: "HXoZZBWv25N4fm2vfSKnHXTeDJ31qaAcWZe3ZKeM6dQv",
  },
  {
    iconURL: "/usdc.png",
    symbol: "USDC",
    name: "USDC",
    price: "",
    address: "2EmfL3MqL3YHABudGNmajjCpR13NNEn9Y4LWxbDm6SwR",
  },
  {
    iconURL: "/tether.png",
    symbol: "USDT",
    name: "Tether",
    price: "",
    address: "8QQSUPtdRTboa4bKyMftVNRfGFsB4Vp9d7r39hGKi53e",
  },
];

interface FeedData {
  iconURL: string;
  symbol: string;
  name: string;
  price: string; // Price as string to include formatted value
  address: string;
}

// Note that the Wallet object provided by the useWallet hook from @solana/wallet-adapter-react
// is not compatible with the Wallet object that the Anchor Provider expects
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

function ChainlinkPriceFeed() {
  const [feedsData, setFeedsData] = useState<FeedData[]>(feeds);
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    if (!wallet) {
      console.log("Wallet not connected");
      return;
    }

    const CHAINLINK_PROGRAM_ID = new PublicKey("cjg3oHmg9uuPsP8D6g29NWvhySJkdYdAo9D25PRbKXJ");

    feeds.forEach((feed, index) => {
      const address = new PublicKey(feed.address);

      const subscribeToPriceFeed = async () => {
        try {
          const provider = new AnchorProvider(connection, wallet, {});
          const dataFeed = await OCR2Feed.load(CHAINLINK_PROGRAM_ID, provider);

          const listener = dataFeed.onRound(address, (event) => {
            const rawPrice = event.answer.toNumber();
            const decimals = 8;
            const priceInDollars = rawPrice / Math.pow(10, decimals);

            // format the price with commas
            const formattedPrice = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              // Specify the number of decimal digits
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(priceInDollars);

            setFeedsData((currentFeeds) => {
              const updatedFeeds = [...currentFeeds];
              updatedFeeds[index] = { ...updatedFeeds[index], price: formattedPrice };
              return updatedFeeds;
            });
          });

          return () => dataFeed.removeListener(listener);
        } catch (error) {
          console.error("Failed to subscribe to Chainlink Price Feed:", error);
        }
      };

      subscribeToPriceFeed();
    });
  }, [wallet, connection]);

  return (
    <Table className="mt-16">
      <TableCaption>A List of Chainlink Price Feeds</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Icon</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Name</TableHead>
          <TableHead className="text-right">Price</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedsData.map((feed) => (
          <TableRow key={feed.name}>
            <TableCell className="font-medium">
              <Image className="" alt={feed.symbol} src={feed.iconURL} width={28} height={28} priority />
            </TableCell>
            <TableCell>{feed.symbol}</TableCell>
            <TableCell>{feed.name}</TableCell>
            <TableCell className="text-right">{feed.price ? feed.price : <LoadingSpinner />}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ChainlinkPriceFeed;