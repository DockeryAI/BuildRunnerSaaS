'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Key, Users, AlertTriangle, CheckCircle, Settings, Globe } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

interface OrgSettings {
  id: string;
  name: string;
  slug: string;
  ssoRequired: boolean;
  dataResidency: 'us' | 'eu' | 'custom';
  complianceFramework: 'soc2' | 'hipaa' | 'pci' | 'none';
  auditRetentionDays: number;
}

interface IdPConfig {
  id: string;
  name: string;
  type: 'oidc' | 'saml';
  enabled: boolean;
  lastTested?: string;
  testStatus?: 'success' | 'failed' | 'pending';
}

export default function SecuritySettingsPage() {
  const [orgSettings, setOrgSettings] = useState<OrgSettings | null>(null);
  const [idpConfigs, setIdpConfigs] = useState<IdPConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingIdp, setTestingIdp] = useState<string | null>(null);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      setIsLoading(true);
      
      // Load organization settings
      const orgResponse = await fetch('/api/settings/organization');
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setOrgSettings(orgData.organization);
      }

      // Load IdP configurations
      const idpResponse = await fetch('/api/settings/identity-providers');
      if (idpResponse.ok) {
        const idpData = await idpResponse.json();
        setIdpConfigs(idpData.providers || []);
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOrgSettings = async () => {
    if (!orgSettings) return;

    try {
      setIsSaving(true);
      
      const response = await fetch('/api/settings/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orgSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save organization settings');
      }

      alert('Organization settings saved successfully!');
    } catch (error) {
      console.error('Failed to save organization settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestIdP = async (idpId: string) => {
    try {
      setTestingIdp(idpId);
      
      const response = await fetch(`/api/settings/identity-providers/${idpId}/test`, {
        method: 'POST',
      });

      const result = await response.json();
      
      // Update IdP test status
      setIdpConfigs(prev => prev.map(idp => 
        idp.id === idpId 
          ? { 
              ...idp, 
              testStatus: result.success ? 'success' : 'failed',
              lastTested: new Date().toISOString(),
            }
          : idp
      ));

      if (result.success) {
        alert('Identity provider test successful!');
      } else {
        alert(`Identity provider test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to test IdP:', error);
      alert('Failed to test identity provider. Please try again.');
    } finally {
      setTestingIdp(null);
    }
  };

  const getComplianceColor = (framework: string) => {
    switch (framework) {
      case 'soc2':
        return 'bg-blue-100 text-blue-800';
      case 'hipaa':
        return 'bg-green-100 text-green-800';
      case 'pci':
        return 'bg-purple-100 text-purple-800';
      case 'none':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResidencyColor = (residency: string) => {
    switch (residency) {
      case 'us':
        return 'bg-blue-100 text-blue-800';
      case 'eu':
        return 'bg-green-100 text-green-800';
      case 'custom':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Settings className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Security Settings...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h1>
        <p className="text-gray-600">
          Configure SSO, compliance, and security policies for your organization
        </p>
      </div>

      <div className="space-y-8">
        {/* Organization Security Settings */}
        {orgSettings && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Organization Security</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SSO Requirement */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={orgSettings.ssoRequired}
                    onChange={(e) => setOrgSettings(prev => prev ? { ...prev, ssoRequired: e.target.checked } : null)}
                    className="mr-3"
                  />
                  <span className="text-sm font-medium text-gray-700">Require SSO for all users</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  When enabled, users must authenticate through configured identity providers
                </p>
                {orgSettings.ssoRequired && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Password and OTP login will be disabled
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Data Residency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Residency
                </label>
                <select
                  value={orgSettings.dataResidency}
                  onChange={(e) => setOrgSettings(prev => prev ? { ...prev, dataResidency: e.target.value as any } : null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="us">United States</option>
                  <option value="eu">European Union</option>
                  <option value="custom">Custom Region</option>
                </select>
                <Badge className={`mt-2 ${getResidencyColor(orgSettings.dataResidency)}`}>
                  {orgSettings.dataResidency.toUpperCase()}
                </Badge>
              </div>

              {/* Compliance Framework */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compliance Framework
                </label>
                <select
                  value={orgSettings.complianceFramework}
                  onChange={(e) => setOrgSettings(prev => prev ? { ...prev, complianceFramework: e.target.value as any } : null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="soc2">SOC 2</option>
                  <option value="hipaa">HIPAA</option>
                  <option value="pci">PCI DSS</option>
                  <option value="none">None</option>
                </select>
                <Badge className={`mt-2 ${getComplianceColor(orgSettings.complianceFramework)}`}>
                  {orgSettings.complianceFramework.toUpperCase()}
                </Badge>
              </div>

              {/* Audit Retention */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audit Log Retention (Days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="2555"
                  value={orgSettings.auditRetentionDays}
                  onChange={(e) => setOrgSettings(prev => prev ? { ...prev, auditRetentionDays: parseInt(e.target.value) } : null)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 30 days, maximum 7 years (2555 days)
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSaveOrgSettings}
                disabled={isSaving}
                className="px-6 py-2"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        )}

        {/* Identity Providers */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Key className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Identity Providers</h2>
            </div>
            <Button variant="outline" size="sm">
              Add Provider
            </Button>
          </div>

          {idpConfigs.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Identity Providers Configured</h3>
              <p className="text-gray-600 mb-4">
                Add OIDC or SAML providers to enable single sign-on for your organization.
              </p>
              <Button>Configure First Provider</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {idpConfigs.map(idp => (
                <div key={idp.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${idp.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Key className={`h-4 w-4 ${idp.enabled ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{idp.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {idp.type.toUpperCase()}
                          </Badge>
                          <Badge className={idp.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {idp.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {idp.lastTested && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          {getTestStatusIcon(idp.testStatus)}
                          <span>
                            Last tested: {new Date(idp.lastTested).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestIdP(idp.id)}
                        disabled={testingIdp === idp.id}
                      >
                        {testingIdp === idp.id ? 'Testing...' : 'Test Connection'}
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Status */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Security Status</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Encryption</span>
              </div>
              <p className="text-sm text-gray-600">Data encrypted at rest and in transit</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Audit Logging</span>
              </div>
              <p className="text-sm text-gray-600">All actions logged and tamper-evident</p>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {orgSettings?.ssoRequired ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-medium text-gray-900">SSO Enforcement</span>
              </div>
              <p className="text-sm text-gray-600">
                {orgSettings?.ssoRequired ? 'SSO required for all users' : 'SSO optional'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
