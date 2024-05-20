"use client";
"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useCluster } from "@/components/cluster/cluster-data-access";

export default function JupiterSwap() {
  const { cluster } = useCluster();
  const passthroughWalletContextState = useWallet();
  const [isJupiterLoaded, setJupiterLoaded] = useState(false);

  useEffect(() => {
    if (cluster.name === "mainnet" && !isJupiterLoaded) {
      const initializeJupiter = () => {
        if (window.Jupiter) {
          window.Jupiter.init({
            displayMode: "integrated",
            integratedTargetId: "integrated-terminal",
            endpoint: "",
            enableWalletPassthrough: true,
            formProps: {
              fixedOutputMint: false,
            },
          });
          setJupiterLoaded(true);
        }
      };

      if (window.Jupiter && window.Jupiter.syncProps) {
        window.Jupiter.syncProps({ passthroughWalletContextState });
      }

      initializeJupiter();
    }
  }, [cluster.name, isJupiterLoaded, passthroughWalletContextState]);

  return (
    <div className="flex justify-center items-center sm:mt-24">
      {cluster.name === "mainnet" ? (
        <div key={cluster.name}>
          <Script
            src="https://terminal.jup.ag/main-v2.js"
            strategy="afterInteractive"
            onError={(error) => console.error("Error loading Jupiter Terminal:", error)}
            onLoad={() => {
              if (!isJupiterLoaded) {
                setJupiterLoaded(true);
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
            <p className="mt-6 text-lg leading-8 text-grey-500">
              Make sure your wallet is not in testnet mode and change cluster to mainnet
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
