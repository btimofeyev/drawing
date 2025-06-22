'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Camera,
  Heart,
  Users,
  TrendingUp,
  Sparkles,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import ChildLayout from '@/components/ChildLayout'

interface TrendingPrompt {
  id: string
  title: string
  description: string
  communityTitle: string
  emoji: string
  difficulty: 'easy' | 'medium' | 'hard'
  ageGroup: 'kids' | 'tweens'
  date: string
  promptType: 'shared_daily' | 'community_remix'
  stats: {
    totalPosts: number
    totalLikes: number
    popularityScore: number
    trendingScore: number
  }
  sampleArtwork: Array<{
    id: string
    imageUrl: string
    thumbnailUrl?: string
    artist: {
      username: string
      name: string
      avatarUrl?: string
    }
  }>
  hasUserPosted: boolean
  createdAt: string
}

type SortType = 'trending' | 'popular' | 'recent'

export default function TrendingPromptsPage() {
  const [prompts, setPrompts] = useState<TrendingPrompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<SortType>('trending')

  useEffect(() => {
    fetchTrendingPrompts()
  }, [sortBy])

  const fetchTrendingPrompts = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/community/trending?type=${sortBy}&limit=20`)
      
      if (response.ok) {
        const data = await response.json()
        setPrompts(data.prompts || [])
      } else {
        setError('Unable to load trending prompts. Please try again!')
      }
    } catch (error) {
      console.error('Failed to load trending prompts:', error)
      setError('Unable to load trending prompts. Please try again!')
    } finally {
      setIsLoading(false)
    }
  }

  const getSortIcon = (type: SortType) => {
    switch (type) {
      case 'trending': return <TrendingUp size={16} />
      case 'popular': return <Heart size={16} />
      case 'recent': return <Sparkles size={16} />
    }
  }

  const getSortLabel = (type: SortType) => {
    switch (type) {
      case 'trending': return 'Trending Now'
      case 'popular': return 'Most Popular'
      case 'recent': return 'Recently Added'
    }
  }

  if (isLoading) {
    return (
      <ChildLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="icon-container green mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
              <TrendingUp style={{width: '2rem', height: '2rem'}} />
            </div>
            <p className="text-xl font-semibold text-slate-700">Loading trending prompts... 🔥</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  return (
    <ChildLayout>
      <div className="flex-1 p-8">
        <div className="w-full max-w-7xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Link 
                href="/child-home"
                className="p-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-slate-800">🔥 Trending Prompts</h1>
                <p className="text-slate-600">Discover popular prompts and add your creative spin!</p>
              </div>
            </div>

            {error && (
              <div className="text-center mb-6">
                <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl inline-block">
                  {error}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Sort by:</span>
              <div className="flex gap-2">
                {(['trending', 'popular', 'recent'] as SortType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSortBy(type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                      sortBy === type
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-white text-slate-600 hover:text-slate-800 border border-slate-200'
                    }`}
                  >
                    {getSortIcon(type)}
                    {getSortLabel(type)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trending Prompts Grid */}
          {prompts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {prompts.map((prompt) => (
                <div 
                  key={prompt.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200"
                >
                  {/* Prompt Header */}
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{prompt.emoji}</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold leading-tight mb-1">
                            {prompt.communityTitle || prompt.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm opacity-90">
                            <span className="bg-white/20 px-2 py-1 rounded-full font-medium">
                              {prompt.difficulty}
                            </span>
                            <span>•</span>
                            <span>{prompt.stats.totalPosts} posts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample Artwork Preview */}
                  {prompt.sampleArtwork.length > 0 && (
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex gap-2 mb-2">
                        {prompt.sampleArtwork.slice(0, 3).map((artwork) => (
                          <div key={artwork.id} className="flex-1 aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                            <img
                              src={artwork.thumbnailUrl || artwork.imageUrl}
                              alt="Sample artwork"
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 text-center">
                        Sample artwork from {prompt.stats.totalPosts} artists
                      </p>
                    </div>
                  )}

                  {/* Prompt Description */}
                  <div className="p-6">
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {prompt.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {prompt.stats.totalPosts}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart size={12} />
                          {prompt.stats.totalLikes}
                        </span>
                      </div>
                      <span>{new Date(prompt.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {!prompt.hasUserPosted ? (
                        <Link 
                          href={`/create?promptId=${prompt.id}&type=remix`}
                          className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-bold hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Camera size={16} />
                          Remix This Prompt
                        </Link>
                      ) : (
                        <div className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-xl font-medium text-center border border-green-200">
                          ✅ You've remixed this!
                        </div>
                      )}
                      
                      <Link 
                        href={`/community/prompt/${prompt.id}`}
                        className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <Users size={16} />
                        View All Art ({prompt.stats.totalPosts})
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="icon-container gray mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
                <TrendingUp style={{width: '2rem', height: '2rem'}} />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No trending prompts yet!</h3>
              <p className="text-lg text-slate-600 mb-6">Check back soon as the community creates more artwork.</p>
              <Link 
                href="/child-home"
                className="btn-primary inline-flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </ChildLayout>
  )
}