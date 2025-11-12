'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, CreditCard, ChevronRight } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  coverage: {
    liability: number;
    equipment: number;
    cancellation: number;
  };
  benefits: string[];
}

interface PackageDetailsProps {
  package?: Package;
  onSelect?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const DEFAULT_PACKAGE: Package = {
  id: '1',
  name: 'Premium Protection',
  description: 'Comprehensive coverage for your gigs',
  price: 49.99,
  coverage: {
    liability: 1000000,
    equipment: 5000,
    cancellation: 2500,
  },
  benefits: [
    '24/7 Support',
    'Equipment Replacement',
    'Liability Coverage',
    'Cancellation Protection',
  ],
};

export function PackageDetails({
  package: packageProp = DEFAULT_PACKAGE,
  onSelect = () => {},
  isLoading = false,
  error = null,
}: PackageDetailsProps) {
  const currentPackage = packageProp;

  if (isLoading) {
    return (
      <div className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 animate-pulse">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-surface dark:bg-surface rounded w-3/5"></div>
            <div className="h-8 bg-surface dark:bg-surface rounded w-1/5"></div>
          </div>
          <div className="h-4 bg-surface dark:bg-surface rounded w-full"></div>
          <div className="h-4 bg-surface dark:bg-surface rounded w-4/5"></div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 h-24 bg-surface dark:bg-surface rounded-lg"></div>
              <div className="flex-1 h-24 bg-surface dark:bg-surface rounded-lg"></div>
            </div>
            <div className="h-24 bg-surface dark:bg-surface rounded-lg"></div>
          </div>

          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-surface dark:bg-surface"></div>
                <div className="h-4 bg-surface dark:bg-surface rounded w-2/3"></div>
              </div>
            ))}
          </div>

          <div className="h-12 bg-surface dark:bg-surface rounded-lg w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6">
        <div className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4">
          <p className="text-sm text-destructive dark:text-destructive">Error: {error}</p>
          <p className="text-sm text-destructive dark:text-destructive mt-1">
            Could not load package details. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 font-inter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        y: -4,
      }}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground leading-tight">
            {currentPackage.name}
          </h2>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#3B82F6]" />
            <span className="text-lg font-medium text-[#3B82F6] leading-tight">
              ${currentPackage.price}/mo
            </span>
          </div>
        </div>

        <p className="text-muted-foreground dark:text-muted-foreground text-base leading-relaxed">
          {currentPackage.description}
        </p>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 rounded-lg bg-surface dark:bg-surface p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                  Liability
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-muted-foreground dark:text-foreground leading-tight">
                ${currentPackage.coverage.liability.toLocaleString()}
              </p>
            </div>
            <div className="flex-1 rounded-lg bg-surface dark:bg-surface p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                  Equipment
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-muted-foreground dark:text-foreground leading-tight">
                ${currentPackage.coverage.equipment.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-surface dark:bg-surface p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Cancellation
              </span>
            </div>
            <p className="mt-2 text-lg font-semibold text-muted-foreground dark:text-foreground leading-tight">
              ${currentPackage.coverage.cancellation.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {currentPackage.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
              <span className="text-sm text-muted-foreground dark:text-muted-foreground leading-normal">
                {benefit}
              </span>
            </div>
          ))}
        </div>

        <motion.button
          className="flex w-full items-center justify-between rounded-lg bg-[#3B82F6] px-6 py-3 text-foreground transition-all duration-150
                     hover:bg-primary focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2
                     dark:hover:bg-primary dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelect}
          aria-label={`Select ${currentPackage.name} plan`}
        >
          <span className="font-medium text-base leading-normal">Select Plan</span>
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function PackageDetailsDemo() {
  return <PackageDetails />;
}