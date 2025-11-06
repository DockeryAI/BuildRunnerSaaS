'use client'

import { useState, useEffect } from 'react'
import { Send, Mail, Users, Calendar, CheckCircle, AlertCircle, Clock, Inbox } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'invitation' | 'reminder' | 'update' | 'cancellation'
}

interface EmailRecipient {
  id: string
  name: string
  email: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sentAt?: Date
}

interface EmailCampaign {
  id: string
  tripId: string
  templateId: string
  recipients: EmailRecipient[]
  scheduledFor?: Date
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  createdAt: Date
}

interface ResendServiceProps {
  tripId?: string
  onEmailSent?: (campaignId: string) => void
  onError?: (error: string) => void
}

export function ResendService({
  tripId = 'trip-1',
  onEmailSent = () => console.log('Email sent'),
  onError = () => console.log('Email error')
}: ResendServiceProps = {}) {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES)
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(DEFAULT_CAMPAIGNS)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [recipients, setRecipients] = useState<EmailRecipient[]>(DEFAULT_RECIPIENTS)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'history'>('send')
  const [error, setError] = useState<string>('')

  const handleSendEmail = async () => {
    if (!selectedTemplate || recipients.length === 0) return

    setIsLoading(true)
    setError('')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newCampaign: EmailCampaign = {
        id: `campaign-${Date.now()}`,
        tripId,
        templateId: selectedTemplate,
        recipients: recipients.map(r => ({ ...r, status: 'sent', sentAt: new Date() })),
        status: 'sent',
        createdAt: new Date()
      }
      
      setCampaigns(prev => [newCampaign, ...prev])
      onEmailSent(newCampaign.id)
      setSelectedTemplate('')
    } catch (error) {
      const errorMessage = 'Failed to send emails. Please try again.'
      setError(errorMessage)
      onError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-primary dark:text-primary" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive dark:text-destructive" />
      case 'pending':
        return <Clock className="w-4 h-4 text-accent dark:text-accent" />
      default:
        return <Clock className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30'
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30'
      case 'pending':
        return 'bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30'
      default:
        return 'bg-muted text-mutedForeground border-border dark:bg-muted dark:text-mutedForeground dark:border-border'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'invitation':
        return 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30'
      case 'reminder':
        return 'bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30'
      case 'update':
        return 'bg-secondary/10 text-secondary border-secondary/20 dark:bg-secondary/20 dark:text-secondary dark:border-secondary/30'
      case 'cancellation':
        return 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30'
      default:
        return 'bg-muted text-mutedForeground border-border dark:bg-muted dark:text-mutedForeground dark:border-border'
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-lg">
          <div className="p-6 border-b border-border dark:border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <Mail className="w-6 h-6 text-primary dark:text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground dark:text-foreground">Email Service</h1>
                <p className="text-mutedForeground dark:text-mutedForeground text-sm">Send trip invitations and updates</p>
              </div>
            </div>

            <div className="flex gap-1 bg-muted dark:bg-muted rounded-lg p-1">
              {[
                { id: 'send', label: 'Send Email', icon: Send },
                { id: 'templates', label: 'Templates', icon: Mail },
                { id: 'history', label: 'History', icon: Clock }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-150 ${
                    activeTab === tab.id
                      ? 'bg-primary text-primaryForeground shadow-sm dark:bg-primary dark:text-primaryForeground'
                      : 'text-mutedForeground hover:text-foreground hover:bg-surface/50 dark:text-mutedForeground dark:hover:text-foreground dark:hover:bg-surface/50'
                  } hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                  aria-label={`Switch to ${tab.label} tab`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 dark:border-destructive/30 p-4 mb-6">
                <p className="text-sm text-destructive dark:text-destructive">{error}</p>
              </div>
            )}

            {activeTab === 'send' && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground mb-4">
                    Select Email Template
                  </label>
                  {templates.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No templates yet</h3>
                      <p className="text-mutedForeground dark:text-mutedForeground text-sm">Create your first email template to get started</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {templates.map(template => (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                            selectedTemplate === template.id
                              ? 'border-primary bg-primary/5 shadow-md dark:border-primary dark:bg-primary/10'
                              : 'border-border bg-surface hover:border-primary/50 hover:shadow-sm hover:-translate-y-0.5 dark:border-border dark:bg-surface dark:hover:border-primary/50'
                          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                          role="button"
                          tabIndex={0}
                          aria-pressed={selectedTemplate === template.id}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setSelectedTemplate(template.id)
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground dark:text-foreground">{template.name}</h3>
                              <p className="text-sm text-mutedForeground dark:text-mutedForeground mt-1">{template.subject}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.type)}`}>
                              {template.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground mb-4">
                    Recipients ({recipients.length})
                  </label>
                  {recipients.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Users className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No recipients</h3>
                      <p className="text-mutedForeground dark:text-mutedForeground text-sm">Add recipients to send emails</p>
                    </div>
                  ) : (
                    <div className="bg-muted dark:bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-3">
                        {recipients.map(recipient => (
                          <div key={recipient.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-primary dark:text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground dark:text-foreground">{recipient.name}</p>
                                <p className="text-xs text-mutedForeground dark:text-mutedForeground">{recipient.email}</p>
                              </div>
                            </div>
                            {getStatusIcon(recipient.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSendEmail}
                  disabled={!selectedTemplate || recipients.length === 0 || isLoading}
                  className="w-full px-6 py-4 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 disabled:bg-muted disabled:text-mutedForeground disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-primary dark:text-primaryForeground dark:hover:bg-primary/90 dark:disabled:bg-muted dark:disabled:text-mutedForeground"
                  aria-label="Send email to all recipients"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primaryForeground/30 border-t-primaryForeground rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-4">
                {templates.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No templates yet</h3>
                    <p className="text-mutedForeground dark:text-mutedForeground text-sm">Create your first email template to get started</p>
                  </div>
                ) : (
                  templates.map(template => (
                    <div key={template.id} className="bg-surface dark:bg-surface rounded-lg p-6 border border-border dark:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-foreground dark:text-foreground text-lg">{template.name}</h3>
                          <p className="text-sm text-mutedForeground dark:text-mutedForeground mt-1">{template.subject}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.type)}`}>
                          {template.type}
                        </span>
                      </div>
                      <div className="bg-muted dark:bg-muted rounded-md p-4">
                        <p className="text-sm text-foreground dark:text-foreground leading-relaxed">{template.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Inbox className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No campaigns yet</h3>
                    <p className="text-mutedForeground dark:text-mutedForeground text-sm">Your email campaign history will appear here</p>
                  </div>
                ) : (
                  campaigns.map(campaign => (
                    <div key={campaign.id} className="bg-surface dark:bg-surface rounded-lg p-6 border border-border dark:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-foreground dark:text-foreground text-lg">
                            {templates.find(t => t.id === campaign.templateId)?.name || 'Unknown Template'}
                          </h3>
                          <p className="text-sm text-mutedForeground dark:text-mutedForeground mt-1">
                            Sent {campaign.createdAt.toLocaleDateString()} at {campaign.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-mutedForeground dark:text-mutedForeground">
                        <span>{campaign.recipients.length} recipients</span>
                        <span>•</span>
                        <span>{campaign.recipients.filter(r => r.status === 'sent').length} delivered</span>
                        <span>•</span>
                        <span>{campaign.recipients.filter(r => r.status === 'failed').length} failed</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'template-1',
    name: 'Trip Invitation',
    subject: 'You\'re Invited: Moab Off-Road Adventure',
    content: 'Join us for an epic off-road adventure in Moab! We\'ll be exploring the famous trails and camping under the stars. Please RSVP by clicking the link below.',
    type: 'invitation'
  },
  {
    id: 'template-2',
    name: 'Trip Reminder',
    subject: 'Reminder: Moab Trip This Weekend',
    content: 'Don\'t forget about our upcoming Moab trip this weekend! Make sure to pack your gear and check the weather forecast.',
    type: 'reminder'
  },
  {
    id: 'template-3',
    name: 'Trip Update',
    subject: 'Update: Moab Trip Details',
    content: 'We\'ve updated the trip details including meeting location and time. Please review the latest information in your trip dashboard.',
    type: 'update'
  }
]

const DEFAULT_RECIPIENTS: EmailRecipient[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', status: 'pending' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', status: 'sent', sentAt: new Date() },
  { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com', status: 'delivered', sentAt: new Date() },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', status: 'pending' }
]

const DEFAULT_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'campaign-1',
    tripId: 'trip-1',
    templateId: 'template-1',
    recipients: DEFAULT_RECIPIENTS.slice(0, 2),
    status: 'sent',
    createdAt: new Date(Date.now() - 86400000)
  }
]

export default function ResendServiceDemo() {
  return <ResendService />
}