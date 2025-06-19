'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, Shield, Users } from 'lucide-react'
import Link from 'next/link'

interface Child {
  id: string
  username: string
  name: string
  ageGroup: 'kids' | 'tweens'
  avatarUrl?: string
  parentalConsent: boolean
  createdAt: string
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    fetchChildren()
  }, [])

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/parent/children')
      const data = await response.json()
      setChildren(data.children || [])
    } catch (error) {
      console.error('Failed to fetch children:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/parent/signout', { method: 'POST' })
      window.location.href = '/'
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 slide-in-left">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center float">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
                <p className="text-blue-600 font-medium">Safely manage your children's creative accounts</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-2xl hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                Add Child
              </button>
              
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-800 font-semibold py-3 px-6 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16">
        {children.length === 0 ? (
          <div className="text-center py-24 fade-in">
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center mx-auto mb-8 float"
                 style={{background: 'var(--gradient-secondary)'}}>
              <Users className="h-14 w-14 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Welcome to DrawingBuddy</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Create your first child profile to get started with daily drawing challenges and creative fun in a safe environment.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white font-bold text-lg py-5 px-10 rounded-2xl hover:bg-blue-700 hover:scale-105 transition-all duration-200 inline-flex items-center gap-3 shadow-xl hover:shadow-2xl"
            >
              <Plus className="h-6 w-6" />
              Create Child Profile
              <span>🎨</span>
            </button>
          </div>
        ) : (
          <div className="space-y-12 fade-in">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Children</h2>
              <p className="text-xl text-gray-600">Safely manage profiles and settings for each child</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {children.map((child, index) => (
                <div key={child.id} className="group bg-white border border-blue-100 rounded-3xl p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 shadow-lg bounce-in"
                     style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                         style={{background: 'var(--gradient-primary)'}}>
                      <span className="text-2xl font-bold text-white">
                        {child.name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{child.name}</h3>
                      <p className="text-gray-600 font-medium">
                        @{child.username}
                      </p>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold capitalize mt-2">
                        {child.ageGroup}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Parental Consent</span>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                          child.parentalConsent 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {child.parentalConsent ? '✅ Approved' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Account Created</span>
                        <span className="text-sm text-gray-600 font-medium">
                          {new Date(child.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-700 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                      <Settings className="h-5 w-5" />
                      Manage Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Child Modal */}
      {showCreateForm && <CreateChildModal onClose={() => setShowCreateForm(false)} onSuccess={fetchChildren} />}
    </div>
  )
}

function CreateChildModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [ageGroup, setAgeGroup] = useState<'kids' | 'tweens'>('kids')
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/parent/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, ageGroup, pin })
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
        onClose()
      } else {
        setError(data.error || 'Failed to create child profile')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-8 z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-10 fade-in shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 float"
               style={{background: 'var(--gradient-secondary)'}}>
            <Plus className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Create Child Profile</h2>
          <p className="text-gray-600 text-lg">Set up a safe, creative account for your child</p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 mb-8 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              🎨 Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
              placeholder="coolartist123"
              maxLength={20}
              required
              className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-blue-300"
            />
            <p className="text-sm text-gray-500 mt-2">
              ✨ 3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              👶 Child's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
              className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-blue-300"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              🎂 Age Group
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as 'kids' | 'tweens')}
              className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-lg font-medium transition-all duration-200 hover:border-blue-300"
            >
              <option value="kids">Kids (6-10 years)</option>
              <option value="tweens">Tweens (11-16 years)</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              🔐 4-Digit PIN
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              required
              className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 text-center text-3xl font-mono tracking-widest transition-all duration-200 hover:border-blue-300"
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              🔑 Your child will use this PIN with their username to sign in
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 font-bold py-4 px-6 rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !username || !name || pin.length !== 4 || username.length < 3}
              className="flex-1 bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-700 hover:scale-105 disabled:scale-100 disabled:bg-gray-400 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Profile
                    <span>🎨</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}