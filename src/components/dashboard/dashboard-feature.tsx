// components/DashboardFeature.js
import React from 'react';

export default function DashboardFeature() {
  return (
    <section className="bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">Welcome to BARK Prediction Platform</h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-500 sm:text-2xl">Empowering Charity Through Predictive Giving</h2>
        <p className="mt-6 text-lg leading-8 text-gray-500">Unleash Predictive Insights on Solana</p>
        <button className="mt-8 bg-primary text-white px-6 py-3 rounded-md shadow-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary">
          Get Started
        </button>
      </div>
    </section>
  );
}
