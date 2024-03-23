import { useEffect, useState } from 'react';
import Script from 'next/script';
import { WalletError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { ReactNode, useCallback, useMemo } from "react";
import { useCluster } from "../components/cluster/cluster-data-access";

interface JupiterProps {
    endpoint: string;
    onSwapError?: (error: WalletError) => void;
    onSuccess?: (txid: string, swapResult: SwapResult, quoteResponseMeta: QuoteResponseMeta | null) => void;
}

const useClient = () => {
    useEffect(() => {
        // Perform any client-side initialization here
        // This hook will be called only on the client side
    }, []);
};

const JupiterTerminal = ({ endpoint, onSwapError, onSuccess }: JupiterProps) => {
    useClient();

    const [isJupiterLoaded, setJupiterLoaded] = useState(false);
    const { cluster } = useCluster();
    const { wallet } = useWallet();

    const initializeJupiter = () => {
        if (window.Jupiter) {
            window.Jupiter.init({
                endpoint,
                enableWalletPassthrough: true
            });
            setJupiterLoaded(true);
        }
    };

    useEffect(() => {
        if (cluster.name === 'mainnet') {
            initializeJupiter();
        }

        if (window.Jupiter && window.Jupiter.syncProps) {
            window.Jupiter.syncProps({ passthroughWalletContextState: wallet });
        }
    }, [cluster.name, wallet]);

    useEffect(() => {
        if (!window.Jupiter) return;

        // Subscribe to errors
        if (onSwapError) {
            window.Jupiter.onSwapError = onSwapError;
        }

        // Subscribe to success
        if (onSuccess) {
            window.Jupiter.onSuccess = onSuccess;
        }

        return () => {
            // Clean up subscriptions
            window.Jupiter.onSwapError = undefined;
            window.Jupiter.onSuccess = undefined;
        };
    }, [onSwapError, onSuccess]);

    return (
        <div className="flex justify-center items-center sm:mt-24">
            {cluster.name === 'mainnet' ? (
                <div key={cluster.name} className="">
                    <Script
                        src="https://terminal.jup.ag/main-v2.js"
                        strategy="afterInteractive"
                        onLoad={() => {
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
};

export default JupiterTerminal;
