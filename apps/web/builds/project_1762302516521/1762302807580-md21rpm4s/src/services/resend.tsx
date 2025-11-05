'use client'

import { useState, useEffect } from 'react'
import { Send, Mail, Users, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'invitation' | 'reminder' | 'update' | 'notification'
}

interface EmailRecipient {
  id: string
  name: string
  email: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
}

interface EmailCampaign {
  id: string
  templateId: string
  recipients: EmailRecipient[]
  scheduledAt?: Date
  sentAt?: Date
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  subject: string
  stats: {
    total: number
    sent: number
    delivered: number
    failed: number
  }
}

interface ResendServiceProps {
  apiKey?: string
  onEmailSent?: (campaign: EmailCampaign) => void
  onError?: (error: string) => void
}

export function ResendService({
  apiKey = 'demo-api-key',
  onEmailSent = () => console.log('Email sent'),
  onError = () => console.log('Error occurred')
}: ResendServiceProps = {}) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES)
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(DEFAULT_CAMPAIGNS)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [recipients, setRecipients] = useState<EmailRecipient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'compose'>('templates')

  const handleSendEmail = async (templateId: string, recipientList: EmailRecipient[]) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const template = templates.find(t => t.id === templateId)
      if (!template) throw new Error('Template not found')

      const newCampaign: EmailCampaign = {
        id: `campaign-${Date.now()}`,
        templateId,
        recipients: recipientList.map(r => ({ ...r, status: 'sent' })),
        sentAt: new Date(),
        status: 'sent',
        subject: template.subject,
        stats: {
          total: recipientList.length,
          sent: recipientList.length,
          delivered: recipientList.length,
          failed: 0
        }
      }

      setCampaigns(prev => [newCampaign, ...prev])
      onEmailSent(newCampaign)
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to send email')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-[rgb(34,139,34)]" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-[rgb(220,38,38)]" />
      case 'pending':
        return <Clock className="w-4 h-4 text-[rgb(249,115,22)]" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] border-[rgb(34,139,34)]/20'
      case 'failed':
        return 'bg-[rgb(220,38,38)]/10 text-[rgb(220,38,38)] border-[rgb(220,38,38)]/20'
      case 'pending':
        return 'bg-[rgb(249,115,22)]/10 text-[rgb(249,115,22)] border-[rgb(249,115,22)]/20'
      default:
        return 'bg-[rgb(248, 250, 252)] text-gray-600 border-[rgb(226, 232, 240)]'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-[rgb(255,255,255)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Email Service</h1>
              <p className="text-sm text-gray-600">Manage trip invitations and notifications</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-[rgb(248,250,252)] p-1 rounded-lg">
          {[
            { id: 'templates', label: 'Templates', icon: Mail },
            { id: 'campaigns', label: 'Campaigns', icon: Send },
            { id: 'compose', label: 'Compose', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-[rgb(255,255,255)] text-[rgb(34,139,34)] shadow-sm'
                  : 'text-gray-600 hover:text-[rgb(15,23,42)]'
              }`}
              aria-label={`Switch to ${label} tab`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Email Templates</h2>
              <span className="text-sm text-gray-500">{templates.length} templates</span>
            </div>
            
            <div className="grid gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 hover:border-[rgb(34,139,34)]/30 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      template.type === 'invitation' ? 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] border-[rgb(34,139,34)]/20' :
                      template.type === 'reminder' ? 'bg-[rgb(249,115,22)]/10 text-[rgb(249,115,22)] border-[rgb(249,115,22)]/20' :
                      'bg-[rgb(248, 250, 252)] text-gray-600 border-[rgb(226, 232, 240)]'
                    }`}>
                      {template.type}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.content}</p>
                  
                  <button
                    onClick={() => {
                      setSelectedTemplate(template)
                      setActiveTab('compose')
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200 text-sm font-medium"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Email Campaigns</h2>
              <span className="text-sm text-gray-500">{campaigns.length} campaigns</span>
            </div>
            
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{campaign.subject}</h3>
                      <p className="text-sm text-gray-600">
                        {campaign.sentAt ? `Sent ${campaign.sentAt.toLocaleDateString()}` : 'Draft'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[rgb(15,23,42)]">{campaign.stats.total}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[rgb(34,139,34)]">{campaign.stats.sent}</div>
                      <div className="text-xs text-gray-500">Sent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[rgb(34,139,34)]">{campaign.stats.delivered}</div>
                      <div className="text-xs text-gray-500">Delivered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[rgb(220,38,38)]">{campaign.stats.failed}</div>
                      <div className="text-xs text-gray-500">Failed</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {campaign.recipients.slice(0, 3).map((recipient) => (
                      <div key={recipient.id} className="flex items-center gap-1 text-xs text-gray-600">
                        {getStatusIcon(recipient.status)}
                        {recipient.name}
                      </div>
                    ))}
                    {campaign.recipients.length > 3 && (
                      <span className="text-xs text-gray-500">+{campaign.recipients.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compose Tab */}
        {activeTab === 'compose' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Compose Email</h2>
            
            {selectedTemplate && (
              <div className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[rgb(15,23,42)]">Using Template: {selectedTemplate.name}</span>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-xs text-gray-500 hover:text-[rgb(15,23,42)]"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-sm text-gray-600">{selectedTemplate.subject}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">Recipients</label>
                <div className="grid gap-2">
                  {DEFAULT_RECIPIENTS.map((recipient) => (
                    <label key={recipient.id} className="flex items-center gap-3 p-3 border border-[rgb(226,232,240)] rounded-lg hover:border-[rgb(34,139,34)]/30 transition-colors duration-200">
                      <input
                        type="checkbox"
                        checked={recipients.some(r => r.id === recipient.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRecipients(prev => [...prev, recipient])
                          } else {
                            setRecipients(prev => prev.filter(r => r.id !== recipient.id))
                          }
                        }}
                        className="w-4 h-4 text-[rgb(34,139,34)] border-[rgb(226,232,240)] rounded focus:ring-[rgb(34,139,34)] focus:ring-2"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-[rgb(15,23,42)]">{recipient.name}</div>
                        <div className="text-sm text-gray-600">{recipient.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => selectedTemplate && handleSendEmail(selectedTemplate.id, recipients)}
                disabled={!selectedTemplate || recipients.length === 0 || isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'template-1',
    name: 'Trip Invitation',
    subject: 'You\'re Invited: Off-Road Adventure at Moab',
    content: 'Join us for an epic off-roading adventure! We\'ll be exploring the trails around Moab with camping, great food, and amazing company.',
    type: 'invitation'
  },
  {
    id: 'template-2',
    name: 'Trip Reminder',
    subject: 'Reminder: Moab Trip This Weekend',
    content: 'Don\'t forget about our upcoming off-road trip! Make sure to pack your gear and check the weather forecast.',
    type: 'reminder'
  },
  {
    id: 'template-3',
    name: 'Weather Update',
    subject: 'Weather Update for Moab Trip',
    content: 'Latest weather forecast for our trip location. Please review and pack accordingly.',
    type: 'update'
  },
  {
    id: 'template-4',
    name: 'Task Assignment',
    subject: 'Your Tasks for the Moab Trip',
    content: 'Here are your assigned tasks for the upcoming trip. Thanks for helping make this adventure awesome!',
    type: 'notification'
  }
]

const DEFAULT_RECIPIENTS: EmailRecipient[] = [
  { id: 'user-1', name: 'Alex Johnson', email: 'alex@example.com', status: 'pending' },
  { id: 'user-2', name: 'Sarah Chen', email: 'sarah@example.com', status: 'pending' },
  { id: 'user-3', name: 'Mike Rodriguez', email: 'mike@example.com', status: 'pending' },
  { id: 'user-4', name: 'Emily Davis', email: 'emily@example.com', status: 'pending' },
  { id: 'user-5', name: 'Chris Wilson', email: 'chris@example.com', status: 'pending' }
]

const DEFAULT_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'campaign-1',
    templateId: 'template-1',
    recipients: DEFAULT_RECIPIENTS.slice(0, 3).map(r => ({ ...r, status: 'delivered' as const })),
    sentAt: new Date(Date.now() - 86400000),
    status: 'sent',
    subject: 'You\'re Invited: Off-Road Adventure at Moab',
    stats: { total: 3, sent: 3, delivered: 3, failed: 0 }
  },
  {
    id: 'campaign-2',
    templateId: 'template-2',
    recipients: DEFAULT_RECIPIENTS.slice(0, 5).map(r => ({ ...r, status: 'sent' as const })),
    sentAt: new Date(Date.now() - 3600000),
    status: 'sent',
    subject: 'Reminder: Moab Trip This Weekend',
    stats: { total: 5, sent: 5, delivered: 4, failed: 1 }
  }
]

// Demo component for page.tsx
export default function ResendServiceDemo() {
  return <ResendService />
}