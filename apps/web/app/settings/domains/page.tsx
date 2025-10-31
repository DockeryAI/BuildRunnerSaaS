'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Globe, 
  Check, 
  X, 
  Clock, 
  AlertTriangle, 
  Copy, 
  ExternalLink,
  RefreshCw,
  Trash2,
  Shield,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DomainMapping {
  id: string;
  domain: string;
  subdomain?: string;
  verified: boolean;
  txt_token: string;
  txt_record_name: string;
  tls_status: 'pending' | 'issued' | 'failed' | 'expired' | 'revoked';
  tls_issued_at?: string;
  tls_expires_at?: string;
  last_verification_at?: string;
  verification_attempts: number;
  created_at: string;
}

const tlsStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  issued: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
  revoked: 'bg-gray-100 text-gray-800',
};

const tlsStatusIcons = {
  pending: Clock,
  issued: Shield,
  failed: XCircle,
  expired: AlertTriangle,
  revoked: X,
};

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);

  // Load domains
  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/domains');
      const data = await response.json();
      setDomains(data.domains || []);
    } catch (error) {
      console.error('Error loading domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;

    try {
      setAdding(true);
      
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDomains(prev => [...prev, data.domain]);
        setNewDomain('');
        setShowAddForm(false);
      } else {
        const error = await response.json();
        console.error('Error adding domain:', error.message);
      }
    } catch (error) {
      console.error('Error adding domain:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/domains/${domainId}/verify`, {
        method: 'POST',
      });
      
      if (response.ok) {
        loadDomains(); // Refresh the list
      }
    } catch (error) {
      console.error('Error verifying domain:', error);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setDomains(prev => prev.filter(d => d.id !== domainId));
      }
    } catch (error) {
      console.error('Error deleting domain:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success message
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Globe className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading custom domains...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Domains</h1>
              <p className="text-gray-600 mt-2">Manage custom domains for your tenant</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={loadDomains}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Domain</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Domain Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Domain</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Domain Name</label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter your domain name without protocol (e.g., example.com or app.example.com)
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddDomain}
                  disabled={adding || !newDomain.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>{adding ? 'Adding...' : 'Add Domain'}</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDomain('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Domains List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Domains</h2>
          </div>
          
          {domains.length === 0 ? (
            <div className="p-8 text-center">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No custom domains</h3>
              <p className="text-gray-600 mb-6">
                Add a custom domain to use your own branding and URL.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Domain</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {domains.map((domain) => {
                const TlsIcon = tlsStatusIcons[domain.tls_status];
                
                return (
                  <div key={domain.id} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">{domain.domain}</h3>
                          <p className="text-sm text-gray-600">
                            Added {formatDate(domain.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {/* Verification Status */}
                        <div className="flex items-center space-x-2">
                          {domain.verified ? (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-yellow-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm font-medium">Pending</span>
                            </div>
                          )}
                        </div>
                        
                        {/* TLS Status */}
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${tlsStatusColors[domain.tls_status]}`}>
                          <TlsIcon className="h-3 w-3" />
                          <span className="capitalize">{domain.tls_status}</span>
                        </span>
                        
                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {!domain.verified && (
                            <button
                              onClick={() => handleVerifyDomain(domain.id)}
                              className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                            >
                              <RefreshCw className="h-3 w-3" />
                              <span>Verify</span>
                            </button>
                          )}
                          
                          {domain.verified && (
                            <a
                              href={`https://${domain.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 px-2 py-1 text-sm text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span>Visit</span>
                            </a>
                          )}
                          
                          <button
                            onClick={() => handleDeleteDomain(domain.id)}
                            className="flex items-center space-x-1 px-2 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* DNS Instructions */}
                    {!domain.verified && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-blue-900 mb-2">DNS Configuration Required</h4>
                            <p className="text-sm text-blue-800 mb-3">
                              Add the following TXT record to your DNS settings to verify domain ownership:
                            </p>
                            
                            <div className="bg-white border border-blue-200 rounded p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Type:</span>
                                  <span className="ml-2 text-sm text-gray-900 font-mono">TXT</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard('TXT')}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Name:</span>
                                  <span className="ml-2 text-sm text-gray-900 font-mono">{domain.txt_record_name}</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(domain.txt_record_name)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Value:</span>
                                  <span className="ml-2 text-sm text-gray-900 font-mono break-all">{domain.txt_token}</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(domain.txt_token)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-sm text-blue-800 mt-3">
                              DNS changes can take up to 24 hours to propagate. Click "Verify" to check the status.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* TLS Certificate Info */}
                    {domain.verified && domain.tls_status === 'issued' && domain.tls_expires_at && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-5 w-5 text-green-600" />
                          <div>
                            <h4 className="font-medium text-green-900">SSL Certificate Active</h4>
                            <p className="text-sm text-green-800">
                              Your domain is secured with SSL. Certificate expires on {formatDate(domain.tls_expires_at)}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Error States */}
                    {domain.tls_status === 'failed' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <h4 className="font-medium text-red-900">SSL Certificate Failed</h4>
                            <p className="text-sm text-red-800">
                              Failed to issue SSL certificate. Please check your DNS configuration and try again.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm text-blue-800 mb-4">
            Custom domains allow you to use your own URL for accessing BuildRunner. 
            Here's what you need to know:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Add a TXT record to verify domain ownership</li>
            <li>SSL certificates are automatically provisioned after verification</li>
            <li>DNS changes can take up to 24 hours to propagate</li>
            <li>You can have up to 3 custom domains per tenant</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
