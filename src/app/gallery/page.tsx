'use client'

import { useState, useEffect } from 'react'
import { 
  Heart, 
  Filter, 
  Search, 
  Grid3X3, 
  List,
  ArrowLeft,
  Star,
  Trophy,
  Calendar,
  User,
  Palette,
  Eye,
  TrendingUp,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface Artwork {
  id: string
  title: string
  imageUrl: string
  thumbnailUrl: string
  artistName: string
  artistUsername: string
  likes: number
  views: number
  createdAt: string
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  challenge?: string
  isLiked: boolean
}

type SortOption = 'newest' | 'popular' | 'trending' | 'oldest'
type FilterOption = 'all' | 'easy' | 'medium' | 'hard'
type ViewMode = 'grid' | 'list'

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterBy, setFilterBy] = useState<FilterOption>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    // Mock data - in real app this would come from API
    const mockArtworks: Artwork[] = [
      {
        id: '1',
        title: 'Magical Rainbow Dragon',
        imageUrl: '/api/placeholder/400/300',
        thumbnailUrl: '/api/placeholder/200/150',
        artistName: 'Emma',
        artistUsername: 'rainbowartist',
        likes: 42,
        views: 128,
        createdAt: '2025-01-15',
        tags: ['dragon', 'rainbow', 'fantasy'],
        difficulty: 'medium',
        challenge: 'Fantasy Creatures',
        isLiked: false
      },
      {
        id: '2',
        title: 'My Dream Pet',
        imageUrl: '/api/placeholder/400/300',
        thumbnailUrl: '/api/placeholder/200/150',
        artistName: 'Alex',
        artistUsername: 'coolartist123',
        likes: 38,
        views: 95,
        createdAt: '2025-01-14',
        tags: ['pet', 'cute', 'colorful'],
        difficulty: 'easy',
        challenge: 'Dream Pets',
        isLiked: true
      },
      {
        id: '3',
        title: 'Space Adventure',
        imageUrl: '/api/placeholder/400/300',
        thumbnailUrl: '/api/placeholder/200/150',
        artistName: 'Sam',
        artistUsername: 'spaceexplorer',
        likes: 67,
        views: 203,
        createdAt: '2025-01-13',
        tags: ['space', 'rocket', 'planets'],
        difficulty: 'hard',
        challenge: 'Outer Space',
        isLiked: false
      },
      {
        id: '4',
        title: 'Underwater World',
        imageUrl: '/api/placeholder/400/300',
        thumbnailUrl: '/api/placeholder/200/150',
        artistName: 'Maya',
        artistUsername: 'oceanartist',
        likes: 29,
        views: 76,
        createdAt: '2025-01-12',
        tags: ['ocean', 'fish', 'underwater'],
        difficulty: 'medium',
        isLiked: false
      },
      {
        id: '5',
        title: 'Happy Sunflower Garden',
        imageUrl: '/api/placeholder/400/300',
        thumbnailUrl: '/api/placeholder/200/150',
        artistName: 'Lily',
        artistUsername: 'flowergirl',
        likes: 54,
        views: 142,
        createdAt: '2025-01-11',
        tags: ['flowers', 'garden', 'sunny'],
        difficulty: 'easy',
        challenge: 'Nature Walk',
        isLiked: true
      },
      {
        id: '6',
        title: 'Robot Friend',
        imageUrl: '/api/placeholder/400/300',
        thumbnailUrl: '/api/placeholder/200/150',
        artistName: 'Jordan',
        artistUsername: 'techkid',
        likes: 71,
        views: 189,
        createdAt: '2025-01-10',
        tags: ['robot', 'technology', 'friend'],
        difficulty: 'hard',
        challenge: 'Future World',
        isLiked: false
      }
    ]
    
    setArtworks(mockArtworks)
    setIsLoading(false)
  }, [])

  const handleLike = (artworkId: string) => {
    setArtworks(prev => prev.map(artwork => 
      artwork.id === artworkId 
        ? { 
            ...artwork, 
            isLiked: !artwork.isLiked,
            likes: artwork.isLiked ? artwork.likes - 1 : artwork.likes + 1
          }
        : artwork
    ))
  }

  const filteredAndSortedArtworks = artworks
    .filter(artwork => {
      const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           artwork.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           artwork.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesFilter = filterBy === 'all' || artwork.difficulty === filterBy
      
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.likes - a.likes
        case 'trending':
          return b.views - a.views
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 float"
               style={{background: 'var(--gradient-rainbow)'}}>
            <Palette className="h-8 w-8 text-white" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading amazing artwork... 🎨</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/child-home">
                <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{background: 'var(--gradient-secondary)'}}>
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Art Gallery</h1>
                  <p className="text-sm text-secondary-600">Explore amazing artwork from young artists</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-lg border border-primary-100">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artworks, artists, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary-200 focus:border-secondary-500 text-lg transition-all duration-200"
                />
              </div>
            </div>
            
            {/* Sort */}
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary-200 focus:border-secondary-500 font-medium transition-all duration-200"
              >
                <option value="newest">🕒 Newest</option>
                <option value="popular">❤️ Most Liked</option>
                <option value="trending">📈 Trending</option>
                <option value="oldest">📅 Oldest</option>
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-secondary-200 focus:border-secondary-500 font-medium transition-all duration-200"
              >
                <option value="all">🎨 All Levels</option>
                <option value="easy">🟢 Easy</option>
                <option value="medium">🟡 Medium</option>
                <option value="hard">🔴 Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredAndSortedArtworks.length} Amazing Artworks
          </h2>
          <div className="text-gray-600">
            Sorted by {sortBy === 'newest' ? '🕒 newest' : sortBy === 'popular' ? '❤️ most liked' : sortBy === 'trending' ? '📈 trending' : '📅 oldest'}
          </div>
        </div>

        {/* Gallery */}
        {filteredAndSortedArtworks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
                 style={{background: 'var(--gradient-accent)'}}>
              <Search className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No artworks found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters to find more amazing art!</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilterBy('all')
                setSortBy('newest')
              }}
              className="bg-accent-500 text-white font-bold py-3 px-8 rounded-2xl hover:bg-accent-600 hover:scale-105 transition-all duration-200"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredAndSortedArtworks.map((artwork, index) => (
              <div
                key={artwork.id}
                className={`group bg-white rounded-3xl shadow-lg border border-primary-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden bounce-in ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-[4/3]'
                }`}>
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <Palette className="h-16 w-16 text-primary-300" />
                  </div>
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleLike(artwork.id)}
                        className={`p-3 rounded-full transition-all duration-200 ${
                          artwork.isLiked 
                            ? 'bg-red-500 text-white scale-110' 
                            : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${artwork.isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-3 bg-white/90 text-gray-700 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-200">
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Difficulty badge */}
                  <div className="absolute top-3 left-3">
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
                  
                  {/* Challenge badge */}
                  {artwork.challenge && (
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        🎯 {artwork.challenge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {artwork.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{artwork.artistName}</span>
                        <span className="text-gray-400">@{artwork.artistUsername}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artwork.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-primary-100 hover:text-primary-700 transition-colors cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-red-500">
                        <Heart className={`h-4 w-4 ${artwork.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-semibold">{artwork.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-500">
                        <Eye className="h-4 w-4" />
                        <span className="font-semibold">{artwork.views}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(artwork.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}