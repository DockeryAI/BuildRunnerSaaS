'use client'

import { useState, useEffect } from 'react'
import { Database, Server, Key, Shield, CheckCircle, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react'

interface SupabaseConfigProps {
  onConfigSave?: (config: SupabaseConfig) => void;
  initialConfig?: Partial<SupabaseConfig>;
  readOnly?: boolean;
}

interface SupabaseConfig {
  projectUrl: string;
  anonKey: string;
  serviceRoleKey: string;
  databasePassword: string;
  region: string;
  environment: 'development' | 'staging' | 'production';
}

interface ConfigField {
  key: keyof SupabaseConfig;
  label: string;
  placeholder: string;
  type: 'text' | 'password' | 'select';
  icon: React.ComponentType<{ className?: string }>;
  required: boolean;
  options?: { value: string; label: string }[];
}

const CONFIG_FIELDS: ConfigField[] = [
  {
    key: 'projectUrl',
    label: 'Project URL',
    placeholder: 'https://your-project.supabase.co',
    type: 'text',
    icon: Server,
    required: true
  },
  {
    key: 'anonKey',
    label: 'Anon Public Key',
    placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'password',
    icon: Key,
    required: true
  },
  {
    key: 'serviceRoleKey',
    label: 'Service Role Key',
    placeholder: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: 'password',
    icon: Shield,
    required: false
  },
  {
    key: 'databasePassword',
    label: 'Database Password',
    placeholder: 'Enter database password',
    type: 'password',
    icon: Database,
    required: true
  },
  {
    key: 'region',
    label: 'Region',
    placeholder: 'Select region',
    type: 'select',
    icon: Server,
    required: true,
    options: [
      { value: 'us-east-1', label: 'US East (N. Virginia)' },
      { value: 'us-west-1', label: 'US West (N. California)' },
      { value: 'eu-west-1', label: 'Europe (Ireland)' },
      { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' }
    ]
  },
  {
    key: 'environment',
    label: 'Environment',
    placeholder: 'Select environment',
    type: 'select',
    icon: Shield,
    required: true,
    options: [
      { value: 'development', label: 'Development' },
      { value: 'staging', label: 'Staging' },
      { value: 'production', label: 'Production' }
    ]
  }
];

const DEFAULT_CONFIG: SupabaseConfig = {
  projectUrl: '',
  anonKey: '',
  serviceRoleKey: '',
  databasePassword: '',
  region: 'us-east-1',
  environment: 'development'
};

export function SupabaseConfig({
  onConfigSave = () => console.log('Config saved'),
  initialConfig = {},
  readOnly = false
}: SupabaseConfigProps = {}) {
  const [config, setConfig] = useState<SupabaseConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig
  });
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<Record<keyof SupabaseConfig, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const toggleFieldVisibility = (fieldKey: string) => {
    const newVisible = new Set(visibleFields);
    if (newVisible.has(fieldKey)) {
      newVisible.delete(fieldKey);
    } else {
      newVisible.add(fieldKey);
    }
    setVisibleFields(newVisible);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const validateConfig = (): boolean => {
    const newErrors: Partial<Record<keyof SupabaseConfig, string>> = {};

    if (!config.projectUrl) {
      newErrors.projectUrl = 'Project URL is required';
    } else if (!config.projectUrl.includes('supabase.co')) {
      newErrors.projectUrl = 'Invalid Supabase URL format';
    }

    if (!config.anonKey) {
      newErrors.anonKey = 'Anon key is required';
    }

    if (!config.databasePassword) {
      newErrors.databasePassword = 'Database password is required';
    }

    if (!config.region) {
      newErrors.region = 'Region is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testConnection = async () => {
    if (!validateConfig()) return;

    setConnectionStatus('testing');
    
    // Simulate connection test
    setTimeout(() => {
      const isValid = config.projectUrl.includes('supabase.co') && config.anonKey.length > 50;
      setConnectionStatus(isValid ? 'success' : 'error');
    }, 2000);
  };

  const handleSave = async () => {
    if (!validateConfig()) return;

    setIsSaving(true);
    
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      onConfigSave(config);
      setConnectionStatus('success');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (key: keyof SupabaseConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return 'text-[rgb(34,139,34)]';
      case 'error': return 'text-[rgb(220,38,38)]';
      case 'testing': return 'text-[rgb(245,158,11)]';
      default: return 'text-[rgb(100,116,139)]';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'testing': return Database;
      default: return Database;
    }
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgb(34,139,34)] rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">
              Supabase Configuration
            </h1>
          </div>
          <p className="text-[rgb(100,116,139)]">
            Configure your Supabase connection settings for the off-roading trip planner
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-4 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-5 h-5 ${getStatusColor()}`} />
              <span className={`font-medium ${getStatusColor()}`}>
                {connectionStatus === 'idle' && 'Ready to configure'}
                {connectionStatus === 'testing' && 'Testing connection...'}
                {connectionStatus === 'success' && 'Connection successful'}
                {connectionStatus === 'error' && 'Connection failed'}
              </span>
            </div>
            <button
              onClick={testConnection}
              disabled={connectionStatus === 'testing' || readOnly}
              className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg active:scale-95"
            >
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white border border-[rgb(226,232,240)] rounded-xl shadow-md">
          <div className="p-6 border-b border-[rgb(226,232,240)]">
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">
              Database Configuration
            </h2>
            <p className="text-sm text-[rgb(100,116,139)] mt-1">
              Enter your Supabase project credentials
            </p>
          </div>

          <div className="p-6 space-y-6">
            {CONFIG_FIELDS.map((field) => {
              const Icon = field.icon;
              const isPassword = field.type === 'password';
              const isVisible = visibleFields.has(field.key);
              const hasError = errors[field.key];

              return (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-[rgb(15,23,42)]">
                    {field.label}
                    {field.required && <span className="text-[rgb(220,38,38)] ml-1">*</span>}
                  </label>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Icon className="w-5 h-5 text-[rgb(100,116,139)]" />
                    </div>

                    {field.type === 'select' ? (
                      <select
                        value={config[field.key]}
                        onChange={(e) => updateConfig(field.key, e.target.value)}
                        disabled={readOnly}
                        className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150 ${
                          hasError ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
                        } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="">{field.placeholder}</option>
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={isPassword && !isVisible ? 'password' : 'text'}
                        value={config[field.key]}
                        onChange={(e) => updateConfig(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        disabled={readOnly}
                        className={`w-full pl-12 pr-20 py-3 bg-white border rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150 ${
                          hasError ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
                        } ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                    )}

                    {isPassword && config[field.key] && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleFieldVisibility(field.key)}
                          className="p-1 text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)] transition-colors"
                          aria-label={isVisible ? 'Hide' : 'Show'}
                        >
                          {isVisible ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(config[field.key])}
                          className="p-1 text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)] transition-colors"
                          aria-label="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {hasError && (
                    <p className="text-sm text-[rgb(220,38,38)] flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {hasError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="p-6 border-t border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
              <div className="flex gap-3 sm:justify-end">
                <button
                  onClick={() => setConfig(DEFAULT_CONFIG)}
                  className="flex-1 sm:flex-none px-6 py-3 bg-white text-[rgb(100,116,139)] rounded-lg hover:bg-[rgb(241,245,249)] transition-all duration-150 font-medium text-sm border border-[rgb(226,232,240)] shadow-sm hover:shadow-md active:scale-95"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg active:scale-95"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Environment Info */}
        <div className="mt-6 p-4 bg-[rgb(245,158,11)]/10 border border-[rgb(245,158,11)]/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[rgb(245,158,11)] mt-0.5" />
            <div>
              <h3 className="font-medium text-[rgb(15,23,42)] mb-1">
                Security Notice
              </h3>
              <p className="text-sm text-[rgb(100,116,139)]">
                Your configuration is stored securely and encrypted. Service role keys should only be used in server environments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupabaseConfigDemo() {
  return (
    <SupabaseConfig
      onConfigSave={(config) => console.log('Configuration saved:', config)}
      initialConfig={{
        projectUrl: 'https://example-project.supabase.co',
        environment: 'development'
      }}
    />
  );
}