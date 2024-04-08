import { PublicKey, Keypair, SystemProgram, TransactionSignature, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ellipsify } from "@/lib/utils";
import { useCluster } from "@/components/cluster/cluster-data-access";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMint2Instruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

import {
  PROGRAM_ID as METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
} from "@metaplex-foundation/mpl-token-metadata";

export function useCreateMintWithMetadata({ address }: { address: PublicKey }) {
  const { connection } = useConnection();
  const { sendTransaction } = useWallet();
  const client = useQueryClient();
  const { getExplorerUrl } = useCluster();

  return useMutation({
    mutationKey: ["create-token-mint", { endpoint: connection.rpcEndpoint, address }],
    mutationFn: async (input: { name: string; symbol: string; decimals: number; uri: string }) => {
      console.log("input", input);
      let signature: TransactionSignature = "";
      try {
        const tokenMint = Keypair.generate();
        // create instruction for the token mint account
        const createMintAccountInstruction = SystemProgram.createAccount({
          fromPubkey: address,
          newAccountPubkey: tokenMint.publicKey,
          // the `space` required for a token mint is accessible in the `@solana/spl-token` sdk
          space: MINT_SIZE,
          // store enough lamports needed for our `space` to be rent exempt
          lamports: await connection.getMinimumBalanceForRentExemption(MINT_SIZE),
          // tokens are owned by the "token program"
          programId: TOKEN_PROGRAM_ID,
        });

        // Initialize that account as a Mint
        const initializeMintInstruction = createInitializeMint2Instruction(
          tokenMint.publicKey,
          input.decimals,
          address,
          address
        );

        // derive the pda address for the Metadata account
        const metadataAccount = PublicKey.findProgramAddressSync(
          [Buffer.from("metadata"), METADATA_PROGRAM_ID.toBuffer(), tokenMint.publicKey.toBuffer()],
          METADATA_PROGRAM_ID
        )[0];

        // Create the Metadata account for the Mint
        const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
          {
            metadata: metadataAccount,
            mint: tokenMint.publicKey,
            mintAuthority: address,
            payer: address,
            updateAuthority: address,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                creators: null,
                name: input.name,
                symbol: input.symbol,
                uri: input.uri,
                sellerFeeBasisPoints: 0,
                collection: null,
                uses: null,
              },
              // `collectionDetails` - for non-nft type tokens, normally set to `null` to not have a value set
              collectionDetails: null,
              // should the metadata be updatable?
              isMutable: true,
            },
          }
        );

        // Create the associated token account for the user
        const associatedToken = await getAssociatedTokenAddress(
          tokenMint.publicKey,
          address,
          false,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const associatedTokenAccountInstruction = createAssociatedTokenAccountInstruction(
          address,
          associatedToken,
          address,
          tokenMint.publicKey,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Built transaction to send to blockchain
        const transaction = new Transaction().add(
          createMintAccountInstruction,
          initializeMintInstruction,
          createMetadataInstruction,
          associatedTokenAccountInstruction
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