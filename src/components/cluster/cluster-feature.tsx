"use client";

import React, { useState, useEffect } from 'react';
import { fetchData } from './api'; // Placeholder for your actual API call
import { ClusterUiTable } from "./cluster-ui";

export default function ClusterFeature() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
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
  }, []);

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
            <input
              type="text"
              placeholder="Search clusters..."
              className="px-4 py-2 border rounded-lg"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="px-6 py-4 sm:px-32 lg:px-8">
        {loading && <div>Loading clusters...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && filteredClusters.length === 0 && (
          <div>No clusters found.</div>
        )}
        {!loading && !error && filteredClusters.length > 0 && (
          <ClusterUiTable clusters={filteredClusters} />
        )}
      </div>
    </div>
  );
}
