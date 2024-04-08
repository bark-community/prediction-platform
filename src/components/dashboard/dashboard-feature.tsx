import React from 'react';

export default function DashboardFeature() {
  return (
    <section className="bg-background px-4 sm:px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary">
          Welcome to BARK Prediction Platform
        </h1>
        <h2 className="mt-4 text-lg sm:text-xl md:text-2xl font-semibold text-gray-500">
          Empowering Charity Through Predictive Giving
        </h2>
        <p className="mt-6 text-base sm:text-lg leading-8 text-gray-500">
          Unleash Predictive Insights on Solana
        </p>
        <div className="mt-8">
          <a href="/doc" className="px-5 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition-colors">
            Document
          </a>
          <a href="/make-prediction" className="ml-4 px-5 py-3 border border-primary text-primary rounded-lg shadow hover:bg-gray-100 transition-colors">
            Make a Prediction
          </a>
        </div>
      </div>
    </section>
  );
}
