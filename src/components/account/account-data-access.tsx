import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  PublicKey,
  TransactionSignature,
  Connection,
  VersionedTransaction,
  TransactionMessage,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCluster } from "../cluster/cluster-data-access";
import { ellipsify } from "@/lib/utils";

export function useGetBalance({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-balance", { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getBalance(address),
  });
}

export function useRequestAirdrop({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const client = useQueryClient();
  const { getExplorerUrl } = useCluster();

  return useMutation({
    mutationKey: ["airdrop", { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (amount: number = 1) => {
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(address, amount * LAMPORTS_PER_SOL),
      ]);

      await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");
      return signature;
    },
    onSuccess: (signature) => {
      if (signature) {
        toast.success("Transaction Successful", {
          description: ellipsify(signature),
          action: {
            label: "Explorer Link",
            onClick: () => window.open(getExplorerUrl(`tx/${signature}`), "_blank"),
          },
          duration: 10000,
        });
      }

      return Promise.all([
        client.invalidateQueries({
          queryKey: ["get-balance", { endpoint: connection.rpcEndpoint, address }],
        }),
        client.invalidateQueries({
          queryKey: ["get-signatures", { endpoint: connection.rpcEndpoint, address }],
        }),
      ]);
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

export function useTransferSol({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const { getExplorerUrl } = useCluster();
  const wallet = useWallet();
  const client = useQueryClient();

  return useMutation({
    mutationKey: ["Transfer SOL", { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (input: { destination: PublicKey; amount: number }) => {
      let signature: TransactionSignature = "";
      try {
        const { transaction, latestBlockhash } = await createTransaction({
          publicKey: address,
          destination: input.destination,
          amount: input.amount,
          connection,
        });

        // Send transaction and await for signature
        signature = await wallet.sendTransaction(transaction, connection);

        // Send transaction and await for signature
        await connection.confirmTransaction({ signature, ...latestBlockhash }, "confirmed");

        return signature;
      } catch (error: unknown) {
        console.log("error", `Transaction failed! ${error}`, signature);

        return;
      }
    },
    onSuccess: (signature) => {
      if (signature) {
        toast.success("Transaction Successful", {
          description: ellipsify(signature),
          action: {
            label: "Explorer Link",
            onClick: () => window.open(getExplorerUrl(`tx/${signature}`), "_blank"),
          },
          duration: 10000,
        });
      }
      return Promise.all([
        client.invalidateQueries({
          queryKey: ["get-balance", { endpoint: connection.rpcEndpoint, address }],
        }),
        client.invalidateQueries({
          queryKey: ["get-signatures", { endpoint: connection.rpcEndpoint, address }],
        }),
      ]);
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

async function createTransaction({
  publicKey,
  destination,
  amount,
  connection,
}: {
  publicKey: PublicKey;
  destination: PublicKey;
  amount: number;
  connection: Connection;
}): Promise<{
  transaction: VersionedTransaction;
  latestBlockhash: { blockhash: string; lastValidBlockHeight: number };
}> {
  // Get the latest blockhash to use in our transaction
  const latestBlockhash = await connection.getLatestBlockhash();

  // Create instructions to send, in this case a simple transfer
  const instructions = [
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: destination,
      lamports: amount * LAMPORTS_PER_SOL,
    }),
  ];

  // Create a new TransactionMessage with version and compile it to legacy
  const messageLegacy = new TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToLegacyMessage();

  // Create a new VersionedTransaction which supports legacy and v0
  const transaction = new VersionedTransaction(messageLegacy);

  return {
    transaction,
    latestBlockhash,
  };
}

export function useGetSignatures({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-signatures", { endpoint: connection.rpcEndpoint, address }],
    queryFn: () => connection.getSignaturesForAddress(address),
  });
}

export function useGetParsedTransactions(signatures: string[], options?: { enabled: boolean }) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["get-parsed-transactions", { endpoint: connection.rpcEndpoint, signatures }],
    queryFn: () => connection.getParsedTransactions(signatures),
    ...options,
  });
}
