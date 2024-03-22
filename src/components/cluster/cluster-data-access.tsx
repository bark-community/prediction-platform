"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { createContext, ReactNode, useContext } from "react";

export interface Cluster {
  name: string;
  endpoint: string;
  network?: ClusterNetwork;
  active?: boolean;
}

export enum ClusterNetwork {
  Mainnet = "mainnet-beta",
  Testnet = "testnet",
  Devnet = "devnet",
  Custom = "custom",
}

export function toWalletAdapterNetwork(cluster?: ClusterNetwork): WalletAdapterNetwork | undefined {
  switch (cluster) {
    case ClusterNetwork.Mainnet:
      return WalletAdapterNetwork.Mainnet;
    case ClusterNetwork.Testnet:
      return WalletAdapterNetwork.Testnet;
    case ClusterNetwork.Devnet:
      return WalletAdapterNetwork.Devnet;
    default:
      return undefined;
  }
}

export const defaultClusters: Cluster[] = [
  {
    name: "devnet",
    endpoint: clusterApiUrl("devnet"),
    network: ClusterNetwork.Devnet,
  },
  { name: "local", endpoint: "http://localhost:8899" },
  {
    name: "testnet",
    endpoint: clusterApiUrl("testnet"),
    network: ClusterNetwork.Testnet,
  },
  {
    name: "mainnet",
    endpoint: "https://api.mainnet-beta.solana.com", // Updated endpoint to start with `https:`
    network: ClusterNetwork.Mainnet,
  },
];

const clusterAtom = atomWithStorage<Cluster>("solana-cluster", defaultClusters[0]);
const clustersAtom = atomWithStorage<Cluster[]>("solana-clusters", defaultClusters);

const activeClustersAtom = atom<Cluster[]>((get) => {
  const clusters = get(clustersAtom);
  const cluster = get(clusterAtom);
  return clusters.map((item) => ({
    ...item,
    active: item.name === cluster.name,
  }));
});

const activeClusterAtom = atom<Cluster>((get) => {
  const clusters = get(activeClustersAtom);
  return clusters.find((item) => item.active) || clusters[0];
});

export interface ClusterProviderContext {
  cluster: Cluster;
  clusters: Cluster[];
  addCluster: (cluster: Cluster) => void;
  deleteCluster: (cluster: Cluster) => void;
  setCluster: (cluster: Cluster) => void;
  getExplorerUrl(path: string): string;
}

const Context = createContext<ClusterProviderContext>({} as ClusterProviderContext);

export function ClusterProvider({ children }: { children: ReactNode }) {
  const cluster = useAtomValue(activeClusterAtom);
  const clusters = useAtomValue(activeClustersAtom);
  const setCluster = useSetAtom(clusterAtom);
  const setClusters = useSetAtom(clustersAtom);

  const addCluster = (cluster: Cluster) => {
    try {
      if (!cluster.endpoint.startsWith("http:") && !cluster.endpoint.startsWith("https:")) {
        throw new Error("Endpoint URL must start with `http:` or `https:`.");
      }
      new Connection(cluster.endpoint);
      setClusters([...clusters, cluster]);
    } catch (error) {
      console.error("Failed to add cluster:", error);
      // Handle error gracefully or provide user feedback
    }
  };

  const deleteCluster = (cluster: Cluster) => {
    setClusters(clusters.filter((item) => item.name !== cluster.name));
  };

  const setClusterHandler = (cluster: Cluster) => setCluster(cluster);

  const getExplorerUrl = (path: string) => {
    const cluster = activeClusterAtom.getState();
    return `https://explorer.solana.com/${path}${getClusterUrlParam(cluster)}`;
  };

  return (
    <Context.Provider value={{ cluster, clusters, addCluster, deleteCluster, setCluster: setClusterHandler, getExplorerUrl }}>
      {children}
    </Context.Provider>
  );
}

export function useCluster() {
  return useContext(Context);
}

function getClusterUrlParam(cluster: Cluster): string {
  let suffix = "";
  switch (cluster.network) {
    case ClusterNetwork.Devnet:
      suffix = "devnet";
      break;
    case ClusterNetwork.Mainnet:
      suffix = "";
      break;
    case ClusterNetwork.Testnet:
      suffix = "testnet";
      break;
    default:
      suffix = `custom&customUrl=${encodeURIComponent(cluster.endpoint)}`;
      break;
  }

  return suffix.length ? `?cluster=${suffix}` : "";
}
