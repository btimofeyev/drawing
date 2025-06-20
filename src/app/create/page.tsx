'use client'

import { useState, useEffect } from 'react'
import { 
  Upload, 
  Palette,
  Sparkles,
  Target,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import ChildLayout from '@/components/ChildLayout'

interface Prompt {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  emoji: string
  date: string
  timeSlot?: 'morning' | 'afternoon' | 'evening'
  isToday: boolean
  promptType?: 'shared_daily' | 'individual' | 'community_remix'
  communityTitle?: string
}

export default function CreatePage() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [uploadType, setUploadType] = useState<'challenge' | 'personal' | 'remix' | null>(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<'morning' | 'afternoon' | 'evening' | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [altText, setAltText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    // Check URL parameters for time slot
    const urlParams = new URLSearchParams(window.location.search)
    const slot = urlParams.get('slot') as 'morning' | 'afternoon' | 'evening' | null
    
    if (slot) {
      setSelectedTimeSlot(slot)
      fetchDailyChallenge(slot)
    } else {
      // Default to morning if no slot specified
      fetchDailyChallenge('morning')
    }
  }, [])

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const fetchDailyChallenge = async (timeSlot: string) => {
    try {
      setIsLoading(true)
      const url = `/api/prompts/daily?slot=${timeSlot}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setSelectedPrompt(data.prompt)
        setSelectedPromptId(data.prompt.id)
        setError(null)
      } else {
        setError('Unable to load challenge. Please try again!')
      }
    } catch (error) {
      console.error('Failed to load daily challenge:', error)
      setError('Unable to load challenge. Please try again!')
    } finally {
      setIsLoading(false)
    }
  }


  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a JPG, PNG, GIF, or WebP image.')
      return
    }

    // Validate file size (10MB max, 1KB min)
    const maxSize = 10 * 1024 * 1024
    const minSize = 1024
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 10MB.')
      return
    }

    if (file.size < minSize) {
      setUploadError('File too small. Please upload a valid image file.')
      return
    }

    setSelectedFile(file)
    setUploadError(null)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Generate default alt text from filename
    const fileName = file.name.split('.')[0]
    const defaultAlt = fileName.replace(/[_-]/g, ' ')
    setAltText(defaultAlt)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !altText.trim()) {
      setUploadError('Please select a file and add a description.')
      return
    }

    if (altText.trim().length < 5) {
      setUploadError('Please provide a more detailed description (at least 5 characters).')
      return
    }

    if (!selectedTimeSlot) {
      setUploadError('No time slot selected.')
      return
    }

    if (!selectedPromptId) {
      setUploadError('No prompt selected.')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('altText', altText.trim())
      formData.append('timeSlot', selectedTimeSlot)
      formData.append('promptId', selectedPromptId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUploadSuccess(true)
        // Reset form
        setSelectedFile(null)
        setPreviewUrl(null)
        setAltText('')
      } else {
        setUploadError(data.error || 'Upload failed. Please try again.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Upload failed. Please check your connection and try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const getSlotColor = (timeSlot: 'morning' | 'afternoon' | 'evening') => {
    switch (timeSlot) {
      case 'morning': return 'from-orange-400 to-yellow-500'
      case 'afternoon': return 'from-blue-400 to-cyan-500'
      case 'evening': return 'from-purple-400 to-pink-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getSlotIcon = (timeSlot: 'morning' | 'afternoon' | 'evening') => {
    switch (timeSlot) {
      case 'morning': return '🌅'
      case 'afternoon': return '☀️'
      case 'evening': return '🌆'
      default: return '✨'
    }
  }

  if (isLoading) {
    return (
      <ChildLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="icon-container pink mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
              <Palette style={{width: '2rem', height: '2rem'}} />
            </div>
            <p className="text-xl font-semibold text-slate-700">Loading your challenge...</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  return (
    <ChildLayout>
      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="text-center mb-8">
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl inline-block">
              {error}
            </div>
          </div>
        )}

        {/* Challenge Header */}
        {selectedPrompt && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
            {/* Header with gradient based on time slot */}
            <div className={`bg-gradient-to-r ${
              selectedPrompt.timeSlot 
                ? getSlotColor(selectedPrompt.timeSlot) 
                : 'from-gray-400 to-gray-500'
            } p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{selectedPrompt.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedPrompt.title}
                    </h2>
                    <p className="text-sm opacity-90">
                      {selectedPrompt.timeSlot && `${selectedPrompt.timeSlot.charAt(0).toUpperCase() + selectedPrompt.timeSlot.slice(1)} Challenge`} • {selectedPrompt.difficulty} level
                    </p>
                  </div>
                </div>
                {selectedTimeSlot && (
                  <div className="text-right">
                    <div className="bg-white/20 rounded-lg px-3 py-2">
                      <div className="text-xs opacity-75">Time Slot</div>
                      <div className="font-bold">{getSlotIcon(selectedTimeSlot as any)} {selectedTimeSlot.charAt(0).toUpperCase() + selectedTimeSlot.slice(1)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Challenge content */}
            <div className="p-6">
              <p className="text-slate-600 text-lg leading-relaxed mb-4">
                {selectedPrompt.description}
              </p>
            </div>
          </div>
        )}

        {/* Upload Interface */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
          {uploadSuccess ? (
            // Success State
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Artwork Uploaded Successfully! 🎉</h3>
              <p className="text-slate-600 mb-8">
                Your amazing artwork has been submitted for the {selectedTimeSlot} challenge and is now being reviewed. 
                It will appear in the gallery once approved!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    setUploadSuccess(false)
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    setAltText('')
                  }}
                  className="btn btn-primary"
                >
                  Upload Another
                </button>
                <Link href="/child-home" className="btn btn-secondary">
                  Back to Challenges
                </Link>
                <Link href={`/gallery?slot=${selectedTimeSlot}`} className="btn btn-secondary">
                  View Gallery
                </Link>
              </div>
            </div>
          ) : (
            // Upload Form
            <div className="text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-r ${
                selectedTimeSlot ? getSlotColor(selectedTimeSlot as any) : 'from-pink-400 to-purple-500'
              }`}>
                <Upload className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Upload Your Artwork</h3>
              <p className="text-slate-600 mb-8 max-w-lg mx-auto">
                {selectedTimeSlot 
                  ? `Share your ${selectedTimeSlot} challenge creation with the community!`
                  : 'Share your creative masterpiece with the community!'
                } Upload drawings, paintings, digital art, or photos of your physical artwork.
              </p>
              
              {/* Error Display */}
              {(error || uploadError) && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <p className="text-red-700 font-medium">
                    {uploadError || error}
                  </p>
                </div>
              )}
              
              {/* Slot reminder */}
              {selectedTimeSlot && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-800 font-semibold text-sm">
                      Uploading for {selectedTimeSlot} slot
                    </span>
                  </div>
                  <p className="text-yellow-700 text-sm">
                    This artwork will be submitted for your {selectedTimeSlot} challenge today.
                  </p>
                </div>
              )}
              
              {/* Upload Area */}
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 mb-6 transition-colors ${
                  dragActive 
                    ? 'border-pink-500 bg-pink-50' 
                    : previewUrl 
                      ? 'border-green-400 bg-green-50'
                      : 'border-slate-300 hover:border-pink-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
              >
                {previewUrl ? (
                  // File Preview
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full max-h-64 rounded-2xl shadow-lg"
                      />
                      <button 
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl(null)
                          setAltText('')
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-green-700 font-semibold mb-2">
                      File selected: {selectedFile?.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      Size: {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB
                    </p>
                  </div>
                ) : (
                  // Drop Zone
                  <div className="text-center">
                    <Palette className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-700 mb-2">
                      Drag and drop your artwork here
                    </p>
                    <p className="text-slate-500 mb-4">or</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(file)
                      }}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="btn btn-primary cursor-pointer">
                      Choose File
                    </label>
                    <p className="text-sm text-slate-500 mt-4">
                      Supports: JPG, PNG, GIF, WebP (max 10MB)
                    </p>
                  </div>
                )}
              </div>
              
              {/* Alt Text Input */}
              {selectedFile && (
                <div className="mb-6">
                  <label htmlFor="alt-text" className="block text-left text-sm font-medium text-slate-700 mb-2">
                    Describe your artwork *
                  </label>
                  <textarea
                    id="alt-text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Tell us about your artwork - what did you create? What inspired you?"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-slate-500 mt-1 text-right">
                    {altText.length}/200 characters
                  </p>
                </div>
              )}
              
              {/* Upload Button */}
              {selectedFile && altText.trim() && (
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`w-full btn ${isUploading ? 'btn-disabled' : 'btn-primary'} text-lg py-4`}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading your masterpiece...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload to {selectedTimeSlot?.charAt(0).toUpperCase() + selectedTimeSlot?.slice(1)} Gallery
                      <Sparkles className="h-5 w-5" />
                    </div>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Alternative Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link href="/child-home" className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="icon-container pink mb-4 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">All Today's Challenges</h4>
            <p className="text-slate-600">
              See all three time slot challenges for today
            </p>
          </Link>

          <Link 
            href={`/gallery${selectedTimeSlot ? `?slot=${selectedTimeSlot}` : ''}`}
            className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="icon-container pink mb-4 group-hover:scale-110 transition-transform duration-300">
              <Palette className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              {selectedTimeSlot ? `${selectedTimeSlot.charAt(0).toUpperCase() + selectedTimeSlot.slice(1)} Gallery` : 'View Gallery'}
            </h4>
            <p className="text-slate-600">
              {selectedTimeSlot 
                ? `See artwork from other artists' ${selectedTimeSlot} challenges`
                : 'Get inspired by amazing artwork from other young artists!'
              }
            </p>
          </Link>

          <Link href="/achievements" className="group bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="icon-container pink mb-4 group-hover:scale-110 transition-transform duration-300">
              <Target className="h-6 w-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">View Achievements</h4>
            <p className="text-slate-600">
              Check your progress and unlock new badges!
            </p>
          </Link>
        </div>
      </div>
    </ChildLayout>
  )
}