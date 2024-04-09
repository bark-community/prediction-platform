"use client";
import React from 'react';
import { useClient } from 'use-client';
import ClusterFeature from '@/components/cluster/cluster-feature';

export default function Page() {
  useClient();
  return <ClusterFeature />;
}
