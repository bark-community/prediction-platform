import React from 'react';
import MarginFiPools from './marginfi-pools';

const PoolsListFeature: React.FC = () => {
  const dummyData = [
    // Dummy data goes here...
  ];

  return (
    <div>
      <h1>Pools List Feature</h1>
      <MarginFiPools pools={dummyData} />
    </div>
  );
};

export default PoolsListFeature;
