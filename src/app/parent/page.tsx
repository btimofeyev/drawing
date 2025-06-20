'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, Shield, Users, Palette, Sparkles } from 'lucide-react'
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="icon-container purple mx-auto mb-4">
            <Palette />
          </div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="py-6 px-4 bg-white/80 backdrop-blur-sm border-b border-slate-200/50">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="icon-container pink">
                <Palette />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  DrawingBuddy
                </h1>
                <p className="text-slate-600 font-medium">Parent Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4" />
                Add Child
              </button>
              
              <button
                onClick={handleSignOut}
                className="btn btn-secondary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <section className="section py-20">
          <div className="container">
            {children.length === 0 ? (
              <div className="text-center max-w-4xl mx-auto animate-fade-in">
                <div className="icon-container purple mx-auto mb-8" style={{width: '4rem', height: '4rem'}}>
                  <Users style={{width: '2rem', height: '2rem'}} />
                </div>
                
                <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Welcome to
                  <br />
                  DrawingBuddy
                </h2>
                
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                  Create your first child profile to get started with daily drawing challenges and creative fun in a safe environment
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="btn btn-primary btn-large"
                  >
                    <Sparkles />
                    Create Child Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">Your Children</h2>
                  <p className="text-xl text-slate-600">Safely manage profiles and settings for each child</p>
                </div>

                <div className="grid grid-3">
                  {children.map((child, index) => (
                    <div key={child.id} className="card text-center animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="icon-container mint mx-auto">
                        <span className="text-2xl font-bold text-white">
                          {child.name[0]}
                        </span>
                      </div>
                      <h3 className="mb-2">{child.name}</h3>
                      <p className="text-slate-600 font-medium mb-4">
                        @{child.username}
                      </p>
                      <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold capitalize mb-6">
                        {child.ageGroup}
                      </span>

                      <div className="space-y-4 mb-6">
                        <div className="bg-slate-50 rounded-2xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">Parental Consent</span>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                              child.parentalConsent 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {child.parentalConsent ? '✅ Approved' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">Account Created</span>
                            <span className="text-sm text-slate-600 font-medium">
                              {new Date(child.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button className="btn btn-primary w-full">
                        <Settings className="h-4 w-4" />
                        Manage Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Create Child Modal */}
      {showCreateForm && <CreateChildModal onClose={() => setShowCreateForm(false)} onSuccess={fetchChildren} />}
      
      <footer className="py-8 bg-slate-800 text-center">
        <div className="container">
          <p className="text-slate-400">© 2025 DrawingBuddy</p>
        </div>
      </footer>
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
      <div className="bg-white rounded-3xl max-w-lg w-full p-10 animate-fade-in shadow-2xl">
        <div className="text-center mb-10">
          <div className="icon-container orange mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
            <Plus style={{width: '2rem', height: '2rem'}} />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">Create Child Profile</h2>
          <p className="text-slate-600 text-lg">Set up a safe, creative account for your child</p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 mb-8 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">
              🎨 Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
              placeholder="coolartist123"
              maxLength={20}
              required
              className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-500 text-lg font-medium transition-all duration-200 hover:border-pink-300"
            />
            <p className="text-sm text-slate-500 mt-2">
              ✨ 3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">
              👶 Child's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
              className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-500 text-lg font-medium transition-all duration-200 hover:border-pink-300"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">
              🎂 Age Group
            </label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value as 'kids' | 'tweens')}
              className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-500 text-lg font-medium transition-all duration-200 hover:border-pink-300"
            >
              <option value="kids">Kids (6-10 years)</option>
              <option value="tweens">Tweens (11-16 years)</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-semibold text-slate-700 mb-3">
              🔐 4-Digit PIN
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              maxLength={4}
              required
              className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-500 text-center text-3xl font-mono tracking-widest transition-all duration-200 hover:border-pink-300"
            />
            <p className="text-sm text-slate-500 mt-2 text-center">
              🔑 Your child will use this PIN with their username to sign in
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !username || !name || pin.length !== 4 || username.length < 3}
              className="flex-1 btn btn-primary disabled:bg-slate-400 disabled:cursor-not-allowed"
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
                    <Sparkles className="h-4 w-4" />
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