import { ClusterUiTable } from "./cluster-ui";

export default function ClusterFeature() {
  return (
    <div>
      <div className="bg-background px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">Clusters</h2>
          <p className="mt-6 text-lg leading-8 text-gray-500">Manage your solana Clusters like a boss</p>
        </div>
      </div>
      <ClusterUiTable />
    </div>
  );
}