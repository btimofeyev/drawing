'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, 
  Search, 
  Grid3X3, 
  List,
  Eye,
  Calendar,
  User,
  Palette,
  LoaderIcon,
  Filter
} from 'lucide-react'
import ChildLayout from '@/components/ChildLayout'
import ImageViewer from '@/components/ImageViewer'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Artwork {
  id: string
  imageUrl: string
  thumbnailUrl?: string
  altText: string
  artistName: string
  artistUsername: string
  likes: number
  views: number
  createdAt: string
  promptId: string
  promptTitle: string
  promptDescription: string
  timeSlot: 'daily_1' | 'daily_2' | 'free_draw'
  difficulty: 'easy' | 'medium' | 'hard'
  ageGroup: 'kids' | 'tweens'
  isLiked: boolean
  isOwnPost: boolean
}

type SortOption = 'newest' | 'popular' | 'trending' | 'oldest'
type ViewMode = 'grid' | 'list'

function GalleryContent() {
  const searchParams = useSearchParams()
  
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  
  // Filters from URL params or defaults
  const [timeSlot, setTimeSlot] = useState<'daily_1' | 'daily_2' | 'free_draw' | 'all'>(
    (searchParams?.get('slot') as any) || 'all'
  )
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    // Reset and fetch with new filters
    setArtworks([])
    setHasMore(true)
    fetchArtworks(0, true)
  }, [timeSlot, difficulty, searchQuery, sortBy, dateFilter])

  const fetchArtworks = async (offset = 0, reset = false) => {
    try {
      if (offset === 0) setIsLoading(true)
      else setIsLoadingMore(true)

      const params = new URLSearchParams({
        limit: '20',
        offset: offset.toString(),
        sort: sortBy,
        date: dateFilter
      })

      if (timeSlot !== 'all') params.append('slot', timeSlot)
      if (difficulty !== 'all') params.append('difficulty', difficulty)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/gallery?${params}`)
      if (!response.ok) throw new Error('Failed to fetch artworks')

      const data = await response.json()
      
      if (reset) {
        setArtworks(data.artworks)
      } else {
        setArtworks(prev => [...prev, ...data.artworks])
      }
      
      setTotalCount(data.pagination.total)
      setHasMore(data.pagination.hasMore)
    } catch (error) {
      console.error('Failed to load artworks:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const handleLike = async (artworkId: string) => {
    // Check if user is trying to like their own post
    const artwork = artworks.find(a => a.id === artworkId)
    if (artwork?.isOwnPost) {
      // Don't show error for self-posts, just do nothing
      return
    }

    // Optimistic update
    setArtworks(prev => prev.map(artwork => 
      artwork.id === artworkId 
        ? { 
            ...artwork, 
            isLiked: !artwork.isLiked,
            likes: artwork.isLiked ? artwork.likes - 1 : artwork.likes + 1
          }
        : artwork
    ))

    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId: artworkId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Like failed:', errorData.error)
        
        // Revert optimistic update on error
        setArtworks(prev => prev.map(artwork => 
          artwork.id === artworkId 
            ? { 
                ...artwork, 
                isLiked: !artwork.isLiked,
                likes: artwork.isLiked ? artwork.likes + 1 : artwork.likes - 1
              }
            : artwork
        ))
        return
      }

      const data = await response.json()
      
      // Update with server response
      setArtworks(prev => prev.map(artwork => 
        artwork.id === artworkId 
          ? { 
              ...artwork, 
              isLiked: data.isLiked,
              likes: data.likesCount
            }
          : artwork
      ))
    } catch (error) {
      console.error('Like request failed:', error)
      
      // Revert optimistic update on error
      setArtworks(prev => prev.map(artwork => 
        artwork.id === artworkId 
          ? { 
              ...artwork, 
              isLiked: !artwork.isLiked,
              likes: artwork.isLiked ? artwork.likes + 1 : artwork.likes - 1
            }
          : artwork
      ))
    }
  }

  const handleView = async (artwork: Artwork) => {
    // Open the image viewer
    setSelectedArtwork(artwork)
    
    // Track the view
    try {
      const response = await fetch('/api/posts/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ postId: artwork.id })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update view count in local state
        setArtworks(prev => prev.map(a => 
          a.id === artwork.id 
            ? { ...a, views: data.viewsCount }
            : a
        ))
        
        // Update selected artwork if it's still open
        if (selectedArtwork?.id === artwork.id) {
          setSelectedArtwork(prev => prev ? { ...prev, views: data.viewsCount } : null)
        }
      }
    } catch (error) {
      console.error('View tracking failed:', error)
    }
  }

  const handleCardClick = (artwork: Artwork) => {
    // Open image viewer when card is clicked (for mobile)
    handleView(artwork)
  }

  const getSlotColor = (slot: 'daily_1' | 'daily_2' | 'free_draw') => {
    switch (slot) {
      case 'daily_1': return 'from-orange-400 to-yellow-500'
      case 'daily_2': return 'from-blue-400 to-cyan-500'
      case 'free_draw': return 'from-purple-400 to-pink-500'
      default: return 'from-gray-400 to-gray-500'
    }
  }

  const getSlotEmoji = (slot: 'daily_1' | 'daily_2' | 'free_draw') => {
    switch (slot) {
      case 'daily_1': return '🎯'
      case 'daily_2': return '⭐'
      case 'free_draw': return '🎨'
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
            <p className="text-xl font-semibold text-slate-700">Loading amazing artwork... 🎨</p>
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
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 text-slate-800 leading-tight">
              Community
              <br />
              <span className="text-pink-400">Art Gallery</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Discover amazing artwork created by young artists from today's challenges!
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl p-6 mb-8 shadow-lg border border-slate-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search artworks, artists, or prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 text-lg transition-all duration-200"
                  />
                </div>
              </div>
              
              {/* Time Slot Filter */}
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value as any)}
                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 font-medium transition-all duration-200"
              >
                <option value="all">🎨 All Time Slots</option>
                <option value="daily_1">🎯 Challenge 1</option>
                <option value="daily_2">⭐ Challenge 2</option>
                <option value="free_draw">🎨 Free Draw</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 font-medium transition-all duration-200"
              >
                <option value="all">🎯 All Levels</option>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 font-medium transition-all duration-200"
              >
                <option value="newest">🕒 Newest</option>
                <option value="popular">❤️ Most Liked</option>
                <option value="trending">📈 Trending</option>
                <option value="oldest">📅 Oldest</option>
              </select>

              {/* View Mode Toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 border-2 border-slate-200 rounded-2xl hover:border-slate-300 transition-colors"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(timeSlot !== 'all' || difficulty !== 'all' || searchQuery) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Filter className="h-4 w-4" />
                <span>Active filters:</span>
                {timeSlot !== 'all' && (
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full font-medium">
                    {getSlotEmoji(timeSlot as any)} {timeSlot === 'daily_1' ? 'Challenge 1' : timeSlot === 'daily_2' ? 'Challenge 2' : 'Free Draw'}
                  </span>
                )}
                {difficulty !== 'all' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {difficulty === 'easy' ? '🟢' : difficulty === 'medium' ? '🟡' : '🔴'} {difficulty}
                  </span>
                )}
                {searchQuery && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                    "{searchQuery}"
                  </span>
                )}
                <button
                  onClick={() => {
                    setTimeSlot('all')
                    setDifficulty('all')
                    setSearchQuery('')
                  }}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium hover:bg-red-200 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800">
              {totalCount} Amazing Artworks
            </h2>
          </div>

          {/* Gallery */}
          {artworks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100">
                <Search className="h-12 w-12 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">No artworks found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your filters to discover more amazing art!</p>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {artworks.map((artwork, index) => (
                  <div
                    key={artwork.id}
                    className={`group bg-white rounded-3xl shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                    style={{animationDelay: `${index * 0.05}s`}}
                    onClick={(e) => {
                      // Only handle click if not clicking on a button
                      if ((e.target as HTMLElement).closest('button')) return
                      handleCardClick(artwork)
                    }}
                  >
                    {/* Image */}
                    <div className={`relative overflow-hidden ${
                      viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-[4/3]'
                    }`}>
                      {artwork.thumbnailUrl || artwork.imageUrl ? (
                        <img
                          src={artwork.thumbnailUrl || artwork.imageUrl}
                          alt={artwork.altText}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                          <Palette className="h-16 w-16 text-pink-300" />
                        </div>
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(artwork.id)
                            }}
                            disabled={artwork.isOwnPost}
                            className={`p-3 rounded-full transition-all duration-200 ${
                              artwork.isOwnPost
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : artwork.isLiked 
                                ? 'bg-red-500 text-white scale-110' 
                                : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                            }`}
                            title={artwork.isOwnPost ? 'You cannot like your own artwork' : ''}
                          >
                            <Heart className={`h-5 w-5 ${artwork.isLiked ? 'fill-current' : ''}`} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleView(artwork)
                            }}
                            className="p-3 bg-white/90 text-gray-700 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-200"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-pink-600 transition-colors">
                          {artwork.altText}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600 mb-3">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{artwork.artistName}</span>
                          <span className="text-slate-400">@{artwork.artistUsername}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            artwork.ageGroup === 'kids' ? 'bg-blue-100 text-blue-700' : artwork.ageGroup === 'tweens' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {artwork.ageGroup}
                          </span>
                        </div>

                        {/* Challenge and Difficulty Tags */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getSlotColor(artwork.timeSlot)}`}>
                            {getSlotEmoji(artwork.timeSlot)} {artwork.timeSlot === 'daily_1' ? 'Challenge 1' : artwork.timeSlot === 'daily_2' ? 'Challenge 2' : 'Free Draw'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            artwork.difficulty === 'easy' 
                              ? 'bg-green-100 text-green-700'
                              : artwork.difficulty === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {artwork.difficulty === 'easy' ? '🟢' : artwork.difficulty === 'medium' ? '🟡' : '🔴'} {artwork.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(artwork.id)
                            }}
                            disabled={artwork.isOwnPost}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 lg:pointer-events-none lg:px-0 lg:py-0 lg:bg-transparent ${
                              artwork.isOwnPost
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed lg:bg-transparent'
                                : artwork.isLiked
                                ? 'bg-red-100 text-red-600 lg:bg-transparent lg:text-red-500'
                                : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 lg:bg-transparent lg:text-red-500 lg:hover:bg-transparent'
                            }`}
                            title={artwork.isOwnPost ? 'You cannot like your own artwork' : ''}
                          >
                            <Heart className={`h-4 w-4 ${artwork.isLiked ? 'fill-current' : ''}`} />
                            <span className="font-semibold">{artwork.likes}</span>
                          </button>
                          <div className="flex items-center gap-1 text-blue-500">
                            <Eye className="h-4 w-4" />
                            <span className="font-semibold">{artwork.views || 0}</span>
                          </div>
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(artwork.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => fetchArtworks(artworks.length)}
                    disabled={isLoadingMore}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center gap-2">
                        <LoaderIcon className="h-5 w-5 animate-spin" />
                        Loading more...
                      </div>
                    ) : (
                      'Load More Artwork'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Image Viewer Modal */}
      {selectedArtwork && (
        <ImageViewer
          isOpen={!!selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          imageUrl={selectedArtwork.imageUrl}
          thumbnailUrl={selectedArtwork.thumbnailUrl}
          altText={selectedArtwork.altText}
          artistName={selectedArtwork.artistName}
          artistUsername={selectedArtwork.artistUsername}
          likes={selectedArtwork.likes}
          views={selectedArtwork.views}
          createdAt={selectedArtwork.createdAt}
          promptTitle={selectedArtwork.promptTitle}
          promptDescription={selectedArtwork.promptDescription}
          timeSlot={selectedArtwork.timeSlot}
          difficulty={selectedArtwork.difficulty}
          ageGroup={selectedArtwork.ageGroup}
          isLiked={selectedArtwork.isLiked}
          isOwnPost={selectedArtwork.isOwnPost}
          onLike={() => {
            handleLike(selectedArtwork.id)
            // Update selected artwork state
            setSelectedArtwork(prev => prev ? {
              ...prev,
              isLiked: !prev.isLiked,
              likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
            } : null)
          }}
        />
      )}
    </ChildLayout>
  )
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <ChildLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <Palette className="h-8 w-8 text-white" />
            </div>
            <p className="text-xl font-semibold text-slate-700">Loading gallery...</p>
          </div>
        </div>
      </ChildLayout>
    }>
      <GalleryContent />
    </Suspense>
  )
}