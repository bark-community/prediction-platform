import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCluster } from '@/components/cluster/cluster-data-access';

interface JupiterProps {
  endpoint: string;
  displayMode?: "modal" | "integrated" | "widget";
  integratedTargetId?: string;
  containerStyles?: React.CSSProperties;
  containerClassName?: string;
}

const useClient = () => {
  useEffect(() => {
    // Perform any client-side initialization here
    // This hook will be called only on the client side
  }, []);
};

const Jupiter = ({ endpoint, displayMode = "integrated", integratedTargetId, containerStyles, containerClassName }: JupiterProps) => {
  useClient();

  const [isJupiterLoaded, setJupiterLoaded] = useState(false);
  const { cluster } = useCluster();
  const { wallet } = useWallet();

  const initializeJupiter = () => {
    if (window.Jupiter) {
      window.Jupiter.init({
        endpoint,
        displayMode,
        integratedTargetId,
        enableWalletPassthrough: true,
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

  return (
    <div className={`flex justify-center items-center sm:mt-24 ${containerClassName}`} style={containerStyles}>
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

export default Jupiter;
