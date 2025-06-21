'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { 
  Heart, 
  ArrowLeft, 
  Filter,
  Grid3X3,
  List,
  Camera,
  Users,
  Sparkles,
  Clock,
  TrendingUp,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import ChildLayout from '@/components/ChildLayout'
import ImageViewer from '@/components/ImageViewer'

interface Artwork {
  id: string
  imageUrl: string
  thumbnailUrl?: string
  altText: string
  createdAt: string
  likesCount: number
  isLiked: boolean
  isOwnPost: boolean
  artist: {
    username: string
    name: string
    avatarUrl?: string
    ageGroup: 'kids' | 'tweens'
  }
}

interface PromptDetails {
  id: string
  title: string
  description: string
  communityTitle: string
  emoji: string
  difficulty: 'medium'
  ageGroup: 'kids' | 'tweens'
  date: string
  promptType: 'shared_daily'
  stats: {
    totalPosts: number
    totalLikes: number
    popularityScore: number
    trendingScore: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

type SortOption = 'newest' | 'popular' | 'trending' | 'oldest'

export default function CommunityPromptPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const promptId = params.promptId as string
  
  const [prompt, setPrompt] = useState<PromptDetails | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState<Pagination | null>(null)
  
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (promptId) {
      fetchPromptAndArtwork()
    }
  }, [promptId, sortBy])

  const fetchPromptAndArtwork = async (page: number = 1) => {
    try {
      if (page === 1) {
        setIsLoading(true)
        setError('')
      } else {
        setIsLoadingMore(true)
      }

      const response = await fetch(
        `/api/community/prompt/${promptId}?page=${page}&limit=20&sort=${sortBy}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch community artwork')
      }

      const data = await response.json()
      
      if (page === 1) {
        setPrompt(data.prompt)
        setArtworks(data.posts)
      } else {
        setArtworks(prev => [...prev, ...data.posts])
      }
      
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch community artwork:', error)
      setError('Unable to load community artwork. Please try again!')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (pagination?.hasNext && !isLoadingMore) {
      fetchPromptAndArtwork(pagination.page + 1)
    }
  }

  const handleLike = async (artworkId: string) => {
    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: artworkId }),
      })

      if (response.ok) {
        const data = await response.json()
        setArtworks(prev => prev.map(artwork => 
          artwork.id === artworkId 
            ? { 
                ...artwork, 
                isLiked: data.liked, 
                likesCount: data.liked ? artwork.likesCount + 1 : artwork.likesCount - 1 
              }
            : artwork
        ))
      }
    } catch (error) {
      console.error('Failed to like artwork:', error)
    }
  }

  if (isLoading) {
    return (
      <ChildLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="icon-container purple mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
              <Users style={{width: '2rem', height: '2rem'}} />
            </div>
            <p className="text-xl font-semibold text-slate-700">Loading community artwork... 🎨</p>
          </div>
        </div>
      </ChildLayout>
    )
  }

  if (error || !prompt) {
    return (
      <ChildLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-red-600 mb-4">{error || 'Prompt not found'}</p>
            <Link 
              href="/child-home" 
              className="btn-primary inline-flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
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
                <h1 className="text-3xl font-bold text-slate-800">Community Gallery</h1>
                <p className="text-slate-600">See how everyone interpreted the same challenge!</p>
              </div>
            </div>

            {/* Prompt Details */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-xl p-6 text-white">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-5xl">{prompt.emoji}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{prompt.communityTitle}</h2>
                  <p className="text-lg opacity-95 mb-4">{prompt.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                      {prompt.stats.totalPosts} artists participated
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                      {prompt.stats.totalLikes} total likes
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                      {new Date(prompt.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Link 
                  href={`/create?promptId=${prompt.id}&type=shared_daily`}
                  className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2"
                >
                  <Camera size={20} />
                  Try This Challenge
                </Link>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-purple-500 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Grid3X3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-purple-500 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Liked</option>
                  <option value="trending">Trending</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Artwork Grid */}
          {artworks.length > 0 ? (
            <>
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
                  : "space-y-6"
              }>
                {artworks.map((artwork) => (
                  <div 
                    key={artwork.id}
                    className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
                      viewMode === 'list' ? 'flex gap-4 p-4' : ''
                    }`}
                  >
                    {/* Artwork Image */}
                    <div className={viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'}>
                      <img
                        src={artwork.thumbnailUrl || artwork.imageUrl}
                        alt={artwork.altText}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Artwork Info */}
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {artwork.artist.avatarUrl ? (
                            <img 
                              src={artwork.artist.avatarUrl} 
                              alt={artwork.artist.name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
                          )}
                          <span className="text-sm font-medium text-slate-700">
                            {artwork.artist.name}
                          </span>
                        </div>
                        {artwork.isOwnPost && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            Your Art
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {new Date(artwork.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleLike(artwork.id)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            artwork.isLiked 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Heart 
                            size={14} 
                            className={artwork.isLiked ? 'fill-current' : ''} 
                          />
                          {artwork.likesCount}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {pagination?.hasNext && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More Artwork'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="icon-container gray mx-auto mb-6" style={{width: '4rem', height: '4rem'}}>
                <Sparkles style={{width: '2rem', height: '2rem'}} />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No artwork yet!</h3>
              <p className="text-lg text-slate-600 mb-6">Be the first to create art for this challenge!</p>
              <Link 
                href={`/create?promptId=${prompt.id}&type=shared_daily`}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Camera size={20} />
                Create First Artwork
              </Link>
            </div>
          )}
        </div>
      </div>
    </ChildLayout>
  )
}