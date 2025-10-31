'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface ComplianceMetrics {
  overall_score: number;
  policy_violations: number;
  security_incidents: number;
  audit_events_today: number;
  change_requests_pending: number;
  data_integrity_score: number;
  user_access_compliance: number;
  backup_status: 'healthy' | 'warning' | 'critical';
  last_updated: string;
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
}

interface PolicyViolation {
  id: string;
  policy: string;
  violation_type: string;
  user_id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'acknowledged' | 'resolved';
}

export function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [policyViolations, setPolicyViolations] = useState<PolicyViolation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadComplianceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadComplianceData = async () => {
    try {
      // In production, these would be real API calls
      const mockMetrics: ComplianceMetrics = {
        overall_score: 87,
        policy_violations: 3,
        security_incidents: 1,
        audit_events_today: 156,
        change_requests_pending: 2,
        data_integrity_score: 95,
        user_access_compliance: 92,
        backup_status: 'healthy',
        last_updated: new Date().toISOString(),
      };

      const mockSecurityEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'rate_limit_exceeded',
          severity: 'medium',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          description: 'Multiple rate limit violations from IP 192.168.1.100',
          status: 'investigating',
        },
        {
          id: '2',
          type: 'suspicious_activity',
          severity: 'high',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          description: 'Potential XSS attempt detected in user input',
          status: 'resolved',
        },
      ];

      const mockPolicyViolations: PolicyViolation[] = [
        {
          id: '1',
          policy: 'Data Access Policy',
          violation_type: 'unauthorized_access',
          user_id: 'user-123',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          severity: 'medium',
          status: 'acknowledged',
        },
        {
          id: '2',
          policy: 'Change Management Policy',
          violation_type: 'unapproved_change',
          user_id: 'user-456',
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          severity: 'high',
          status: 'open',
        },
      ];

      setMetrics(mockMetrics);
      setSecurityEvents(mockSecurityEvents);
      setPolicyViolations(mockPolicyViolations);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-yellow-400';
      case 'low': return 'bg-green-400';
      default: return 'bg-gray-400';
    }
  };

  const complianceData = [
    { name: 'Overall Score', value: metrics.overall_score, color: '#10b981' },
    { name: 'Data Integrity', value: metrics.data_integrity_score, color: '#3b82f6' },
    { name: 'User Access', value: metrics.user_access_compliance, color: '#8b5cf6' },
  ];

  const auditTrendData = [
    { date: '2024-01-01', events: 120, violations: 5 },
    { date: '2024-01-02', events: 135, violations: 3 },
    { date: '2024-01-03', events: 142, violations: 2 },
    { date: '2024-01-04', events: 156, violations: 3 },
    { date: '2024-01-05', events: 148, violations: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-gray-600">Real-time governance metrics and policy monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {new Date(metrics.last_updated).toLocaleTimeString()}
          </Badge>
          <Button onClick={loadComplianceData} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`bg-white rounded-lg border p-6 ${getScoreBgColor(metrics.overall_score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
              <p className={`text-3xl font-bold ${getScoreColor(metrics.overall_score)}`}>
                {metrics.overall_score}%
              </p>
            </div>
            <Shield className={`h-8 w-8 ${getScoreColor(metrics.overall_score)}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Policy Violations</p>
              <p className="text-3xl font-bold text-red-600">{metrics.policy_violations}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Security Incidents</p>
              <p className="text-3xl font-bold text-orange-600">{metrics.security_incidents}</p>
            </div>
            <Eye className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Audit Events Today</p>
              <p className="text-3xl font-bold text-blue-600">{metrics.audit_events_today}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Scores */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Scores</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={complianceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Audit Trend */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Activity Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={auditTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="events" stroke="#3b82f6" name="Audit Events" />
              <Line type="monotone" dataKey="violations" stroke="#ef4444" name="Violations" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Events */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(event.severity)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{event.type}</p>
                  <p className="text-sm text-gray-600">{event.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {event.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {event.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy Violations */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Policy Violations</h3>
          <div className="space-y-3">
            {policyViolations.map((violation) => (
              <div key={violation.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full mt-1 ${getSeverityColor(violation.severity)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{violation.policy}</p>
                  <p className="text-sm text-gray-600">{violation.violation_type}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {violation.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {violation.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      User: {violation.user_id}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Backup Status</p>
              <p className="text-sm text-gray-600 capitalize">{metrics.backup_status}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Pending Changes</p>
              <p className="text-sm text-gray-600">{metrics.change_requests_pending} requests</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Users className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">User Access</p>
              <p className="text-sm text-gray-600">{metrics.user_access_compliance}% compliant</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
