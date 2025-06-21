'use client'

import { useEffect, useCallback } from 'react'
import { X, Heart, Eye, User, Calendar, Palette } from 'lucide-react'

interface ImageViewerProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  thumbnailUrl?: string
  altText: string
  artistName: string
  artistUsername: string
  likes: number
  views: number
  createdAt: string
  promptTitle: string
  promptDescription: string
  timeSlot: 'daily_1' | 'daily_2' | 'free_draw'
  difficulty: 'easy' | 'medium' | 'hard'
  ageGroup: 'kids' | 'tweens' | 'preschoolers'
  isLiked: boolean
  isOwnPost: boolean
  onLike: () => void
}

export default function ImageViewer({
  isOpen,
  onClose,
  imageUrl,
  altText,
  artistName,
  artistUsername,
  likes,
  views,
  createdAt,
  promptTitle,
  promptDescription,
  timeSlot,
  difficulty,
  ageGroup,
  isLiked,
  isOwnPost,
  onLike
}: ImageViewerProps) {
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

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

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-6xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Image section */}
          <div className="flex-1 bg-black flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
            <img
              src={imageUrl}
              alt={altText}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${getSlotColor(timeSlot)}`}>
                {getSlotEmoji(timeSlot)} {timeSlot === 'daily_1' ? 'Challenge 1' : timeSlot === 'daily_2' ? 'Challenge 2' : 'Free Draw'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                difficulty === 'easy' 
                  ? 'bg-green-100 text-green-700'
                  : difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {difficulty === 'easy' ? '🟢' : difficulty === 'medium' ? '🟡' : '🔴'} {difficulty}
              </span>
            </div>
          </div>

          {/* Info section */}
          <div className="w-full lg:w-96 p-6 lg:p-8 overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">{altText}</h2>
            
            {/* Artist info */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{artistName}</p>
                <p className="text-sm text-slate-600">@{artistUsername}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                ageGroup === 'kids' ? 'bg-blue-100 text-blue-700' : ageGroup === 'tweens' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
              }`}>
                {ageGroup}
              </span>
            </div>

            {/* Prompt info */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6">
              <h3 className="font-bold text-slate-700 mb-2">🎯 Challenge Prompt</h3>
              <p className="font-medium text-slate-800 mb-1">{promptTitle}</p>
              <p className="text-sm text-slate-600">{promptDescription}</p>
            </div>

            {/* Stats and actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={onLike}
                  disabled={isOwnPost}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    isOwnPost
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : isLiked
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-red-500 hover:text-white'
                  }`}
                  title={isOwnPost ? 'You cannot like your own artwork' : ''}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{likes}</span>
                </button>
                
                <div className="flex items-center gap-2 text-blue-600">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">{views}</span>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>{new Date(createdAt).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}