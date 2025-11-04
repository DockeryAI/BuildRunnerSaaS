'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Users, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'invitation' | 'reminder' | 'update' | 'rsvp'
}

interface EmailRecipient {
  id: string
  name: string
  email: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  rsvpStatus?: 'pending' | 'accepted' | 'declined'
}

interface EmailCampaign {
  id: string
  tripId: string
  templateId: string
  subject: string
  recipients: EmailRecipient[]
  scheduledAt?: Date
  sentAt?: Date
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  type: 'invitation' | 'reminder' | 'update' | 'rsvp'
}

interface EmailServiceProps {
  tripId?: string
  onEmailSent?: (campaignId: string) => void
  onRsvpReceived?: (recipientId: string, status: 'accepted' | 'declined') => void
}

export function EmailService({
  tripId = 'trip-1',
  onEmailSent = () => console.log('Email sent'),
  onRsvpReceived = () => console.log('RSVP received')
}: EmailServiceProps = {}) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(DEFAULT_CAMPAIGNS)
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [recipients, setRecipients] = useState<EmailRecipient[]>(DEFAULT_RECIPIENTS)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setSubject(template.subject)
      setContent(template.content)
    }
  }

  const handleSendEmail = async () => {
    if (!subject || !content || recipients.length === 0) return

    setIsSending(true)
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 2000))

    const newCampaign: EmailCampaign = {
      id: `campaign-${Date.now()}`,
      tripId,
      templateId: selectedTemplate,
      subject,
      recipients: recipients.map(r => ({ ...r, status: 'sent' })),
      sentAt: new Date(),
      status: 'sent',
      type: 'invitation'
    }

    setCampaigns(prev => [newCampaign, ...prev])
    setIsSending(false)
    setIsComposing(false)
    setSubject('')
    setContent('')
    setSelectedTemplate('')
    onEmailSent(newCampaign.id)
  }

  const handleRsvpUpdate = (recipientId: string, status: 'accepted' | 'declined') => {
    setCampaigns(prev => prev.map(campaign => ({
      ...campaign,
      recipients: campaign.recipients.map(recipient =>
        recipient.id === recipientId
          ? { ...recipient, rsvpStatus: status }
          : recipient
      )
    })))
    onRsvpReceived(recipientId, status)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-[rgb(34,139,34)]" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-[rgb(239,68,68)]" />
      case 'pending':
        return <Clock className="w-4 h-4 text-[rgb(245,158,11)]" />
      default:
        return <Clock className="w-4 h-4 text-[rgb(148,163,184)]" />
    }
  }

  const getRsvpStatusColor = (status?: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-[rgb(34,139,34)] text-white'
      case 'declined':
        return 'bg-[rgb(239,68,68)] text-white'
      default:
        return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-medium">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgb(34,139,34)] rounded-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Email Service</h1>
            <p className="text-[rgb(100,116,139)]">Manage trip invitations and communications</p>
          </div>
        </div>
        <button
          onClick={() => setIsComposing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(22,101,22)] transition-colors touch-manipulation min-h-[44px]"
          aria-label="Compose new email"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Compose</span>
        </button>
      </div>

      {/* Compose Email Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[rgb(226,232,240)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[rgb(15,23,42)]">Compose Email</h2>
                <button
                  onClick={() => setIsComposing(false)}
                  className="p-2 hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
                  aria-label="Close compose dialog"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Email Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                >
                  <option value="">Select a template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Message
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent resize-none"
                  placeholder="Enter your message"
                />
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Recipients ({recipients.length})
                </label>
                <div className="max-h-32 overflow-y-auto border border-[rgb(226,232,240)] rounded-lg p-2">
                  {recipients.map(recipient => (
                    <div key={recipient.id} className="flex items-center gap-2 p-2 hover:bg-[rgb(248,250,252)] rounded">
                      <Users className="w-4 h-4 text-[rgb(100,116,139)]" />
                      <span className="text-sm">{recipient.name}</span>
                      <span className="text-xs text-[rgb(100,116,139)]">({recipient.email})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsComposing(false)}
                  className="flex-1 px-4 py-2 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={!subject || !content || isSending}
                  className="flex-1 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(22,101,22)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                >
                  {isSending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Campaigns */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)]">
        <div className="p-6 border-b border-[rgb(226,232,240)]">
          <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Recent Campaigns</h2>
        </div>
        <div className="divide-y divide-[rgb(226,232,240)]">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-[rgb(15,23,42)]">{campaign.subject}</h3>
                  <p className="text-sm text-[rgb(100,116,139)]">
                    {campaign.sentAt ? `Sent ${campaign.sentAt.toLocaleDateString()}` : 'Draft'}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  campaign.status === 'sent' ? 'bg-[rgb(34,139,34)] text-white' :
                  campaign.status === 'failed' ? 'bg-[rgb(239,68,68)] text-white' :
                  'bg-[rgb(245,158,11)] text-white'
                }`}>
                  {campaign.status}
                </span>
              </div>

              {/* Recipients Status */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[rgb(15,23,42)]">Recipients</h4>
                <div className="grid gap-2">
                  {campaign.recipients.map(recipient => (
                    <div key={recipient.id} className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(recipient.status)}
                        <div>
                          <p className="text-sm font-medium text-[rgb(15,23,42)]">{recipient.name}</p>
                          <p className="text-xs text-[rgb(100,116,139)]">{recipient.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {recipient.rsvpStatus && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRsvpStatusColor(recipient.rsvpStatus)}`}>
                            {recipient.rsvpStatus}
                          </span>
                        )}
                        {campaign.type === 'invitation' && !recipient.rsvpStatus && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleRsvpUpdate(recipient.id, 'accepted')}
                              className="px-2 py-1 text-xs bg-[rgb(34,139,34)] text-white rounded hover:bg-[rgb(22,101,22)] transition-colors"
                              aria-label={`Mark ${recipient.name} as accepted`}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRsvpUpdate(recipient.id, 'declined')}
                              className="px-2 py-1 text-xs bg-[rgb(239,68,68)] text-white rounded hover:bg-[rgb(220,38,38)] transition-colors"
                              aria-label={`Mark ${recipient.name} as declined`}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)]">
        <div className="p-6 border-b border-[rgb(226,232,240)]">
          <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Email Templates</h2>
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {templates.map(template => (
            <div key={template.id} className="p-4 border border-[rgb(226,232,240)] rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-[rgb(15,23,42)]">{template.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  template.type === 'invitation' ? 'bg-[rgb(34,139,34)] text-white' :
                  template.type === 'reminder' ? 'bg-[rgb(245,158,11)] text-white' :
                  template.type === 'update' ? 'bg-[rgb(59,130,246)] text-white' :
                  'bg-[rgb(168,85,247)] text-white'
                }`}>
                  {template.type}
                </span>
              </div>
              <p className="text-sm text-[rgb(100,116,139)] mb-3">{template.subject}</p>
              <p className="text-xs text-[rgb(148,163,184)] line-clamp-3">{template.content}</p>
            </div>
          ))}
        </div>
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
    content: 'Hey there! You\'re invited to join us for an epic off-roading adventure. We\'ll be exploring the trails around Moab from March 15-17. Please RSVP by March 1st so we can plan accordingly.',
    type: 'invitation'
  },
  {
    id: 'template-2',
    name: 'Trip Reminder',
    subject: 'Reminder: Off-Road Trip This Weekend',
    content: 'Just a friendly reminder that our off-road trip is coming up this weekend! Don\'t forget to pack your gear and check the weather forecast.',
    type: 'reminder'
  },
  {
    id: 'template-3',
    name: 'Trip Update',
    subject: 'Trip Update: Weather and Route Changes',
    content: 'Quick update on our upcoming trip - we\'ve made some route adjustments due to weather conditions. Please check the updated itinerary in the app.',
    type: 'update'
  },
  {
    id: 'template-4',
    name: 'RSVP Request',
    subject: 'Please Confirm Your Attendance',
    content: 'We need to finalize our headcount for the trip. Please confirm your attendance by clicking the RSVP link below.',
    type: 'rsvp'
  }
]

const DEFAULT_RECIPIENTS: EmailRecipient[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    status: 'sent',
    rsvpStatus: 'accepted'
  },
  {
    id: 'user-2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    status: 'sent',
    rsvpStatus: 'pending'
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    status: 'sent',
    rsvpStatus: 'declined'
  },
  {
    id: 'user-4',
    name: 'Emma Davis',
    email: 'emma@example.com',
    status: 'pending'
  }
]

const DEFAULT_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'campaign-1',
    tripId: 'trip-1',
    templateId: 'template-1',
    subject: 'You\'re Invited: Off-Road Adventure at Moab',
    recipients: DEFAULT_RECIPIENTS,
    sentAt: new Date('2024-01-15'),
    status: 'sent',
    type: 'invitation'
  },
  {
    id: 'campaign-2',
    tripId: 'trip-1',
    templateId: 'template-2',
    subject: 'Reminder: Off-Road Trip This Weekend',
    recipients: DEFAULT_RECIPIENTS.slice(0, 2),
    sentAt: new Date('2024-01-20'),
    status: 'sent',
    type: 'reminder'
  }
]

export default function EmailServiceDemo() {
  return <EmailService />
}