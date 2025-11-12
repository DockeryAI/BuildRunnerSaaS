'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Award,
  Briefcase,
  GraduationCap,
  Loader2,
  X,
  Eye,
  Download,
  Clock,
  PlusCircle,
  Info
} from 'lucide-react'

interface Credential {
  id: string
  name: string
  type: 'license' | 'certification' | 'degree' | 'insurance' | '' // Added empty string for initial state
  file: File | null
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  uploadedAt: Date
  verifiedAt?: Date
  expiresAt?: Date
  issuer: string
  credentialNumber?: string
  rejectionReason?: string
  fileUrl?: string // For preview/download
}

interface CredentialUploadProps {
  onUploadComplete?: (credentials: Credential[]) => void
  maxFileSize?: number // in MB
  acceptedFormats?: string[]
  existingCredentials?: Credential[]
}

const CREDENTIAL_TYPES = [
  { value: '', label: 'Select Type', icon: Info }, // Added default empty option
  { value: 'license', label: 'Professional License', icon: Award },
  { value: 'certification', label: 'Certification', icon: Shield },
  { value: 'degree', label: 'Degree/Diploma', icon: GraduationCap },
  { value: 'insurance', label: 'Insurance', icon: Briefcase }
] as const

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 }, // Spacing 16
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
  }
}

export function CredentialUpload({
  onUploadComplete = () => { },
  maxFileSize = 10,
  acceptedFormats = ['.pdf', '.jpg', '.jpeg', '.png'],
  existingCredentials = []
}: CredentialUploadProps = {}) {
  const [credentials, setCredentials] = useState<Credential[]>(existingCredentials)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [dragActive, setDragActive] = useState(false)
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Clear error after some time
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    setError(null) // Clear previous errors
    files.forEach(file => {
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`)
        return
      }

      // Validate file format
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`
      if (!acceptedFormats.includes(fileExtension)) {
        setError(`File ${file.name} has an unsupported format. Accepted formats: ${acceptedFormats.join(', ')}.`)
        return
      }

      // Create new credential
      const newCredential: Credential = {
        id: `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: '', // Default to empty, user must select
        file: file,
        status: 'pending',
        uploadedAt: new Date(),
        issuer: '',
        fileUrl: URL.createObjectURL(file) // Create object URL for preview
      }

      setCredentials(prev => [...prev, newCredential])
      simulateUpload(newCredential.id)
    })
  }, [maxFileSize, acceptedFormats])

  const simulateUpload = (credentialId: string) => {
    setUploadingFiles(prev => new Set(prev).add(credentialId))

    // Simulate upload and verification process
    setTimeout(() => {
      setUploadingFiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(credentialId)
        return newSet
      })

      // Randomly assign verification status for demo
      const statuses: Credential['status'][] = ['verified', 'verified', 'verified', 'rejected', 'pending']
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      setCredentials(prev => prev.map(cred =>
        cred.id === credentialId
          ? {
            ...cred,
            status: randomStatus,
            verifiedAt: randomStatus === 'verified' ? new Date() : undefined,
            rejectionReason: randomStatus === 'rejected' ? 'Document quality too low for verification' : undefined
          }
          : cred
      ))
    }, 2000)
  }

  const updateCredential = (id: string, updates: Partial<Credential>) => {
    setCredentials(prev => prev.map(cred =>
      cred.id === id ? { ...cred, ...updates } : cred
    ))
  }

  const removeCredential = (id: string) => {
    setCredentials(prev => {
      const credentialToRemove = prev.find(cred => cred.id === id);
      if (credentialToRemove?.fileUrl) {
        URL.revokeObjectURL(credentialToRemove.fileUrl); // Clean up object URL
      }
      return prev.filter(cred => cred.id !== id)
    })
  }

  const getStatusIcon = (status: Credential['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-[#3B82F6]" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive dark:text-destructive" />
      case 'expired':
        return <Clock className="w-4 h-4 text-accent dark:text-accent" />
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
    }
  }

  const getStatusBadgeClass = (status: Credential['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 dark:bg-[#3B82F6]/20 dark:text-[#3B82F6] dark:border-[#3B82F6]/30'
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30'
      case 'expired':
        return 'bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30'
      default:
        return 'bg-surface/10 text-muted-foreground border-border/20 dark:bg-surface/20 dark:text-muted-foreground dark:border-border/30'
    }
  }

  const handleDownload = (credential: Credential) => {
    if (credential.fileUrl) {
      const link = document.createElement('a');
      link.href = credential.fileUrl;
      link.download = credential.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (credential.file) {
      // Fallback for files not having a fileUrl (e.g., existing credentials without a direct URL)
      const url = URL.createObjectURL(credential.file);
      const link = document.createElement('a');
      link.href = url;
      link.download = credential.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} // Spacing 24
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-[#FFFFFF] dark:bg-surface rounded-xl border border-[#E5E7EB] dark:border-border shadow-sm p-24"> {/* Spacing 24 */}
        <div className="mb-24"> {/* Spacing 24 */}
          <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground mb-8">Professional Credentials</h2> {/* Spacing 8 */}
          <p className="text-muted-foreground dark:text-muted-foreground">
            Upload your professional credentials to unlock better rates and build trust with clients.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-16 mb-24" // Spacing 16, 24
          >
            <p className="text-sm text-destructive dark:text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Upload Area */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`
            relative border-2 border-dashed rounded-lg p-32 text-center cursor-pointer
            transition-all duration-200
            ${dragActive
              ? 'border-[#3B82F6] bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10'
              : 'border-[#E5E7EB] dark:border-border hover:border-[#3B82F6]/50 hover:bg-surface dark:hover:bg-surface/50'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedFormats.join(',')}
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
            className="hidden"
            aria-label="Upload credential files"
          />

          <motion.div
            animate={{ scale: dragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="w-48 h-48 text-muted-foreground dark:text-muted-foreground mx-auto mb-16" /> {/* Spacing 48, 16 */}
          </motion.div>

          <p className="text-muted-foreground dark:text-foreground font-medium mb-8"> {/* Spacing 8 */}
            Drop your credentials here or click to browse
          </p>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            Accepted formats: {acceptedFormats.join(', ')} • Max size: {maxFileSize}MB
          </p>
        </motion.div>

        {/* Credentials List */}
        <AnimatePresence mode="wait">
          {credentials.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="mt-24 space-y-16" // Spacing 24, 16
            >
              <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-16">Uploaded Credentials</h3> {/* Spacing 16 */}

              {credentials.map((credential) => (
                <motion.div
                  key={credential.id}
                  variants={itemVariants}
                  layout
                  className="bg-[#FFFFFF] dark:bg-surface rounded-lg border border-[#E5E7EB] dark:border-border p-16 hover:border-[#3B82F6]/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-md" // Spacing 16
                >
                  <div className="flex items-start gap-16"> {/* Spacing 16 */}
                    <div className="flex-shrink-0">
                      <motion.div
                        whileHover={{ rotate: 5 }}
                        className="w-48 h-48 bg-surface dark:bg-surface rounded-lg flex items-center justify-center" // Spacing 48
                      >
                        <FileText className="w-24 h-24 text-muted-foreground dark:text-muted-foreground" /> {/* Spacing 24 */}
                      </motion.div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-8"> {/* Spacing 8 */}
                        <div className="flex-1">
                          <h4 className="text-muted-foreground dark:text-foreground font-medium truncate">
                            {credential.name}
                          </h4>

                          <div className="mt-8 flex flex-wrap gap-8"> {/* Spacing 8 */}
                            {/* Credential Type Selector */}
                            <select
                              value={credential.type}
                              onChange={(e) => updateCredential(credential.id, {
                                type: e.target.value as Credential['type']
                              })}
                              className="text-sm bg-[#FFFFFF] dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-md px-12 py-8 text-muted-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200" // Spacing 12, 8
                              disabled={uploadingFiles.has(credential.id)}
                            >
                              {CREDENTIAL_TYPES.map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>

                            {/* Status Badge */}
                            <div className={`
                              inline-flex items-center gap-8 px-12 py-8 rounded-full text-xs font-medium border
                              ${getStatusBadgeClass(credential.status)}
                            `}> {/* Spacing 8, 12, 8 */}
                              {uploadingFiles.has(credential.id) ? (
                                <>
                                  <Loader2 className="w-12 h-12 animate-spin" /> {/* Spacing 12 */}
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  {getStatusIcon(credential.status)}
                                  <span className="capitalize">{credential.status}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Additional Fields */}
                          {credential.status !== 'pending' && !uploadingFiles.has(credential.id) && (
                            <div className="mt-16 space-y-8"> {/* Spacing 16, 8 */}
                              <input
                                type="text"
                                placeholder="Issuing organization"
                                value={credential.issuer}
                                onChange={(e) => updateCredential(credential.id, { issuer: e.target.value })}
                                className="w-full text-sm bg-[#FFFFFF] dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-md px-12 py-8 text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200" // Spacing 12, 8
                              />

                              <input
                                type="text"
                                placeholder="Credential number (optional)"
                                value={credential.credentialNumber || ''}
                                onChange={(e) => updateCredential(credential.id, { credentialNumber: e.target.value })}
                                className="w-full text-sm bg-[#FFFFFF] dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-md px-12 py-8 text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200" // Spacing 12, 8
                              />
                            </div>
                          )}

                          {/* Rejection Reason */}
                          {credential.status === 'rejected' && credential.rejectionReason && (
                            <p className="mt-8 text-sm text-destructive dark:text-destructive"> {/* Spacing 8 */}
                              {credential.rejectionReason}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-8"> {/* Spacing 8 */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedCredential(credential)}
                            className="p-8 text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-foreground hover:bg-surface dark:hover:bg-surface rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50" // Spacing 8
                            aria-label="View credential"
                          >
                            <Eye className="w-16 h-16" /> {/* Spacing 16 */}
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeCredential(credential.id)}
                            className="p-8 text-muted-foreground dark:text-muted-foreground hover:text-destructive dark:hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-destructive/50" // Spacing 8
                            aria-label="Remove credential"
                          >
                            <X className="w-16 h-16" /> {/* Spacing 16 */}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-48 mt-24"> {/* Spacing 48, 24 */}
              <div className="w-64 h-64 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center"> {/* Spacing 64, 16 */}
                <PlusCircle className="w-32 h-32 text-muted-foreground" /> {/* Spacing 32 */}
              </div>
              <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No credentials uploaded yet</h3> {/* Spacing 8 */}
              <p className="text-muted-foreground dark:text-muted-foreground text-sm">
                Drag and drop files or click the upload area to get started.
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        {credentials.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-24 flex justify-end" // Spacing 24
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUploadComplete(credentials)}
              className="px-24 py-12 bg-[#3B82F6] text-foreground rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50" // Spacing 24, 12
            >
              Save Credentials
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Credential Preview Modal */}
      <AnimatePresence>
        {selectedCredential && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface/20 dark:bg-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-16" // Spacing 16
            onClick={() => setSelectedCredential(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FFFFFF] dark:bg-surface rounded-xl border border-[#E5E7EB] dark:border-border shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-24 border-b border-[#E5E7EB] dark:border-border"> {/* Spacing 24 */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-muted-foreground dark:text-foreground">Credential Details</h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedCredential(null)}
                    className="p-8 hover:bg-surface dark:hover:bg-surface rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50" // Spacing 8
                    aria-label="Close modal"
                  >
                    <X className="w-20 h-20 text-muted-foreground dark:text-muted-foreground" /> {/* Spacing 20 */}
                  </motion.button>
                </div>
              </div>

              <div className="p-24 overflow-y-auto max-h-[calc(80vh-120px)]"> {/* Spacing 24, 120px for header/footer */}
                <div className="space-y-16"> {/* Spacing 16 */}
                  <div>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">File Name</p> {/* Spacing 8 */}
                    <p className="text-muted-foreground dark:text-foreground font-medium">{selectedCredential.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">Type</p> {/* Spacing 8 */}
                    <p className="text-muted-foreground dark:text-foreground font-medium">
                      {CREDENTIAL_TYPES.find(t => t.value === selectedCredential.type)?.label || 'N/A'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">Status</p> {/* Spacing 8 */}
                    <div className={`
                      inline-flex items-center gap-8 px-12 py-8 rounded-full text-sm font-medium border
                      ${getStatusBadgeClass(selectedCredential.status)}
                    `}> {/* Spacing 8, 12, 8 */}
                      {getStatusIcon(selectedCredential.status)}
                      <span className="capitalize">{selectedCredential.status}</span>
                    </div>
                  </div>

                  {selectedCredential.issuer && (
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">Issuing Organization</p> {/* Spacing 8 */}
                      <p className="text-muted-foreground dark:text-foreground font-medium">{selectedCredential.issuer}</p>
                    </div>
                  )}

                  {selectedCredential.credentialNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">Credential Number</p> {/* Spacing 8 */}
                      <p className="text-muted-foreground dark:text-foreground font-medium">{selectedCredential.credentialNumber}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">Uploaded</p> {/* Spacing 8 */}
                    <p className="text-muted-foreground dark:text-foreground">
                      {selectedCredential.uploadedAt.toLocaleDateString()} at{' '}
                      {selectedCredential.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>

                  {selectedCredential.verifiedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-8">Verified</p> {/* Spacing 8 */}
                      <p className="text-muted-foreground dark:text-foreground">
                        {selectedCredential.verifiedAt.toLocaleDateString()} at{' '}
                        {selectedCredential.verifiedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-24 flex gap-16"> {/* Spacing 24, 16 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(selectedCredential)}
                    className="flex-1 px-16 py-12 bg-[#3B82F6] text-foreground rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-8 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50" // Spacing 16, 12, 8
                    aria-label="Download credential file"
                  >
                    <Download className="w-16 h-16" /> {/* Spacing 16 */}
                    Download
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Demo component for page.tsx
export default function CredentialUploadDemo() {
  const handleUploadComplete = (credentials: Credential[]) => {
    console.log('Credentials saved:', credentials)
    alert('Credentials saved! Check console for details.')
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-surface p-32 font-inter"> {/* Spacing 32 */}
      <div className="max-w-4xl mx-auto">
        <CredentialUpload onUploadComplete={handleUploadComplete} />
      </div>
    </div>
  )
}