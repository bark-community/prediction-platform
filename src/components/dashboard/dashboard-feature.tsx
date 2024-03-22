"use client";

import React, { useState, useEffect } from 'react';

export default function DashboardFeature() {
  const [documentationUri, setDocumentationUri] = useState<string | null>(null);

  useEffect(() => {
    // Fetch documentation URI from an API or any asynchronous operation
    fetchDocumentationUri().then(uri => {
      setDocumentationUri(uri);
    });
  }, []);

  const fetchDocumentationUri = async () => {
    // Simulated API call
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve('https://barkprotocol.net/documentation');
      }, 2000); // Simulate 2 seconds delay
    });
  };

  const handleDocumentationClick = () => {
    if (documentationUri) {
      window.open(documentationUri, '_blank');
    }
  };

  return (
    <section className="bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Welcome to BARK Prediction Platform
        </h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-600 sm:text-2xl">
          Empowering Charity Through Predictive Giving
        </h2>
        <p className="mt-6 text-lg leading-8 text-gray-700">
          Unleash Predictive Insights on Solana
        </p>
        <button
          className="mt-8 bg-primary text-white px-6 py-3 rounded-md shadow-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={handleDocumentationClick}
          disabled={!documentationUri}
        >
          Explore Documentation
        </button>
      </div>
    </section>
  );
}
