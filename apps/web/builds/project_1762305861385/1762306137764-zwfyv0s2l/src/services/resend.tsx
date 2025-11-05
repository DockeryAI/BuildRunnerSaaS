'use client'

import { useState, useEffect } from 'react'
import { Send, Mail, Users, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
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
}

interface ResendServiceProps {
  templates?: EmailTemplate[]
  campaigns?: EmailCampaign[]
  onSendEmail?: (templateId: string, recipients: string[]) => Promise<void>
  onScheduleEmail?: (templateId: string, recipients: string[], scheduledAt: Date) => Promise<void>
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    name: 'Trip Invitation',
    subject: 'You\'re invited to our off-road adventure!',
    type: 'invitation'
  },
  {
    id: '2',
    name: 'Task Assignment',
    subject: 'Your tasks for the upcoming trip',
    type: 'notification'
  },
  {
    id: '3',
    name: 'Weather Update',
    subject: 'Weather forecast for your trip',
    type: 'update'
  },
  {
    id: '4',
    name: 'Trip Reminder',
    subject: 'Don\'t forget - trip starts tomorrow!',
    type: 'reminder'
  }
]

const DEFAULT_CAMPAIGNS: EmailCampaign[] = [
  {
    id: '1',
    templateId: '1',
    recipients: [
      { id: '1', name: 'John Smith', email: 'john@example.com', status: 'sent' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'delivered' },
      { id: '3', name: 'Mike Wilson', email: 'mike@example.com', status: 'pending' }
    ],
    sentAt: new Date('2024-01-15T10:30:00'),
    status: 'sent'
  },
  {
    id: '2',
    templateId: '2',
    recipients: [
      { id: '4', name: 'Lisa Brown', email: 'lisa@example.com', status: 'scheduled' },
      { id: '5', name: 'Tom Davis', email: 'tom@example.com', status: 'scheduled' }
    ],
    scheduledAt: new Date('2024-01-20T09:00:00'),
    status: 'scheduled'
  }
]

export function ResendService({
  templates = DEFAULT_TEMPLATES,
  campaigns = DEFAULT_CAMPAIGNS,
  onSendEmail = async () => console.log('Email sent'),
  onScheduleEmail = async () => console.log('Email scheduled')
}: ResendServiceProps = {}) {
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'send'>('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [recipients, setRecipients] = useState<string>('')
  const [scheduleDate, setScheduleDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleSendEmail = async () => {
    if (!selectedTemplate || !recipients.trim()) {
      setNotification({ type: 'error', message: 'Please select a template and add recipients' })
      return
    }

    setIsLoading(true)
    try {
      const recipientList = recipients.split(',').map(email => email.trim()).filter(Boolean)
      
      if (scheduleDate) {
        await onScheduleEmail(selectedTemplate, recipientList, new Date(scheduleDate))
        setNotification({ type: 'success', message: 'Email scheduled successfully!' })
      } else {
        await onSendEmail(selectedTemplate, recipientList)
        setNotification({ type: 'success', message: 'Email sent successfully!' })
      }
      
      setRecipients('')
      setScheduleDate('')
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to send email. Please try again.' })
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
      case 'scheduled':
        return <Clock className="w-4 h-4 text-[rgb(245,158,11)]" />
      default:
        return <Clock className="w-4 h-4 text-[rgb(148,163,184)]" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'text-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10'
      case 'failed':
        return 'text-[rgb(220,38,38)] bg-[rgb(220,38,38)]/10'
      case 'scheduled':
        return 'text-[rgb(245,158,11)] bg-[rgb(245,158,11)]/10'
      default:
        return 'text-[rgb(148,163,184)] bg-[rgb(148,163,184)]/10'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">Email Service</h1>
          <p className="text-[rgb(100,116,139)]">Manage email templates and campaigns for your off-road trips</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg border ${
            notification.type === 'success' 
              ? 'bg-[rgb(34,139,34)]/10 border-[rgb(34,139,34)]/20 text-[rgb(34,139,34)]'
              : 'bg-[rgb(220,38,38)]/10 border-[rgb(220,38,38)]/20 text-[rgb(220,38,38)]'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex bg-[rgb(248,250,252)] rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'templates'
                ? 'bg-[rgb(255,255,255)] text-[rgb(15,23,42)] shadow-sm'
                : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
            }`}
            aria-label="View email templates"
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'campaigns'
                ? 'bg-[rgb(255,255,255)] text-[rgb(15,23,42)] shadow-sm'
                : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
            }`}
            aria-label="View email campaigns"
          >
            <Users className="w-4 h-4 inline mr-2" />
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'send'
                ? 'bg-[rgb(255,255,255)] text-[rgb(15,23,42)] shadow-sm'
                : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
            }`}
            aria-label="Send new email"
          >
            <Send className="w-4 h-4 inline mr-2" />
            Send
          </button>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Email Templates</h2>
            <div className="grid gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 hover:border-[rgb(34,139,34)]/30 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{template.name}</h3>
                      <p className="text-[rgb(100,116,139)] text-sm mb-2">{template.subject}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        template.type === 'invitation' ? 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)]' :
                        template.type === 'reminder' ? 'bg-[rgb(245,158,11)]/10 text-[rgb(245,158,11)]' :
                        template.type === 'update' ? 'bg-[rgb(59,130,246)]/10 text-[rgb(59,130,246)]' :
                        'bg-[rgb(148,163,184)]/10 text-[rgb(148,163,184)]'
                      }`}>
                        {template.type}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTemplate(template.id)
                        setActiveTab('send')
                      }}
                      className="px-3 py-1.5 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-md text-sm font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200 active:scale-95"
                      aria-label={`Use ${template.name} template`}
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Email Campaigns</h2>
            <div className="grid gap-4">
              {campaigns.map((campaign) => {
                const template = templates.find(t => t.id === campaign.templateId)
                return (
                  <div
                    key={campaign.id}
                    className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[rgb(15,23,42)]">{template?.name}</h3>
                        <p className="text-[rgb(100,116,139)] text-sm">{template?.subject}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[rgb(100,116,139)]">
                        <Users className="w-4 h-4" />
                        <span>{campaign.recipients.length} recipients</span>
                      </div>
                      
                      {campaign.scheduledAt && (
                        <div className="flex items-center gap-2 text-sm text-[rgb(100,116,139)]">
                          <Calendar className="w-4 h-4" />
                          <span>Scheduled: {campaign.scheduledAt.toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {campaign.sentAt && (
                        <div className="flex items-center gap-2 text-sm text-[rgb(100,116,139)]">
                          <CheckCircle className="w-4 h-4" />
                          <span>Sent: {campaign.sentAt.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-[rgb(226,232,240)]">
                      <div className="flex flex-wrap gap-2">
                        {campaign.recipients.slice(0, 3).map((recipient) => (
                          <div key={recipient.id} className="flex items-center gap-1 text-xs">
                            {getStatusIcon(recipient.status)}
                            <span className="text-[rgb(100,116,139)]">{recipient.name}</span>
                          </div>
                        ))}
                        {campaign.recipients.length > 3 && (
                          <span className="text-xs text-[rgb(100,116,139)]">
                            +{campaign.recipients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Send Tab */}
        {activeTab === 'send' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Send Email</h2>
            
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                {/* Template Selection */}
                <div>
                  <label htmlFor="template-select" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Select Template
                  </label>
                  <select
                    id="template-select"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md text-[rgb(15,23,42)] bg-[rgb(255,255,255)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
                    aria-label="Select email template"
                  >
                    <option value="">Choose a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipients */}
                <div>
                  <label htmlFor="recipients" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Recipients (comma-separated emails)
                  </label>
                  <textarea
                    id="recipients"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder="john@example.com, sarah@example.com, mike@example.com"
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md text-[rgb(15,23,42)] bg-[rgb(255,255,255)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)] resize-none"
                    rows={3}
                    aria-label="Enter recipient email addresses"
                  />
                </div>

                {/* Schedule Date (Optional) */}
                <div>
                  <label htmlFor="schedule-date" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Schedule for later (optional)
                  </label>
                  <input
                    id="schedule-date"
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md text-[rgb(15,23,42)] bg-[rgb(255,255,255)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
                    aria-label="Schedule email for specific date and time"
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendEmail}
                  disabled={isLoading || !selectedTemplate || !recipients.trim()}
                  className="w-full px-4 py-3 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg font-medium hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
                  aria-label={scheduleDate ? 'Schedule email' : 'Send email now'}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {scheduleDate ? 'Scheduling...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {scheduleDate ? 'Schedule Email' : 'Send Now'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResendServiceDemo() {
  return <ResendService />
}