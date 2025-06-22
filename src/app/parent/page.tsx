'use client'

import { useState, useEffect } from 'react'
import { Plus, Settings, Shield, Users, Palette, Sparkles, Eye, Trash2, AlertTriangle, Clock, Mail } from 'lucide-react'
import Link from 'next/link'

interface Child {
  id: string
  username: string
  name: string
  ageGroup: 'preschoolers' | 'kids' | 'tweens'
  avatarUrl?: string
  parentalConsent: boolean
  createdAt: string
  artworkCount?: number
}

interface Artwork {
  id: string
  imageUrl: string
  promptText: string
  createdAt: string
  approved: boolean
  promptDate: string
  promptTimeSlot: string
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [childArtwork, setChildArtwork] = useState<Artwork[]>([])
  const [showDeleteChildModal, setShowDeleteChildModal] = useState<Child | null>(null)
  const [showComingSoonModal, setShowComingSoonModal] = useState(false)

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

  const fetchChildArtwork = async (childId: string) => {
    try {
      const response = await fetch(`/api/parent/children/${childId}/artwork`)
      const data = await response.json()
      if (data.success) {
        setChildArtwork(data.artwork)
      }
    } catch (error) {
      console.error('Failed to fetch artwork:', error)
    }
  }

  const handleViewArtwork = async (child: Child) => {
    setSelectedChild(child)
    await fetchChildArtwork(child.id)
  }

  const handleDeleteArtwork = async (artworkId: string) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return

    try {
      const response = await fetch(`/api/parent/artwork/${artworkId}`, {
        method: 'DELETE'
      })
      
      if (response.ok && selectedChild) {
        await fetchChildArtwork(selectedChild.id)
      }
    } catch (error) {
      console.error('Failed to delete artwork:', error)
    }
  }

  const handleDeleteChild = async (child: Child) => {
    try {
      const response = await fetch(`/api/parent/children/${child.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setShowDeleteChildModal(null)
        await fetchChildren()
        if (selectedChild?.id === child.id) {
          setSelectedChild(null)
          setChildArtwork([])
        }
      }
    } catch (error) {
      console.error('Failed to delete child account:', error)
    }
  }

  const handleAddChild = () => {
    if (children.length > 0) {
      setShowComingSoonModal(true)
    } else {
      setShowCreateForm(true)
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
                  Daily Scribble
                </h1>
                <p className="text-slate-600 font-medium">Parent Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleAddChild}
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
                  Daily Scribble
                </h2>
                
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                  Create your first child profile to get started with daily drawing challenges and creative fun in a safe environment
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={handleAddChild}
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

                      <div className="space-y-3">
                        <button 
                          onClick={() => handleViewArtwork(child)}
                          className="btn btn-primary w-full"
                        >
                          <Eye className="h-4 w-4" />
                          View Artwork
                        </button>
                        <button 
                          onClick={() => setShowDeleteChildModal(child)}
                          className="btn btn-secondary w-full border-red-200 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                          <span className="text-red-600">Delete Account</span>
                        </button>
                      </div>
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
      
      {/* Coming Soon Modal */}
      {showComingSoonModal && <ComingSoonModal onClose={() => setShowComingSoonModal(false)} />}
      
      {/* Artwork Viewer Modal */}
      {selectedChild && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-fade-in shadow-2xl">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {selectedChild.name}'s Artwork
                  </h2>
                  <p className="text-slate-600">
                    {childArtwork.length} drawing{childArtwork.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedChild(null)
                    setChildArtwork([])
                  }}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {childArtwork.length === 0 ? (
                <div className="text-center py-20">
                  <div className="icon-container mint mx-auto mb-4">
                    <Palette />
                  </div>
                  <p className="text-xl text-slate-600">No artwork yet</p>
                  <p className="text-slate-500 mt-2">
                    {selectedChild.name} hasn't created any drawings yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {childArtwork.map((artwork) => (
                    <div key={artwork.id} className="card">
                      <div className="relative group bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
                        <img
                          src={artwork.imageUrl}
                          alt="Child's drawing"
                          className="w-full h-64 object-contain p-4 rounded-xl"
                        />
                        <button
                          onClick={() => handleDeleteArtwork(artwork.id)}
                          className="absolute top-2 right-2 btn btn-secondary opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm"
                          title="Delete artwork"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-slate-600 mb-2">
                          {artwork.promptText}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{new Date(artwork.createdAt).toLocaleDateString()}</span>
                          <span className={`px-2 py-1 rounded-full ${
                            artwork.approved 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {artwork.approved ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Child Confirmation Modal */}
      {showDeleteChildModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-fade-in shadow-2xl">
            <div className="text-center mb-6">
              <div className="icon-container bg-red-100 mx-auto mb-4">
                <AlertTriangle className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Delete Child Account?
              </h3>
              <p className="text-slate-600">
                Are you sure you want to delete <strong>{showDeleteChildModal.name}'s</strong> account?
              </p>
              <p className="text-red-600 mt-4 font-medium">
                ⚠️ This will permanently delete:
              </p>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                <li>• All profile information</li>
                <li>• All artwork and creations</li>
                <li>• All achievements and progress</li>
              </ul>
              <p className="text-red-600 mt-4 font-bold">
                This action cannot be undone!
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteChildModal(null)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteChild(showDeleteChildModal)}
                className="flex-1 btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
      
      <footer className="py-8 bg-slate-800 text-center">
        <div className="container">
          <p className="text-slate-400">© 2025 Daily Scribble</p>
        </div>
      </footer>
    </div>
  )
}

function ComingSoonModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-10 animate-fade-in shadow-2xl">
        <div className="text-center">
          <div className="icon-container bg-gradient-to-br from-purple-100 to-pink-100 mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
            <Clock style={{width: '2rem', height: '2rem'}} className="text-purple-600" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Multiple Kids Coming Soon!
          </h2>
          
          <p className="text-lg text-slate-600 mb-6 leading-relaxed">
            We're working hard on giving users the ability to add more kids to their account. This exciting feature will be available soon!
          </p>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="font-semibold text-slate-700">What's Coming:</span>
            </div>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Add multiple children to one parent account
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                Manage all your kids' creative journeys in one place
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Enhanced family dashboard with individual progress tracking
              </li>
            </ul>
          </div>
          
          <p className="text-sm text-slate-500 mb-8">
            Stay tuned for updates! We'll notify you as soon as this feature is ready.
          </p>
          
          <button
            onClick={onClose}
            className="btn btn-primary w-full"
          >
            <span className="flex items-center justify-center gap-2">
              Got it!
              <Sparkles className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

function CreateChildModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [username, setUsername] = useState('')
  const [name, setName] = useState('')
  const [ageGroup, setAgeGroup] = useState('kids')
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
        if (data.error === 'MULTIPLE_CHILDREN_LIMIT') {
          setError(data.message || "We're working on giving users the ability to add more kids!")
        } else {
          setError(data.error || 'Failed to create child profile')
        }
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
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-6 py-4 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-500 text-lg font-medium transition-all duration-200 hover:border-pink-300"
            >
              <option value="preschoolers">Preschoolers (4-6 years)</option>
              <option value="kids">Kids (7-10 years)</option>
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