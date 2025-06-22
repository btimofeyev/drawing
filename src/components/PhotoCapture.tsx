'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, RotateCcw, Check, X, RefreshCw, Crop, Frame } from 'lucide-react'
import SimpleCropTool from './SimpleCropTool'
import FrameSelector from './FrameSelector'
import { applyFrameToImage } from '@/utils/frameCompositor'
import { compressImage } from '@/utils/imageCompression'

interface PhotoCaptureProps {
  isOpen: boolean
  onClose: () => void
  onPhotoSelected: (file: File) => void
}

export default function PhotoCapture({ isOpen, onClose, onPhotoSelected }: PhotoCaptureProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [showCropTool, setShowCropTool] = useState(false)
  const [showFrameSelector, setShowFrameSelector] = useState(false)
  const [selectedFrameId, setSelectedFrameId] = useState('museum-white')
  const [isApplyingFrame, setIsApplyingFrame] = useState(false)
  const [hasFrame, setHasFrame] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalFileRef = useRef<File | null>(null)
  const unframedFileRef = useRef<File | null>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    const optimizedFile = await compressImage(file)
    originalFileRef.current = optimizedFile
    unframedFileRef.current = optimizedFile
    
    const url = URL.createObjectURL(optimizedFile)
    setCapturedPhoto(url)
    setHasFrame(false)
  }, [])

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }


  const handleRetake = () => {
    setCapturedPhoto(null)
    originalFileRef.current = null
    unframedFileRef.current = null
    setHasFrame(false)
    fileInputRef.current?.click()
  }

  const handleUsePhoto = () => {
    if (originalFileRef.current) {
      onPhotoSelected(originalFileRef.current)
      onClose()
      // Cleanup
      setCapturedPhoto(null)
      originalFileRef.current = null
      unframedFileRef.current = null
    }
  }

  const handleCropComplete = async (croppedFile: File) => {
    const optimizedFile = await compressImage(croppedFile)
    originalFileRef.current = optimizedFile
    unframedFileRef.current = optimizedFile
    
    const url = URL.createObjectURL(optimizedFile)
    setCapturedPhoto(url)
    setShowCropTool(false)
    setHasFrame(false)
  }

  const handleFrameSelect = async (frameId: string) => {
    if (!unframedFileRef.current || hasFrame) return
    
    setIsApplyingFrame(true)
    setSelectedFrameId(frameId)
    
    try {
      // Always apply frame to the unframed version
      const framedFile = await applyFrameToImage(unframedFileRef.current, frameId)
      originalFileRef.current = framedFile
      
      const url = URL.createObjectURL(framedFile)
      setCapturedPhoto(url)
      setShowFrameSelector(false)
      setHasFrame(true)
    } catch (error) {
      console.error('Failed to apply frame:', error)
    } finally {
      setIsApplyingFrame(false)
    }
  }

  const handleClose = () => {
    // Cleanup URLs
    if (capturedPhoto) URL.revokeObjectURL(capturedPhoto)
    
    setCapturedPhoto(null)
    setShowCropTool(false)
    setShowFrameSelector(false)
    setSelectedFrameId('museum-white')
    setIsApplyingFrame(false)
    setHasFrame(false)
    originalFileRef.current = null
    unframedFileRef.current = null
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-4xl mx-auto p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">
            {capturedPhoto ? 'Perfect Your Photo' : 'Capture Your Artwork'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {!capturedPhoto ? (
          // Camera Interface
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-8">
              <Camera className="h-16 w-16 text-white" />
            </div>
            
            <h3 className="text-white text-2xl font-bold mb-4">Ready to capture your masterpiece?</h3>
            <p className="text-white/80 text-lg mb-8 max-w-md">
              Take a photo of your drawing, painting, or any artwork you've created!
            </p>

            <div className="bg-white/10 rounded-2xl p-6 mb-8 max-w-md">
              <h4 className="text-white font-bold mb-3">📸 Photo Tips</h4>
              <ul className="text-white/90 text-sm space-y-2 text-left">
                <li>• Make sure your artwork is well-lit</li>
                <li>• Hold your device steady</li>
                <li>• Fill the frame with your artwork</li>
                <li>• Avoid shadows and glare</li>
              </ul>
            </div>

            {/* Camera Button */}
            <button
              onClick={handleCameraClick}
              className="w-20 h-20 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform duration-200 shadow-xl mb-6"
            >
              <Camera className="h-8 w-8 text-gray-800" />
            </button>

            <p className="text-white/60 text-sm">Tap to take a photo</p>

            {/* Hidden file input with camera capture */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
              className="hidden"
            />
          </div>
        ) : (
          // Photo Preview & Enhancement
          <div className="flex-1 flex flex-col">
            {/* Image Preview */}
            <div className="flex-1 flex items-center justify-center mb-6">
              <div className="relative max-w-full max-h-full">
                <img 
                  src={capturedPhoto} 
                  alt="Captured artwork" 
                  className="max-w-full max-h-96 rounded-lg"
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="bg-white/10 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-white/90 text-sm">
                  💡 <strong>Tip:</strong> Use crop to remove backgrounds and frames to make your artwork pop!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={handleRetake}
                className="bg-white/20 text-white px-4 py-3 rounded-full font-bold hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                <span className="hidden sm:inline">Retake</span>
              </button>

              <button
                onClick={() => setShowCropTool(true)}
                className="bg-blue-500 text-white px-4 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Crop className="h-5 w-5" />
                <span className="hidden sm:inline">Crop</span>
              </button>

              <button
                onClick={() => setShowFrameSelector(true)}
                disabled={isApplyingFrame || hasFrame}
                className={`${hasFrame ? 'bg-green-500 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600'} text-white px-4 py-3 rounded-full font-bold transition-colors flex items-center gap-2 disabled:opacity-50`}
              >
                {isApplyingFrame ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Frame className="h-5 w-5" />
                )}
                <span className="hidden sm:inline">{hasFrame ? 'Framed ✓' : 'Frame'}</span>
              </button>
              
              <button
                onClick={handleUsePhoto}
                className="bg-green-500 text-white px-5 py-3 rounded-full font-bold hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                <span className="text-sm font-bold">Use Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Crop Tool */}
      {capturedPhoto && (
        <SimpleCropTool
          isOpen={showCropTool}
          imageUrl={capturedPhoto}
          onClose={() => setShowCropTool(false)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Frame Selector */}
      {capturedPhoto && (
        <FrameSelector
          isOpen={showFrameSelector}
          imageUrl={capturedPhoto}
          currentFrameId={selectedFrameId}
          onClose={() => setShowFrameSelector(false)}
          onFrameSelect={handleFrameSelect}
        />
      )}
    </div>
  )
}