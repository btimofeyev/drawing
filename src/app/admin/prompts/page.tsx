'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Trash2, Sparkles, Lock, AlertTriangle, Eye, User } from 'lucide-react'
import { getCurrentDateET } from '@/utils/timezone'
import Link from 'next/link'

interface RejectedContent {
  id: string
  imageUrl: string
  altText: string
  createdAt: string
  childUsername: string
  childName: string
  moderationReason: string
}

export default function AdminPromptsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const [prompts, setPrompts] = useState<any[]>([])
  const [rejectedContent, setRejectedContent] = useState<RejectedContent[]>([])
  const [showRejectedContent, setShowRejectedContent] = useState(false)
  const [loadingRejected, setLoadingRejected] = useState(false)

  // Check if user is authenticated as admin
  useEffect(() => {
    checkAdminAuth()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/admin/generate-prompts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      setIsAuthenticated(response.ok)
    } catch (error) {
      setIsAuthenticated(false)
    }
  }

  const loadRejectedContent = async () => {
    setLoadingRejected(true)
    try {
      const response = await fetch('/api/admin/moderation/rejected')
      if (response.ok) {
        const data = await response.json()
        setRejectedContent(data.rejectedContent || [])
        setShowRejectedContent(true)
      } else {
        console.error('Failed to load rejected content')
      }
    } catch (error) {
      console.error('Error loading rejected content:', error)
    } finally {
      setLoadingRejected(false)
    }
  }

  const regenerateTodaysPrompts = async () => {
    if (!confirm('This will delete and regenerate all of today\'s prompts. Are you sure?')) {
      return
    }

    setIsLoading(true)
    setMessage('')
    
    try {
      // First, delete today's prompts
      const today = getCurrentDateET()
      
      // Call the admin API to generate new prompts
      const response = await fetch('/api/admin/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          date: today,
          ageGroups: ['preschoolers', 'kids', 'tweens'],
          regenerate: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate prompts')
      }

      const result = await response.json()
      setMessage(`Successfully regenerated ${result.generated} prompts for ${result.date}`)
      setPrompts(result.prompts)
      
    } catch (error) {
      console.error('Error:', error)
      setMessage('Error regenerating prompts. Check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-xl shadow-lg p-8">
          <Lock className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in as an admin to access this page.
          </p>
          <Link 
            href="/auth/parent"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors inline-block"
          >
            Sign In as Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          Admin: Prompt Management
        </h1>

        {/* Prompt Management Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Regenerate Today's Prompts</h2>
          
          <p className="text-gray-600 mb-6">
            If you don't like today's prompts, you can regenerate them. This will delete the existing prompts and create new ones.
          </p>

          <button
            onClick={regenerateTodaysPrompts}
            disabled={isLoading}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Trash2 className="h-5 w-5" />
                Regenerate Today's Prompts
              </>
            )}
          </button>

          {message && (
            <div className={`mt-6 p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {prompts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">New Prompts:</h3>
              <div className="space-y-4">
                {prompts.map((prompt, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-purple-600">
                        {prompt.age_group} - {prompt.time_slot}
                      </span>
                      <span className="text-sm text-gray-500">
                        {prompt.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-700">{prompt.prompt_text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content Moderation Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                Content Moderation
              </h2>
              <p className="text-gray-600 mt-1">Review content that failed moderation</p>
            </div>
            <button
              onClick={loadRejectedContent}
              disabled={loadingRejected}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingRejected ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  View Rejected Content
                </>
              )}
            </button>
          </div>

          {showRejectedContent && (
            <div className="mt-6">
              {rejectedContent.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Rejected Content</h3>
                  <p className="text-gray-600">All recent submissions have passed moderation! 🎉</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-red-700">
                    ⚠️ {rejectedContent.length} Rejected Submission{rejectedContent.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rejectedContent.map((item) => (
                      <div key={item.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <div className="relative group bg-white rounded-lg mb-3">
                          <img
                            src={item.imageUrl}
                            alt={item.altText}
                            className="w-full h-48 object-contain p-2 rounded-lg"
                          />
                          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            REJECTED
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{item.childName}</span>
                            <span className="text-gray-500">(@{item.childUsername})</span>
                          </div>
                          
                          <div className="bg-white rounded p-2">
                            <p className="text-xs text-gray-600 mb-1">Description:</p>
                            <p className="text-sm">{item.altText}</p>
                          </div>
                          
                          <div className="bg-red-100 rounded p-2">
                            <p className="text-xs text-red-600 font-medium mb-1">Reason:</p>
                            <p className="text-sm text-red-800">{item.moderationReason}</p>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Admin Dashboard - Monitor content safety and manage daily prompts
          </p>
        </div>
      </div>
    </div>
  )
}