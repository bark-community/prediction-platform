import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import { notify } from "../utils/notifications";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

interface TokenAccount {
    mintAddress: string;
    tokenBalance: number;
}

const WalletButton: React.FC = () => {
    const { publicKey } = useWallet();
    const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const getTokenAccounts = async (wallet: string) => {
        setIsLoading(true);
        try {
            const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!, 'confirmed');
            const filters = [
                {
                    memcmp: {
                        offset: 32,
                        bytes: wallet,
                    }
                }
            ];
            const accounts = await connection.getParsedProgramAccounts(
                TOKEN_PROGRAM_ID,
                { filters }
            );

            if (accounts.length === 0) {
                notify({ type: 'warning', message: 'No Token Accounts Found!' });
            } else {
                const tokenAccountsData: TokenAccount[] = accounts.map((account: any) => {
                    const parsedAccountInfo = account.account.data.parsed.info;
                    const mintAddress = parsedAccountInfo.mint;
                    const tokenBalance = parsedAccountInfo.tokenAmount.uiAmount;
                    return { mintAddress, tokenBalance };
                });
                setTokenAccounts(tokenAccountsData);
            }
        } catch (error) {
            setError('Error fetching token accounts');
            console.error('Error fetching token accounts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onClick = async () => {
        setError(null);
        if (!publicKey) {
            notify({ type: 'error', message: 'Wallet not connected!' });
            return;
        }
        await getTokenAccounts(publicKey.toBase58());
    };

    return (
        <div className="flex flex-col items-center">
            <button
                className={`px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ${isLoading && 'opacity-50 cursor-not-allowed'}`}
                onClick={onClick}
                disabled={isLoading}
            >
                <span>{isLoading ? 'Loading...' : 'Get Token Accounts'}</span>
            </button>
            {error && <div className="text-red-500">{error}</div>}
            {tokenAccounts.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold">Token Accounts:</h2>
                    <ul>
                        {tokenAccounts.map((account, index) => (
                            <li key={index}>
                                <span className="font-semibold">Mint Address:</span> {account.mintAddress}, 
                                <span className="font-semibold ml-2">Balance:</span> {account.tokenBalance}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default WalletButton;
