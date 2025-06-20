'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Camera, 
  Sparkles,
  Users,
  Palette
} from 'lucide-react'
import Link from 'next/link'
import ChildLayout from '@/components/ChildLayout'

interface DailyChallenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  emoji: string
  date: string
  timeSlot: 'morning' | 'afternoon' | 'evening'
  isToday: boolean
}

interface UploadStatus {
  timeSlot: 'morning' | 'afternoon' | 'evening'
  canUpload: boolean
  hasUploaded: boolean
  uploadedAt: string | null
  post: any | null
}

interface SlotPost {
  id: string
  imageUrl: string
  thumbnailUrl: string | null
  altText: string
  createdAt: string
  likesCount: number
  moderationStatus: 'pending' | 'approved' | 'rejected'
}

export default function ChildHomePage() {
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([])
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([])
  const [postsBySlot, setPostsBySlot] = useState<Record<string, SlotPost[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDailyChallengesAndStatus()
  }, [])

  const fetchDailyChallengesAndStatus = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Fetch all three daily challenges and upload status in parallel
      const [challengesResponse, statusResponse] = await Promise.all([
        fetch('/api/prompts/daily?all=true'),
        fetch('/api/posts/upload-status')
      ])

      if (challengesResponse.ok) {
        const challengesData = await challengesResponse.json()
        setDailyChallenges(challengesData.prompts || [])
      } else {
        setError('Unable to load today\'s challenges. Please try again!')
      }

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setUploadStatus(statusData.uploadStatus || [])
        
        // Convert posts to the expected format
        const postsBySlot: Record<string, SlotPost[]> = {}
        statusData.uploadStatus?.forEach((status: UploadStatus) => {
          if (status.post) {
            postsBySlot[status.timeSlot] = [status.post]
          }
        })
        setPostsBySlot(postsBySlot)
      }
    } catch (error) {
      console.error('Failed to load daily challenges:', error)
      setError('Unable to load today\'s challenges. Please try again!')
    } finally {
      setIsLoading(false)
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

  const getSlotColor = (timeSlot: 'morning' | 'afternoon' | 'evening') => {
    switch (timeSlot) {
      case 'morning': return 'from-orange-400 to-yellow-500'
      case 'afternoon': return 'from-blue-400 to-cyan-500'
      case 'evening': return 'from-purple-400 to-pink-500'
      default: return 'from-gray-400 to-gray-500'
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
            <p className="text-xl font-semibold text-slate-700">Loading your art studio... 🎨</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  return (
    <ChildLayout>
      <div className="flex-1 p-8">
        <div className="w-full max-w-7xl mx-auto animate-fade-in">
          {error && (
            <div className="text-center mb-8">
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl inline-block">
                {error}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-12 flex flex-col items-center">
            <h1 className="text-6xl font-bold mb-4 text-slate-800 leading-tight text-center">
              Today's Creative
              <br />
              <span className="text-pink-400">Adventures</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto text-center mb-6">
              Three amazing challenges await you today! Pick whichever one inspires you most and create your artwork.
            </p>
            
            {/* Daily Progress */}
            {uploadStatus.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Today's Progress</h3>
                  <span className="text-2xl font-bold text-pink-600">
                    {uploadStatus.filter(s => s.hasUploaded).length}/3
                  </span>
                </div>
                <div className="flex gap-2 mb-3">
                  {['morning', 'afternoon', 'evening'].map((slot, index) => {
                    const status = uploadStatus.find(s => s.timeSlot === slot)
                    const isCompleted = status?.hasUploaded || false
                    return (
                      <div
                        key={slot}
                        className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                          isCompleted 
                            ? slot === 'morning' 
                              ? 'bg-gradient-to-r from-orange-400 to-yellow-500'
                              : slot === 'afternoon'
                              ? 'bg-gradient-to-r from-blue-400 to-cyan-500' 
                              : 'bg-gradient-to-r from-purple-400 to-pink-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    )
                  })}
                </div>
                <p className="text-sm text-slate-600 text-center">
                  {uploadStatus.filter(s => s.hasUploaded).length === 3 
                    ? "🎉 All challenges completed! Amazing work!" 
                    : `${3 - uploadStatus.filter(s => s.hasUploaded).length} more to go today!`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Time Slots Grid */}
          {dailyChallenges.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {['morning', 'afternoon', 'evening'].map((timeSlot) => {
                const challenge = dailyChallenges.find(c => c.timeSlot === timeSlot)
                const status = uploadStatus.find(s => s.timeSlot === timeSlot)
                const posts = postsBySlot[timeSlot] || []
                const hasUploaded = status?.hasUploaded || posts.length > 0

                if (!challenge) return null

                return (
                  <div
                    key={timeSlot}
                    className="relative bg-white rounded-3xl shadow-lg border-2 border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl"
                  >

                    {/* Slot header */}
                    <div className={`bg-gradient-to-r ${getSlotColor(timeSlot as any)} p-6 rounded-t-3xl text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{challenge.emoji}</span>
                          <div>
                            <h3 className="text-xl font-bold">{challenge.title}</h3>
                            <p className="text-sm opacity-90 capitalize">{timeSlot} Challenge</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/20 ${
                          challenge.difficulty === 'easy' ? 'text-green-100' :
                          challenge.difficulty === 'medium' ? 'text-yellow-100' : 'text-red-100'
                        }`}>
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Slot content */}
                    <div className="p-6 text-center">
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {challenge.description}
                      </p>

                      {/* Upload status */}
                      {hasUploaded ? (
                        <div className="mb-6">
                          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-green-700 font-semibold text-sm">
                                Artwork uploaded!
                              </span>
                            </div>
                            {status?.post && (
                              <div className="flex items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100">
                                  <img 
                                    src={status.post.thumbnailUrl || status.post.imageUrl}
                                    alt={status.post.altText}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 text-center">
                                  <p className="text-slate-600 text-sm">{status.post.altText}</p>
                                  <p className="text-xs text-slate-500">
                                    Uploaded: {new Date(status.post.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : status?.canUpload ? (
                        <div className="mb-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-blue-700 font-semibold text-sm">
                                Ready for your artwork!
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-6">
                          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-orange-700 font-semibold text-sm">
                                Slot filled for today
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="space-y-3">
                        {!hasUploaded ? (
                          <Link 
                            href={`/create?slot=${timeSlot}&prompt=${challenge.id}`}
                            className="w-full btn btn-primary"
                          >
                            <Camera className="h-4 w-4" />
                            Create for {timeSlot}
                            <Sparkles className="h-4 w-4" />
                          </Link>
                        ) : (
                          <div className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-2xl font-semibold text-center border border-green-200">
                            ✅ Completed for today!
                          </div>
                        )}
                        
                        <Link 
                          href={`/gallery?slot=${timeSlot}`}
                          className="w-full btn btn-secondary"
                        >
                          <Users className="h-4 w-4" />
                          See {timeSlot} gallery
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="icon-container pink mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
                <Calendar style={{width: '2rem', height: '2rem'}} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No challenges yet</h3>
              <p className="text-xl text-slate-600">Check back soon for today's creative adventures!</p>
            </div>
          )}

          {/* Encouragement */}
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 border border-pink-200 flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-3 text-center">
              🎨 Your Creative Journey Awaits!
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto text-center">
              Each time slot offers a unique creative challenge designed just for you. 
              Start with any slot you like and build your daily art collection!
            </p>
          </div>
        </div>
      </div>
    </ChildLayout>
  )
}