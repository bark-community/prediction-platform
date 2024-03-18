import { useRequestAirdrop, useGetBalance, useTransferSol, useGetSignatures } from "./account-data-access";
import { LAMPORTS_PER_SOL, type ConfirmedSignatureInfo } from "@solana/web3.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { Check, Copy, HandCoins, Send, Droplet, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExplorerLink } from "../cluster/cluster-ui";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "../ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatTimeSince, ellipsify } from "@/lib/utils";
import LoadingSpinner from "../ui/loading-spinner";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

export function AccountBalance({ address }: { address: PublicKey }) {
  const { data, isLoading, refetch } = useGetBalance({ address });
  const [balance, setBalance] = useState<number>();
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    if (!publicKey) {
      console.log("Wallet is not connected");
      return;
    }

    if (data) {
      const initialBalance = Number((data / LAMPORTS_PER_SOL).toFixed(3));
      setBalance(initialBalance);
    }

    const ACCOUNT_TO_WATCH = publicKey;
    let subscriptionId: number;

    const subscribeToAccount = async () => {
      subscriptionId = connection.onAccountChange(
        ACCOUNT_TO_WATCH,
        (updatedAccountInfo) => {
          console.log(`---Event Notification for ${ACCOUNT_TO_WATCH.toBase58()}---`);
          const newBalance = (updatedAccountInfo.lamports / LAMPORTS_PER_SOL).toFixed(3);
          toast.success("SOL Balance Updated");
          setBalance(Number(newBalance));
        },
        "confirmed"
      );
      console.log("Subscription ID:", subscriptionId);
    };

    subscribeToAccount();

    return () => {
      console.log(`Unsubscribing from account changes for: ${ACCOUNT_TO_WATCH.toBase58()}`);
      connection.removeAccountChangeListener(subscriptionId).then(() => {
        console.log("Unsubscribed from account changes");
      });
    };
  }, [connection, publicKey, data]);

  return (
    <div>
      <h3
        className="text-1xl font-bold tracking-tight text-primary sm:text-2xl cursor-pointer"
        onClick={() => refetch()}
      >
        {isLoading ? <LoadingSpinner /> : balance + " SOL"}
      </h3>
    </div>
  );
}

export function AirdropModal({ address }: { address: PublicKey }) {
  const [amount, setAmount] = useState("1");
  const mutation = useRequestAirdrop({ address });

  function handleSubmit() {
    console.log(`Airdrop ${amount} to ${address}`);
    mutation.mutateAsync(parseFloat(amount)).then(() => setAmount("1"));
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Droplet className="h-5 w-5 pr-1" />
          Airdrop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Airdrop</DialogTitle>
          <DialogDescription>Request Airdrop</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount
          </Label>
          <Input
            type="number"
            step="any"
            id="amount"
            placeholder="amount"
            className="col-span-3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" onClick={handleSubmit}>
              Submit
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SendModal({ address }: { address: PublicKey }) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [isSendDisabled, setIsSendDisabled] = useState(true);

  const mutation = useTransferSol({ address });

  useEffect(() => {
    if (destination.length >= 43 && parseFloat(amount) > 0) {
      setIsSendDisabled(false);
    } else {
      setIsSendDisabled(true);
    }
  }, [destination, amount]);

  function handleSend() {
    console.log(`Send ${amount} to ${destination}`);

    mutation
      .mutateAsync({
        destination: new PublicKey(destination),
        amount: parseFloat(amount),
      })
      .then(() => {
        console.log("success");
        setDestination("");
        setAmount("");
      });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Send className="h-5 w-5 pr-1" />
          Send
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send</DialogTitle>
          <DialogDescription>Send Sol to anyone on the network</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address" className="text-right">
              Address
            </Label>
            <Input
              id="address"
              placeholder="Ex7...Qc3"
              className="col-span-3"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              type="number"
              step="any"
              id="amount"
              placeholder="amount"
              className="col-span-3"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>

          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div>
                  <DialogClose asChild>
                    <Button type="submit" onClick={handleSend} disabled={isSendDisabled}>
                      Send
                    </Button>
                  </DialogClose>
                </div>
              </TooltipTrigger>
              {isSendDisabled && (
                <TooltipContent>
                  <p>Invalid Input</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReceiveModal({ address }: { address: PublicKey }) {
  const [isCopied, setIsCopied] = useState(false);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      console.log(`Copied ${text} to clipboard`);
      // wait 2 seconds and then reset the button
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
      // alert("Copied to clipboard"); // Optionally, show some feedback
      // Toast this shit!
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HandCoins className="h-5 w-5 pr-1" />
          Receive
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receive</DialogTitle>
          <DialogDescription>Share your address to request funds</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={address.toString()} readOnly />
          </div>
          <Button type="submit" size="sm" className="px-3">
            <span className="sr-only">Copy</span>
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" onClick={() => copyToClipboard(address.toString())} />
            )}
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AccountTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address });

  const txSignatures: ConfirmedSignatureInfo[] | undefined = query.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between py-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-bold leading-7 sm:truncate sm:text-2xl sm:tracking-tight">Transaction History</h2>
        </div>
        {query.isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Button type="button" variant="outline" size="sm">
              <RefreshCw className="h-5 w-5 pr-1" onClick={() => query.refetch()} />
            </Button>
          </div>
        )}
        {query.isError && <pre className="">Error: {query.error?.message.toString()}</pre>}
      </div>
      {query.isSuccess && <DataTable columns={columns} data={txSignatures} />}
    </div>
  );
}

export const columns: ColumnDef<ConfirmedSignatureInfo>[] = [
  {
    accessorKey: "signature",
    header: "Signature",
    cell: ({ row }) => {
      const signature: string = row.getValue("signature");

      return <ExplorerLink path={`tx/${signature}`} label={ellipsify(signature, 8)} />;
    },
  },
  {
    accessorKey: "slot",
    header: "Slot",
    cell: ({ row }) => {
      const slot: string = row.getValue("slot");

      return <ExplorerLink path={`block/${slot}`} label={slot} />;
    },
  },
  {
    accessorKey: "blockTime",
    header: "Age",
    cell: ({ row }) => {
      const blockTime: number = row.getValue("blockTime");
      const formatted = formatTimeSince(blockTime);

      return formatted;
    },
  },
  {
    accessorKey: "confirmationStatus",
    header: "Status",
  },
];
