'use client';

import { useState, useEffect } from 'react';
import { CostOptimizationDashboard, ModelUsage, CostComparison, BudgetConfig } from '@/components/cost/CostOptimizationDashboard';

export default function CostPage() {
  const [modelUsage, setModelUsage] = useState<ModelUsage[]>([]);
  const [costComparison, setCostComparison] = useState<CostComparison>({
    currentCost: 0,
    baselineCost: 0,
    savings: 0,
    savingsPercentage: 0,
  });
  const [currentSpend, setCurrentSpend] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>({
    dailyLimit: 10,
    weeklyLimit: 50,
    monthlyLimit: 200,
    alertThreshold: 80,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCostData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCostData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCostData = async () => {
    try {
      const response = await fetch('/api/cost/track');
      const data = await response.json();
      setModelUsage(data.modelUsage);
      setCostComparison(data.costComparison);
      setCurrentSpend(data.currentSpend);
    } catch (error) {
      console.error('Failed to fetch cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async (config: BudgetConfig) => {
    setBudgetConfig(config);
    // In production, save to database
    localStorage.setItem('budget_config', JSON.stringify(config));
  };

  const handleSelectModel = (modelId: string) => {
    console.log('Selected model:', modelId);
    // Could navigate to model details page
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cost data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <CostOptimizationDashboard
        modelUsage={modelUsage}
        costComparison={costComparison}
        budgetConfig={budgetConfig}
        currentSpend={currentSpend}
        onUpdateBudget={handleUpdateBudget}
        onSelectModel={handleSelectModel}
      />
    </div>
  );
}
