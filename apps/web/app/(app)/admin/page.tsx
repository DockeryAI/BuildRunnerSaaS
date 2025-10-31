'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Zap, 
  Shield, 
  AlertTriangle, 
  Ticket,
  TrendingUp,
  Users,
  Activity,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import AdminManager, { AdminDashboardStats, ProjectOverview } from '../../../lib/admin/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demo - in production this would call AdminManager
      const mockStats: AdminDashboardStats = {
        totalProjects: 42,
        activeProjects: 38,
        monthlySpend: 15420.50,
        monthlyTokens: 2850000,
        qualityScore: 87,
        activeIssues: 3,
        openTickets: 7,
      };

      const mockProjects: ProjectOverview[] = [
        {
          id: '1',
          name: 'E-commerce Platform',
          orgId: 'org1',
          status: 'active',
          monthlySpend: 2450.00,
          monthlyBudget: 3000.00,
          budgetUsedPercent: 81.7,
          tokenUsage: 450000,
          qualityScore: 92,
          lastActivity: new Date().toISOString(),
          issueCount: 1,
        },
        {
          id: '2',
          name: 'Mobile App Backend',
          orgId: 'org2',
          status: 'active',
          monthlySpend: 1850.00,
          monthlyBudget: 2000.00,
          budgetUsedPercent: 92.5,
          tokenUsage: 320000,
          qualityScore: 85,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          issueCount: 2,
        },
        {
          id: '3',
          name: 'Analytics Dashboard',
          orgId: 'org3',
          status: 'active',
          monthlySpend: 950.00,
          monthlyBudget: 1500.00,
          budgetUsedPercent: 63.3,
          tokenUsage: 180000,
          qualityScore: 89,
          lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          issueCount: 0,
        },
      ];

      setStats(mockStats);
      setProjects(mockProjects);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getBudgetColor = (percentage: number): string => {
    if (percentage >= 95) return 'text-red-600 bg-red-100';
    if (percentage >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getQualityColor = (score: number): string => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Admin Console...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Console</h1>
        <p className="text-gray-600">
          Monitor and manage BuildRunner operations, costs, and governance
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalProjects} total projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlySpend)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Tokens</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.monthlyTokens)}</div>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.qualityScore}%</div>
              <p className="text-xs text-muted-foreground">
                Platform average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Overview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Project Overview</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {project.status}
                        </Badge>
                        {project.issueCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {project.issueCount} issue{project.issueCount !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Spend:</span>
                          <div className="font-medium">{formatCurrency(project.monthlySpend)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Budget:</span>
                          <div className={`font-medium px-2 py-1 rounded-full text-xs ${getBudgetColor(project.budgetUsedPercent)}`}>
                            {project.budgetUsedPercent.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Tokens:</span>
                          <div className="font-medium">{formatNumber(project.tokenUsage)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Quality:</span>
                          <div className={`font-medium px-2 py-1 rounded-full text-xs ${getQualityColor(project.qualityScore)}`}>
                            {project.qualityScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>{new Date(project.lastActivity).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Active Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats && stats.activeIssues > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <div className="font-medium text-red-900">Budget Exceeded</div>
                      <div className="text-sm text-red-700">Mobile App Backend</div>
                    </div>
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <div className="font-medium text-yellow-900">Rate Limit Hit</div>
                      <div className="text-sm text-yellow-700">E-commerce Platform</div>
                    </div>
                    <Badge variant="outline" className="text-xs">Medium</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <div className="font-medium text-blue-900">Quality Drop</div>
                      <div className="text-sm text-blue-700">Analytics Dashboard</div>
                    </div>
                    <Badge variant="outline" className="text-xs">Low</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No active issues</p>
              )}
            </CardContent>
          </Card>

          {/* Support Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-blue-600" />
                Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats && stats.openTickets > 0 ? (
                <div className="space-y-3">
                  <div className="text-center text-2xl font-bold text-gray-900">
                    {stats.openTickets}
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    tickets need attention
                  </div>
                  <Button className="w-full" size="sm">
                    View Incident Center
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No open tickets</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Start Impersonation
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Adjust Credits
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
