import { createJupiterApiClient } from "../src/index";
import { Connection, Keypair, VersionedTransaction } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import bs58 from "bs58";
import { transactionSenderAndConfirmationWaiter } from "./utils/transactionSender";
import { getSignature } from "./utils/getSignature";

async function initializeWallet() {
    const privateKeyEnv = process.env.PRIVATE_KEY;
    if (!privateKeyEnv) {
        throw new Error("Private key not found in environment variable.");
    }
    const privateKey = bs58.decode(privateKeyEnv);
    return new Wallet(Keypair.fromSecretKey(privateKey));
}

async function fetchQuote(jupiterQuoteApi, swapParams) {
    const quote = await jupiterQuoteApi.quoteGet(swapParams);
    if (!quote) {
        throw new Error("Unable to fetch quote.");
    }
    console.log("Quote:", quote);
    return quote;
}

async function performSwap(jupiterQuoteApi, quote, wallet) {
    const swapResult = await jupiterQuoteApi.swapPost({
        swapRequest: {
            quoteResponse: quote,
            userPublicKey: wallet.publicKey.toBase58(),
            dynamicComputeUnitLimit: true,
            prioritizationFeeLamports: "auto",
        },
    });
    console.log("Swap result:", swapResult);
    return swapResult;
}

async function simulateTransaction(connection, transaction) {
    const simulatedTransactionResponse = await connection.simulateTransaction(transaction, {
        replaceRecentBlockhash: true,
        commitment: "processed",
    });

    if (simulatedTransactionResponse.err) {
        throw new Error("Simulation failed: " + simulatedTransactionResponse.err);
    }

    return transaction.message.recentBlockhash;
}

async function sendAndConfirmTransaction(connection, serializedTransaction, blockhash, lastValidBlockHeight) {
    const transactionResponse = await transactionSenderAndConfirmationWaiter({
        connection,
        serializedTransaction,
        blockhashWithExpiryBlockHeight: {
            blockhash,
            lastValidBlockHeight,
        },
    });

    if (!transactionResponse) {
        throw new Error("Transaction not confirmed.");
    }

    if (transactionResponse.meta?.err) {
        throw new Error("Transaction failed: " + transactionResponse.meta?.err);
    }

    return transactionResponse;
}

async function main() {
    try {
        console.log("Initializing Jupiter Terminal...");

        const jupiterQuoteApi = createJupiterApiClient();
        const connection = new Connection("https://neat-hidden-sanctuary.solana-mainnet.discover.quiknode.pro/2af5315d336f9ae920028bbb90a73b724dc1bbed/");
        const wallet = await initializeWallet();

        console.log("Wallet initialized with public key:", wallet.publicKey.toBase58());

        const swapParams = {
            inputMint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
            outputMint: "BARKtwgaaR4tn1vaBpUGbmMNSq3Wt7qzfDsSPSBv4orS",
            amount: 35281,
            slippageBps: 50,
            onlyDirectRoutes: false,
            asLegacyTransaction: false,
        };

        const quote = await fetchQuote(jupiterQuoteApi, swapParams);
        const swapResult = await performSwap(jupiterQuoteApi, quote, wallet);

        const swapTransactionBuf = Buffer.from(swapResult.swapTransaction, "base64");
        const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
        transaction.sign([wallet.payer]);

        const blockhash = await simulateTransaction(connection, transaction);

        await sendAndConfirmTransaction(connection, Buffer.from(transaction.serialize()), blockhash, swapResult.lastValidBlockHeight);

        console.log("Transaction confirmed.");
        console.log("Transaction signature:", getSignature(transaction));
        console.log("View transaction on Solscan:", `https://solscan.io/tx/${getSignature(transaction)}`);
    } catch (error) {
        console.error("Error:", error.message);
    }
}

main();
