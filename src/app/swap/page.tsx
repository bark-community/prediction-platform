"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCluster } from "@/components/cluster/cluster-data-access";

export default function JupiterSwap() {
  const [isJupiterLoaded, setJupiterLoaded] = useState(false);
  const { cluster } = useCluster();
  console.log("cluster name", cluster.name);

  const passthroughWalletContextState = useWallet();

  // Define the initializeJupiter function here so it's accessible in both useEffect and onLoad
  const initializeJupiter = () => {
    if (window.Jupiter) {
      window.Jupiter.init({
        displayMode: "integrated",
        integratedTargetId: "integrated-terminal",
        endpoint: "https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed/",
        enableWalletPassthrough: true,
        formProps: {
          fixedOutputMint: false,
        },
      });
      setJupiterLoaded(true);
    }
  };

  useEffect(() => {
    if (cluster.name === "mainnet") {
      initializeJupiter();
    }

    if (window.Jupiter && window.Jupiter.syncProps) {
      window.Jupiter.syncProps({ passthroughWalletContextState });
    }
  }, [isJupiterLoaded, passthroughWalletContextState, cluster]);

  return (
    <div className="flex justify-center items-center sm:mt-24">
      {cluster.name === "mainnet" ? (
        <div key={cluster.name} className="">
          <Script
            src="https://terminal.jup.ag/main-v2.js"
            strategy="afterInteractive"
            onLoad={() => {
              // Call the initialize function once the script is loaded
              if (!isJupiterLoaded) {
                initializeJupiter();
              }
            }}
          />

          <div className="bg-black rounded-md" id="integrated-terminal">
            {/* Jupiter Terminal should be initialized here */}
          </div>
        </div>
      ) : (
        <div className="bg-background px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mt-5 text-lg leading-8 text-grey-500">
              Make sure your wallet is not in testnet mode and change cluster to mainnet
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
