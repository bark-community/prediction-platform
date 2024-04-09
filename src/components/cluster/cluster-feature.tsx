"use client";
import React from 'react';
import { useCluster } from './cluster-data-access';
import { Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define the prop types for ClusterUiTable
interface ClusterUiTableProps {
  onDelete: (clusterName: string) => void;
}

// Define the ClusterUiTable component
const ClusterUiTable: React.FC<ClusterUiTableProps> = ({ onDelete }) => {
  // Use the useCluster hook to get clusters and setCluster function
  const { clusters, setCluster } = useCluster();

  // Define the function to handle cluster selection
  const handleClusterSelect = (clusterName: string) => {
    const selectedCluster = clusters.find(cluster => cluster.name === clusterName);
    if (selectedCluster) {
      setCluster(selectedCluster);
    }
  };

  // Define the function to handle cluster deletion
  const handleDeleteCluster = (clusterName: string) => {
    if (window.confirm('Are you sure you want to delete this cluster?')) {
      onDelete(clusterName);
    }
  };

  // Render the ClusterUiTable component
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Network</TableHead>
          <TableHead>Endpoint</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clusters?.length ? (
          clusters.map(cluster => (
            <TableRow key={cluster.name}>
              <TableCell>
                {/* Use button to trigger cluster selection */}
                <button
                  className="link link-secondary"
                  onClick={() => handleClusterSelect(cluster.name)}
                >
                  {cluster.name}
                </button>
              </TableCell>
              <TableCell>{cluster.network ?? 'Custom'}</TableCell>
              <TableCell>{cluster.endpoint}</TableCell>
              <TableCell>
                {/* Use button to trigger cluster deletion */}
                <button
                  className="btn btn-xs btn-default btn-outline"
                  onClick={() => handleDeleteCluster(cluster.name)}
                >
                  <Trash2 className="h-5 w-5 float-end" />
                </button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4}>No clusters found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

// Export the ClusterUiTable component as default
export default ClusterUiTable;
