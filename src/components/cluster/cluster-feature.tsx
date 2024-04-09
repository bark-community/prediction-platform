import React, { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { ClusterUiTable } from "./cluster-ui";

// Mock fetchData function (replace with your actual API call)
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = [{ name: "Solana Mainnet", endpoint: "https://api.mainnet-beta.solana.com", active: true }];
      resolve(data);
    }, 1000);
  });
};

export default function ClusterFeature() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchClusters();
  }, []);

  const fetchClusters = () => {
    setLoading(true);
    fetchData()
      .then(data => {
        setClusters(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load clusters:', error);
        setError('Failed to load clusters. Please try again later.');
        setLoading(false);
      });
  };

  // Debounce filter function
  const debouncedSetFilter = useCallback(
    debounce((nextValue) => setFilter(nextValue), 300),
    []
  );

  const handleFilterChange = (e) => {
    debouncedSetFilter(e.target.value);
  };

  const filteredClusters = clusters.filter(cluster =>
    cluster.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="bg-background px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">Clusters</h2>
          <p className="mt-6 text-lg leading-8 text-gray-500">Manage your Solana Clusters efficiently</p>
          <div className="mt-4">
            <label htmlFor="clusterSearch" className="sr-only">Search Clusters</label>
            <input
              id="clusterSearch"
              type="text"
              placeholder="Search clusters..."
              className="px-4 py-2 border rounded-lg"
              onChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 sm:px-32 lg:px-8">
        {loading && <div>Loading clusters...</div>}
        {error && (
          <div className="text-red-500">
            {error}
            <button
              onClick={fetchClusters}
              className="ml-4 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors">
              Retry
            </button>
          </div>
        )}
        {!loading && !error && filteredClusters.length === 0 && (
          <div>No clusters found. Try adjusting your search criteria.</div>
        )}
        {!loading && !error && filteredClusters.length > 0 && (
          <ClusterUiTable clusters={filteredClusters} />
        )}
      </div>
    </div>
  );
}
