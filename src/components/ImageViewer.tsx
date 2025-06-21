'use client'

import { useEffect, useCallback } from 'react'
import { X, Heart } from 'lucide-react'

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


  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all duration-200"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        {/* Artwork Image */}
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-full max-h-full object-contain"
        />
        
        {/* Like button - floating bottom center */}
        {!isOwnPost && (
          <button
            onClick={onLike}
            className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg transition-all duration-200 shadow-lg ${
              isLiked
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>
        )}
      </div>
    </div>
  )
}