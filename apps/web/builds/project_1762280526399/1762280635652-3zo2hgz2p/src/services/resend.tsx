'use client'

import { useState, useEffect } from 'react'
import { Send, Mail, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react'

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
  templateId: string
  recipients: EmailRecipient[]
  scheduledAt?: Date
  sentAt?: Date
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  subject: string
  tripName: string
}

interface ResendServiceProps {
  campaigns?: EmailCampaign[]
  templates?: EmailTemplate[]
  onSendEmail?: (campaignId: string, recipients: string[]) => Promise<void>
  onScheduleEmail?: (campaignId: string, scheduledAt: Date) => Promise<void>
  onCreateTemplate?: (template: Omit<EmailTemplate, 'id'>) => Promise<void>
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: '1',
    name: 'Trip Invitation',
    subject: 'You\'re Invited: {{tripName}} Off-Road Adventure',
    content: `Hey {{recipientName}}!

You're invited to join us for an epic off-road adventure: {{tripName}}

📅 Date: {{tripDate}}
📍 Location: {{location}}
🏕️ Duration: {{duration}}

What to expect:
- Challenging trails and scenic views
- Group camping under the stars
- Shared meals and campfire stories
- Task assignments to keep everyone involved

Please RSVP by {{rsvpDeadline}} so we can plan accordingly.

Looking forward to hitting the trails with you!

Best regards,
The Adventure Team`,
    type: 'invitation'
  },
  {
    id: '2',
    name: 'Trip Reminder',
    subject: 'Reminder: {{tripName}} is Coming Up!',
    content: `Hi {{recipientName}},

Just a friendly reminder that {{tripName}} is coming up soon!

📅 Date: {{tripDate}}
📍 Meeting Point: {{meetingPoint}}
⏰ Departure Time: {{departureTime}}

Don't forget to bring:
- Your assigned items: {{assignedTasks}}
- Weather-appropriate gear
- Plenty of water and snacks
- Your sense of adventure!

Weather forecast: {{weatherForecast}}

See you on the trails!`,
    type: 'reminder'
  },
  {
    id: '3',
    name: 'Trip Update',
    subject: 'Important Update: {{tripName}}',
    content: `Hello {{recipientName}},

We have an important update regarding {{tripName}}:

{{updateMessage}}

Updated Details:
📅 Date: {{tripDate}}
📍 Location: {{location}}
⏰ Time: {{departureTime}}

Please review the changes and let us know if you have any questions.

Thanks for your flexibility!`,
    type: 'update'
  }
]

const DEFAULT_CAMPAIGNS: EmailCampaign[] = [
  {
    id: '1',
    templateId: '1',
    subject: 'You\'re Invited: Moab Desert Adventure',
    tripName: 'Moab Desert Adventure',
    status: 'sent',
    sentAt: new Date('2024-01-15T10:00:00Z'),
    recipients: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        status: 'delivered',
        sentAt: new Date('2024-01-15T10:00:00Z')
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@example.com',
        status: 'delivered',
        sentAt: new Date('2024-01-15T10:00:00Z')
      },
      {
        id: '3',
        name: 'Alex Rivera',
        email: 'alex@example.com',
        status: 'failed',
        sentAt: new Date('2024-01-15T10:00:00Z')
      }
    ]
  },
  {
    id: '2',
    templateId: '2',
    subject: 'Reminder: Moab Desert Adventure is Tomorrow!',
    tripName: 'Moab Desert Adventure',
    status: 'scheduled',
    scheduledAt: new Date('2024-01-20T08:00:00Z'),
    recipients: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        status: 'pending'
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@example.com',
        status: 'pending'
      }
    ]
  }
]

export function ResendService({
  campaigns = DEFAULT_CAMPAIGNS,
  templates = DEFAULT_TEMPLATES,
  onSendEmail = async () => console.log('Email sent'),
  onScheduleEmail = async () => console.log('Email scheduled'),
  onCreateTemplate = async () => console.log('Template created')
}: ResendServiceProps = {}) {
  const [selectedTab, setSelectedTab] = useState<'campaigns' | 'templates'>('campaigns')
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null)
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState<Omit<EmailTemplate, 'id'>>({
    name: '',
    subject: '',
    content: '',
    type: 'invitation'
  })

  const getStatusIcon = (status: EmailRecipient['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-[rgb(34,139,34)]" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-[rgb(239,68,68)]" />
      case 'sent':
        return <Send className="w-4 h-4 text-[rgb(245,158,11)]" />
      default:
        return <Clock className="w-4 h-4 text-[rgb(148,163,184)]" />
    }
  }

  const getStatusColor = (status: EmailCampaign['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-[rgb(34,139,34)] text-white'
      case 'sending':
        return 'bg-[rgb(245,158,11)] text-white'
      case 'scheduled':
        return 'bg-[rgb(59,130,246)] text-white'
      case 'failed':
        return 'bg-[rgb(239,68,68)] text-white'
      default:
        return 'bg-[rgb(148,163,184)] text-white'
    }
  }

  const handleSendCampaign = async (campaign: EmailCampaign) => {
    const recipientEmails = campaign.recipients.map(r => r.email)
    await onSendEmail(campaign.id, recipientEmails)
  }

  const handleCreateTemplate = async () => {
    if (newTemplate.name && newTemplate.subject && newTemplate.content) {
      await onCreateTemplate(newTemplate)
      setNewTemplate({ name: '', subject: '', content: '', type: 'invitation' })
      setIsCreatingTemplate(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-[rgb(255,255,255)] font-medium">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">Email Service</h1>
        <p className="text-[rgb(100,116,139)]">Manage trip invitations, reminders, and updates</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[rgb(226,232,240)] mb-6">
        <button
          onClick={() => setSelectedTab('campaigns')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'campaigns'
              ? 'border-[rgb(34,139,34)] text-[rgb(34,139,34)]'
              : 'border-transparent text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
          }`}
          aria-label="View email campaigns"
        >
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Campaigns
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('templates')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedTab === 'templates'
              ? 'border-[rgb(34,139,34)] text-[rgb(34,139,34)]'
              : 'border-transparent text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
          }`}
          aria-label="View email templates"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Templates
          </div>
        </button>
      </div>

      {selectedTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Email Campaigns</h2>
          </div>

          <div className="grid gap-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCampaign(selectedCampaign?.id === campaign.id ? null : campaign)}
                role="button"
                tabIndex={0}
                aria-label={`View campaign details for ${campaign.subject}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedCampaign(selectedCampaign?.id === campaign.id ? null : campaign)
                  }
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[rgb(15,23,42)]">{campaign.subject}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-[rgb(100,116,139)]">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {campaign.recipients.length} recipients
                  </div>
                  {campaign.sentAt && (
                    <div>Sent: {campaign.sentAt.toLocaleDateString()}</div>
                  )}
                  {campaign.scheduledAt && (
                    <div>Scheduled: {campaign.scheduledAt.toLocaleDateString()}</div>
                  )}
                </div>

                {selectedCampaign?.id === campaign.id && (
                  <div className="mt-4 pt-4 border-t border-[rgb(226,232,240)]">
                    <h4 className="font-medium text-[rgb(15,23,42)] mb-3">Recipients</h4>
                    <div className="space-y-2">
                      {campaign.recipients.map((recipient) => (
                        <div key={recipient.id} className="flex items-center justify-between p-2 bg-white rounded border border-[rgb(226,232,240)]">
                          <div>
                            <div className="font-medium text-[rgb(15,23,42)]">{recipient.name}</div>
                            <div className="text-sm text-[rgb(100,116,139)]">{recipient.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(recipient.status)}
                            <span className="text-sm text-[rgb(100,116,139)] capitalize">
                              {recipient.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {campaign.status === 'draft' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSendCampaign(campaign)
                        }}
                        className="mt-4 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(22,101,22)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
                        aria-label="Send email campaign"
                      >
                        Send Campaign
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Email Templates</h2>
            <button
              onClick={() => setIsCreatingTemplate(true)}
              className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(22,101,22)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
              aria-label="Create new email template"
            >
              Create Template
            </button>
          </div>

          {isCreatingTemplate && (
            <div className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Create New Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                    placeholder="Enter template name"
                    aria-label="Template name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                    placeholder="Enter email subject"
                    aria-label="Email subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                    Template Type
                  </label>
                  <select
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as EmailTemplate['type'] })}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                    aria-label="Template type"
                  >
                    <option value="invitation">Invitation</option>
                    <option value="reminder">Reminder</option>
                    <option value="update">Update</option>
                    <option value="cancellation">Cancellation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                    Email Content
                  </label>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    rows={8}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                    placeholder="Enter email content with variables like {{recipientName}}, {{tripName}}, etc."
                    aria-label="Email content"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateTemplate}
                    className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(22,101,22)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
                    aria-label="Save template"
                  >
                    Save Template
                  </button>
                  <button
                    onClick={() => setIsCreatingTemplate(false)}
                    className="px-4 py-2 border border-[rgb(226,232,240)] text-[rgb(100,116,139)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(148,163,184)] focus:ring-offset-2"
                    aria-label="Cancel template creation"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[rgb(15,23,42)]">{template.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-[rgb(245,158,11)] text-white">
                    {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-[rgb(100,116,139)] mb-2">
                  Subject: {template.subject}
                </div>
                <div className="text-sm text-[rgb(100,116,139)] line-clamp-3">
                  {template.content.substring(0, 200)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResendServiceDemo() {
  return <ResendService />
}