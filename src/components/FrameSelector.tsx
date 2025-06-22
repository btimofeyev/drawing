'use client'

import { useState } from 'react'
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { frameTemplates, getFramesByCategory, type FrameTemplate } from '@/types/frames'

interface FrameSelectorProps {
  isOpen: boolean
  imageUrl: string
  currentFrameId?: string
  onClose: () => void
  onFrameSelect: (frameId: string) => void
}

const categories = [
  { id: 'classic', name: 'Classic', icon: '🖼️' },
  { id: 'fun', name: 'Fun', icon: '🎨' },
  { id: 'themed', name: 'Themed', icon: '🌟' },
  { id: 'seasonal', name: 'Seasonal', icon: '🌸' }
] as const

export default function FrameSelector({ 
  isOpen, 
  imageUrl, 
  currentFrameId = 'museum-white',
  onClose, 
  onFrameSelect 
}: FrameSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<FrameTemplate['category']>('classic')
  const [selectedFrameId, setSelectedFrameId] = useState(currentFrameId)
  const [previewFrameId, setPreviewFrameId] = useState(currentFrameId)

  const categoryFrames = getFramesByCategory(selectedCategory)

  const handleFrameClick = (frameId: string) => {
    setSelectedFrameId(frameId)
    setPreviewFrameId(frameId)
  }

  const handleConfirm = () => {
    onFrameSelect(selectedFrameId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 flex-shrink-0">
        <h2 className="text-white text-xl font-bold">Choose Your Frame</h2>
        <button
          onClick={onClose}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Preview Section - Mobile optimized */}
        <div className="h-48 md:h-64 lg:flex-1 flex items-center justify-center p-4 lg:p-6 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="relative h-full flex items-center justify-center">
            <div className={`artwork-frame ${frameTemplates.find(f => f.id === previewFrameId)?.cssClass || 'frame-museum-white'}`} style={{ maxHeight: '100%', maxWidth: '100%' }}>
              <img 
                src={imageUrl} 
                alt="Artwork preview" 
                className="max-w-full max-h-full rounded object-contain"
                style={{ maxHeight: '180px' }}
              />
            </div>
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <span className="text-white text-xs md:text-sm font-medium bg-black/60 px-2 py-1 rounded-full">
              {frameTemplates.find(f => f.id === previewFrameId)?.name || 'Classic Frame'}
            </span>
          </div>
        </div>

        {/* Frame Selection Panel */}
        <div className="flex-1 bg-white flex flex-col min-h-0">
          {/* Category Tabs */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-1 p-2 md:p-3 text-center font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="text-base md:text-lg mb-1">{category.icon}</div>
                <div className="text-xs md:text-sm">{category.name}</div>
              </button>
            ))}
          </div>

          {/* Frame Grid */}
          <div className="flex-1 p-3 md:p-4 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2 md:gap-3">
              {categoryFrames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => handleFrameClick(frame.id)}
                  className={`group relative bg-gray-100 rounded-lg md:rounded-xl p-2 md:p-3 transition-all duration-200 touch-manipulation ${
                    selectedFrameId === frame.id
                      ? 'ring-2 md:ring-4 ring-pink-500 bg-pink-50'
                      : 'hover:bg-gray-200 active:bg-gray-200'
                  }`}
                >
                  {/* Frame Preview */}
                  <div className={`artwork-frame ${frame.cssClass} mb-2`} style={{ padding: '4px' }}>
                    <div className="w-full h-10 md:h-12 lg:h-14 bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center">
                      <span className="text-sm md:text-lg lg:text-xl">{frame.preview}</span>
                    </div>
                  </div>
                  
                  {/* Frame Info */}
                  <div className="text-center">
                    <h3 className="font-bold text-xs md:text-sm text-gray-800 mb-1 leading-tight line-clamp-1">{frame.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-1 md:line-clamp-2 leading-tight hidden md:block">{frame.description}</p>
                  </div>

                  {/* Selection Indicator */}
                  {selectedFrameId === frame.id && (
                    <div className="absolute top-1 md:top-2 right-1 md:right-2 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <Check className="h-2 w-2 md:h-3 md:w-3 lg:h-4 lg:w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-3 md:px-4 border border-gray-300 text-gray-700 rounded-lg md:rounded-xl font-medium hover:bg-gray-50 active:bg-gray-50 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 px-3 md:px-4 bg-pink-500 text-white rounded-lg md:rounded-xl font-bold hover:bg-pink-600 active:bg-pink-600 transition-colors text-sm md:text-base"
              >
                Apply Frame
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}