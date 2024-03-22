import { ClusterUiTable } from "./cluster-ui";
import { useEffect, useState } from "react";

export default function ClusterFeature() {
  const [loading, setLoading] = useState(true);

  // Simulating asynchronous data loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clusters data here
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch clusters:", error);
        // Handle error gracefully
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      // Perform cleanup if necessary
    };
  }, []);

  return (
    <div>
      <div className="bg-background px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">Clusters</h2>
          <p className="mt-6 text-lg leading-8 text-gray-500">Manage your Solana clusters</p>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <ClusterUiTable />
      )}
    </div>
  );
}
