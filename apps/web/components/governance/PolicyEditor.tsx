'use client';

import React, { useState, useEffect } from 'react';
import {
  Save,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  Edit,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { auditLogger } from '../../lib/audit';

interface PolicyValidationError {
  path: string;
  message: string;
  value?: any;
  allowedValues?: string[];
}

interface PolicyValidationWarning {
  type: string;
  message: string;
  suggestion: string;
}

interface PolicyValidationResult {
  valid: boolean;
  errors: PolicyValidationError[];
  warnings: PolicyValidationWarning[];
  metadata: {
    version?: string;
    project_id?: string;
    updated_at?: string;
    schema_version?: string;
  };
}

export function PolicyEditor() {
  const [policyContent, setPolicyContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PolicyValidationResult | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadPolicy();
  }, []);

  useEffect(() => {
    setHasUnsavedChanges(policyContent !== originalContent);
  }, [policyContent, originalContent]);

  const loadPolicy = async () => {
    try {
      setIsLoading(true);
      
      // In production, this would load from the API
      // For now, load the local policy file content
      const response = await fetch('/governance/policy.yml');
      if (response.ok) {
        const content = await response.text();
        setPolicyContent(content);
        setOriginalContent(content);
      } else {
        // Load default policy if file doesn't exist
        const defaultPolicy = `# BuildRunner Governance Policy
version: "1.0.0"
project_id: "buildrunner-saas"
updated_at: "${new Date().toISOString()}"
updated_by: "user"

protected_paths:
  - "/buildrunner/specs/plan.json"
  - "/buildrunner/state/runner_state.json"
  - "/supabase/migrations/"
  - "/.github/workflows/"
  - "/governance/policy.yml"

approvals:
  required:
    - role: "admin"
      count: 1

pr_requirements:
  microstep_id: true
  microstep_id_pattern: "^p\\\\d+\\\\.s\\\\d+\\\\.ms\\\\d+:"

secret_scan:
  enabled: true
  block_on_detection: true
  deny_patterns:
    - "(?i)api[_-]?key"
    - "AKIA[0-9A-Z]{16}"

risk:
  require_rollback: true
  require_post_check: true`;
        
        setPolicyContent(defaultPolicy);
        setOriginalContent(defaultPolicy);
      }
      
      await auditLogger.logUserAction(
        'current-user',
        'policy_loaded',
        { type: 'governance_policy', id: 'policy.yml', name: 'Governance Policy' },
        { action: 'load' }
      );
    } catch (error) {
      console.error('Failed to load policy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePolicy = async () => {
    try {
      setIsValidating(true);
      
      const response = await fetch('/api/governance/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policy: policyContent,
          format: 'yaml',
        }),
      });

      const result = await response.json();
      setValidationResult(result);
      
      await auditLogger.logUserAction(
        'current-user',
        'policy_validated',
        { type: 'governance_policy', id: 'policy.yml', name: 'Governance Policy' },
        {
          valid: result.valid,
          error_count: result.errors?.length || 0,
          warning_count: result.warnings?.length || 0,
        }
      );

      return result.valid;
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult({
        valid: false,
        errors: [{ path: '', message: 'Validation request failed', value: error }],
        warnings: [],
        metadata: {},
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const savePolicy = async () => {
    try {
      setIsSaving(true);
      
      // Validate before saving
      const isValid = await validatePolicy();
      if (!isValid) {
        alert('Cannot save invalid policy. Please fix validation errors first.');
        return;
      }

      // In production, this would save via API
      console.log('Saving policy:', policyContent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOriginalContent(policyContent);
      setIsEditing(false);
      
      await auditLogger.logUserAction(
        'current-user',
        'policy_saved',
        { type: 'governance_policy', id: 'policy.yml', name: 'Governance Policy' },
        {
          version: validationResult?.metadata?.version,
          content_length: policyContent.length,
        }
      );

      alert('Policy saved successfully!');
    } catch (error) {
      console.error('Failed to save policy:', error);
      alert('Failed to save policy. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (value: string) => {
    setPolicyContent(value);
    // Clear validation result when content changes
    if (validationResult) {
      setValidationResult(null);
    }
  };

  const exportPolicy = () => {
    const blob = new Blob([policyContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'governance-policy.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importPolicy = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPolicyContent(content);
        setIsEditing(true);
      };
      reader.readAsText(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-600">Loading governance policy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Policy Editor</h2>
          <p className="text-gray-600">Edit and validate governance policy configuration</p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Unsaved Changes
            </Badge>
          )}
          {validationResult && (
            <Badge 
              variant="outline" 
              className={validationResult.valid ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}
            >
              {validationResult.valid ? 'Valid' : 'Invalid'}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Policy
          </Button>
        ) : (
          <>
            <Button 
              onClick={savePolicy} 
              disabled={isSaving || !hasUnsavedChanges || (validationResult && !validationResult.valid)}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Policy'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setPolicyContent(originalContent);
                setValidationResult(null);
              }}
            >
              Cancel
            </Button>
          </>
        )}
        
        <Button 
          variant="outline" 
          onClick={validatePolicy} 
          disabled={isValidating}
          className="flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          {isValidating ? 'Validating...' : 'Validate'}
        </Button>
        
        <Button variant="outline" onClick={exportPolicy} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
        
        <label className="cursor-pointer">
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <span>
              <Upload className="h-4 w-4" />
              Import
            </span>
          </Button>
          <input
            type="file"
            accept=".yml,.yaml"
            onChange={importPolicy}
            className="hidden"
          />
        </label>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="space-y-4">
          {validationResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Validation Errors</h3>
              </div>
              <ul className="space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">
                    <strong>{error.path || 'Root'}:</strong> {error.message}
                    {error.allowedValues && (
                      <span className="text-red-600"> (allowed: {error.allowedValues.join(', ')})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Warnings</h3>
              </div>
              <ul className="space-y-2">
                {validationResult.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">
                    <div className="text-yellow-700 font-medium">{warning.message}</div>
                    <div className="text-yellow-600">{warning.suggestion}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.valid && validationResult.errors.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Policy Valid</h3>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Policy configuration is valid and ready to save.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Policy Editor */}
      <div className="border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">governance/policy.yml</span>
          {isEditing ? (
            <Badge variant="outline" className="text-blue-600 border-blue-600">Editing</Badge>
          ) : (
            <Badge variant="outline" className="text-gray-600 border-gray-600">Read Only</Badge>
          )}
        </div>
        
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={policyContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-96 font-mono text-sm border border-gray-300 rounded p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter YAML policy configuration..."
            />
          ) : (
            <pre className="w-full h-96 font-mono text-sm bg-gray-50 border border-gray-200 rounded p-3 overflow-auto">
              {policyContent}
            </pre>
          )}
        </div>
      </div>

      {/* Metadata */}
      {validationResult?.metadata && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Policy Metadata</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {validationResult.metadata.version && (
              <div>
                <span className="text-gray-600">Version:</span>
                <div className="font-medium">{validationResult.metadata.version}</div>
              </div>
            )}
            {validationResult.metadata.project_id && (
              <div>
                <span className="text-gray-600">Project ID:</span>
                <div className="font-medium">{validationResult.metadata.project_id}</div>
              </div>
            )}
            {validationResult.metadata.updated_at && (
              <div>
                <span className="text-gray-600">Updated:</span>
                <div className="font-medium">
                  {new Date(validationResult.metadata.updated_at).toLocaleString()}
                </div>
              </div>
            )}
            {validationResult.metadata.schema_version && (
              <div>
                <span className="text-gray-600">Schema:</span>
                <div className="font-medium">{validationResult.metadata.schema_version}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
