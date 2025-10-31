'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Save, 
  Play, 
  Download, 
  Upload, 
  Settings, 
  Plus,
  Trash2,
  Copy,
  Eye,
  GitBranch,
  Clock,
  DollarSign,
  Shield,
  Users,
  Zap,
  Brain,
  FileText,
  BarChart3,
  Link2,
  AlertTriangle
} from 'lucide-react';

// Mock ReactFlow components for demonstration
const ReactFlow = ({ children, ...props }: any) => (
  <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <GitBranch className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Designer</h3>
      <p className="text-gray-600 mb-4">
        This would integrate ReactFlow for visual workflow design with drag-and-drop nodes and connections.
      </p>
      {children}
    </div>
  </div>
);

const Controls = ({ children }: any) => (
  <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border p-2">
    {children}
  </div>
);

const MiniMap = () => (
  <div className="absolute bottom-4 right-4 w-32 h-24 bg-white rounded border shadow-lg flex items-center justify-center">
    <span className="text-xs text-gray-500">Mini Map</span>
  </div>
);

interface WorkflowNode {
  id: string;
  type: 'agent' | 'approval' | 'condition' | 'parallel';
  agentType?: string;
  name: string;
  config: any;
  position: { x: number; y: number };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

interface WorkflowSpec {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    name: string;
    description: string;
    version: string;
    sla_ms: number;
    budget_usd: number;
  };
}

const agentTypes = [
  { type: 'planner', name: 'Planner', icon: Brain, color: 'bg-blue-100 text-blue-800' },
  { type: 'builder', name: 'Builder', icon: Zap, color: 'bg-green-100 text-green-800' },
  { type: 'qa', name: 'QA', icon: Shield, color: 'bg-red-100 text-red-800' },
  { type: 'docs', name: 'Docs', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  { type: 'governance', name: 'Governance', icon: BarChart3, color: 'bg-orange-100 text-orange-800' },
  { type: 'cost', name: 'Cost', icon: DollarSign, color: 'bg-yellow-100 text-yellow-800' },
  { type: 'integration', name: 'Integration', icon: Link2, color: 'bg-indigo-100 text-indigo-800' },
];

const nodeTypes = [
  { type: 'agent', name: 'Agent Task', icon: Brain, description: 'AI agent execution' },
  { type: 'approval', name: 'Approval Gate', icon: Users, description: 'Human approval required' },
  { type: 'condition', name: 'Condition', icon: GitBranch, description: 'Conditional branching' },
  { type: 'parallel', name: 'Parallel', icon: Copy, description: 'Parallel execution' },
];

export default function WorkflowDesignerPage() {
  const [workflow, setWorkflow] = useState<WorkflowSpec>({
    nodes: [],
    edges: [],
    metadata: {
      name: 'New Workflow',
      description: '',
      version: '1.0.0',
      sla_ms: 900000, // 15 minutes
      budget_usd: 2.0,
    },
  });
  
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: workflow.metadata.name.toLowerCase().replace(/\s+/g, '-'),
          title: workflow.metadata.name,
          description: workflow.metadata.description,
          spec: workflow,
          version: workflow.metadata.version,
        }),
      });
      
      if (response.ok) {
        // Show success message
        console.log('Workflow saved successfully');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    try {
      const response = await fetch('/api/workflows/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow_spec: workflow,
          input_data: {},
        }),
      });
      
      if (response.ok) {
        const { run_id } = await response.json();
        window.open(`/workflows/runs/${run_id}`, '_blank');
      }
    } catch (error) {
      console.error('Error running workflow:', error);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.metadata.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setWorkflow(imported);
        } catch (error) {
          console.error('Error importing workflow:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const addNode = (type: string, agentType?: string) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: type as any,
      agentType,
      name: `${type} ${workflow.nodes.length + 1}`,
      config: {},
      position: { x: 100 + workflow.nodes.length * 50, y: 100 + workflow.nodes.length * 50 },
    };
    
    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
  };

  const deleteNode = (nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      edges: prev.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    }));
    setSelectedNode(null);
  };

  const updateNodeConfig = (nodeId: string, config: any) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, config } : n),
    }));
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Workflow Designer</h1>
            <input
              type="text"
              value={workflow.metadata.name}
              onChange={(e) => setWorkflow(prev => ({
                ...prev,
                metadata: { ...prev.metadata, name: e.target.value }
              }))}
              className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            
            <button
              onClick={handleRun}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>Run</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Node Palette */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Add Nodes</h3>
            
            {/* Node Types */}
            <div className="space-y-2 mb-4">
              {nodeTypes.map((nodeType) => {
                const Icon = nodeType.icon;
                return (
                  <button
                    key={nodeType.type}
                    onClick={() => addNode(nodeType.type)}
                    className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">{nodeType.name}</div>
                      <div className="text-sm text-gray-600">{nodeType.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Agent Types */}
            <h4 className="text-sm font-medium text-gray-900 mb-2">Agent Types</h4>
            <div className="grid grid-cols-2 gap-2">
              {agentTypes.map((agent) => {
                const Icon = agent.icon;
                return (
                  <button
                    key={agent.type}
                    onClick={() => addNode('agent', agent.type)}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 border-transparent hover:border-gray-300 transition-colors ${agent.color}`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">{agent.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Node Properties */}
          {selectedNode && (
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Node Properties</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedNode.name}
                    onChange={(e) => {
                      const updatedNode = { ...selectedNode, name: e.target.value };
                      setSelectedNode(updatedNode);
                      setWorkflow(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n => n.id === selectedNode.id ? updatedNode : n),
                      }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {selectedNode.type === 'agent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Type</label>
                    <select
                      value={selectedNode.agentType || ''}
                      onChange={(e) => {
                        const updatedNode = { ...selectedNode, agentType: e.target.value };
                        setSelectedNode(updatedNode);
                        setWorkflow(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? updatedNode : n),
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select agent type</option>
                      {agentTypes.map(agent => (
                        <option key={agent.type} value={agent.type}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Configuration</label>
                  <textarea
                    value={JSON.stringify(selectedNode.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        updateNodeConfig(selectedNode.id, config);
                        setSelectedNode(prev => prev ? { ...prev, config } : null);
                      } catch (error) {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder='{"key": "value"}'
                  />
                </div>
                
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Node</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative">
          <ReactFlow>
            <Controls>
              <div className="flex space-x-1">
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Plus className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </Controls>
            <MiniMap />
            
            {/* Mock workflow visualization */}
            <div className="absolute inset-4 bg-white rounded-lg border-2 border-gray-200 p-8">
              <div className="grid grid-cols-3 gap-8 h-full">
                {workflow.nodes.slice(0, 6).map((node, index) => {
                  const agentType = agentTypes.find(a => a.type === node.agentType);
                  const Icon = agentType?.icon || Brain;
                  
                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedNode?.id === node.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      <div className={`p-3 rounded-lg mb-2 ${agentType?.color || 'bg-gray-100 text-gray-800'}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium text-center">{node.name}</span>
                      <span className="text-xs text-gray-500 capitalize">{node.type}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </ReactFlow>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflow Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={workflow.metadata.description}
                  onChange={(e) => setWorkflow(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, description: e.target.value }
                  }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                <input
                  type="text"
                  value={workflow.metadata.version}
                  onChange={(e) => setWorkflow(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, version: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SLA (minutes)</label>
                <input
                  type="number"
                  value={workflow.metadata.sla_ms / 60000}
                  onChange={(e) => setWorkflow(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, sla_ms: parseInt(e.target.value) * 60000 }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={workflow.metadata.budget_usd}
                  onChange={(e) => setWorkflow(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, budget_usd: parseFloat(e.target.value) }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
