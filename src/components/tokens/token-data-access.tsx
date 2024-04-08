import { PublicKey, Keypair, SystemProgram, TransactionSignature, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ellipsify } from "@/lib/utils";
import { useCluster } from "@/components/cluster/cluster-data-access";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMintToCheckedInstruction,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  MintLayout,
} from "@solana/spl-token";

export function useGetTokenAccounts({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-token-accounts", { endpoint: connection.rpcEndpoint, address }],
    queryFn: async () => {
      const [tokenAccounts, token2022Accounts] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_PROGRAM_ID,
        }),
        connection.getParsedTokenAccountsByOwner(address, {
          programId: TOKEN_2022_PROGRAM_ID,
        }),
      ]);
      return [...tokenAccounts.value, ...token2022Accounts.value];
    },
  });
}

export function useGetAccountInfo({ mintAddress }: { mintAddress: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-mint-authority", { endpoint: connection.rpcEndpoint, mintAddress }],
    queryFn: async () => {
      // Fetch the account info for the mint address
      const accountInfo = await connection.getAccountInfo(mintAddress);
      if (!accountInfo) throw new Error("Failed to find mint account");

      // Parse the account info to get the mint data
      const mintData = MintLayout.decode(accountInfo.data);

      return mintData;
    },
  });
}

export function useGetMintAuthority({ mintAddress }: { mintAddress: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-mint-authority", { endpoint: connection.rpcEndpoint, mintAddress }],
    queryFn: async () => {
      // Fetch the account info for the mint address
      const accountInfo = await connection.getAccountInfo(mintAddress);
      if (!accountInfo) throw new Error("Failed to find mint account");

      // Parse the account info to get the mint data
      const mintData = MintLayout.decode(accountInfo.data);

      // The mint authority is an optional field, so it could be null
      const mintAuthority = mintData.mintAuthority ? new PublicKey(mintData.mintAuthority) : null;

      return mintAuthority;
    },
  });
}

export function useCreateMint({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const { sendTransaction } = useWallet();
  const client = useQueryClient();
  const { getExplorerUrl } = useCluster();

  return useMutation({
    mutationKey: ["create-token-mint", { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async () => {
      let signature: TransactionSignature = "";
      try {
        // Token Mints are accounts which hold data ABOUT a specific token.
        // Token Mints DO NOT hold tokens themselves.
        const tokenMint = Keypair.generate();
        // amount of SOL required for the account to not be deallocated
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        // `token.createMint` function creates a transaction with the following two instruction: `createAccount` and `createInitializeMintInstruction`.
        const transaction = new Transaction().add(
          // creates a new account
          SystemProgram.createAccount({
            fromPubkey: address,
            newAccountPubkey: tokenMint.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
          }),
          // initializes the new account as a Token Mint account
          createInitializeMintInstruction(tokenMint.publicKey, 0, address, TOKEN_PROGRAM_ID)
        );

        const associatedToken = await getAssociatedTokenAddress(
          tokenMint.publicKey,
          address,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        transaction.add(
          createAssociatedTokenAccountInstruction(
            address,
            associatedToken,
            address,
            tokenMint.publicKey,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );

        // prompts the user to sign the transaction and submit it to the network
        signature = await sendTransaction(transaction, connection, {
          signers: [tokenMint],
        });
        console.log("Token Mint Tx Sig ", signature);

        return signature;
      } catch (err) {
        toast.error("Error creating Token Mint");
        console.log("error", err);
      }
    },
    onSuccess: (signature) => {
      if (signature) {
        toast.success("Transaction Successfull", {
          description: ellipsify(signature),
          action: {
            label: "Explorer Link",
            onClick: () => window.open(getExplorerUrl(`tx/${signature}`), "_blank"),
          },
          duration: 10000,
        });
      }
      return client.invalidateQueries({
        queryKey: ["get-token-accounts", { endpoint: connection.rpcEndpoint, address }],
      });
    },
    onError: (error) => {
      toast.error("Transaction Failed", {
        description: `${error}`,
        duration: 10000,
      });
      console.log("error", `Transaction failed! ${error}`);
    },
  });
}

export function useMintToken({
  address,
  mintPublicKey,
  tokenAccountPublicKey,
}: {
  address: PublicKey;
  mintPublicKey: PublicKey;
  tokenAccountPublicKey: PublicKey;
}) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const client = useQueryClient();
  const { getExplorerUrl } = useCluster();

  return useMutation({
    mutationKey: ["mint-token", { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (input: { amount: number }) => {
      let signature: TransactionSignature = "";
      try {
        const transaction = new Transaction().add(
          createMintToCheckedInstruction(
            mintPublicKey, // mint
            tokenAccountPublicKey, // receiver (should be a token account)
            address, // mint authority
            input.amount, // amount of tokens to mint
            0 // decimals
          )
        );

        // Send transaction and await for signature
        signature = await wallet.sendTransaction(transaction, connection);

        console.log(signature);
        return signature;
      } catch (error: unknown) {
        console.log("error", `Transaction failed! ${error}`, signature);

        return;
      }
    },
    onSuccess: (signature) => {
      if (signature) {
        toast.success("Transaction Successfull", {
          description: ellipsify(signature),
          action: {
            label: "Explorer Link",
            onClick: () => window.open(getExplorerUrl(`tx/${signature}`), "_blank"),
          },
          duration: 10000,
        });
      }

      return client.refetchQueries({
        queryKey: ["get-token-accounts", { endpoint: connection.rpcEndpoint, address }],
      });
    },
    onError: (error) => {
      toast.error("Transaction Failed", {
        description: `${error}`,
        duration: 10000,
      });
      console.log("error", `Transaction failed! ${error}`);
    },
  });
}