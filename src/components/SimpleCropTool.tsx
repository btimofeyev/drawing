'use client'

import { useState, useRef, useCallback } from 'react'
import { RotateCw, Crop, Check, X } from 'lucide-react'

interface SimpleCropToolProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
  onCropComplete: (croppedFile: File) => void
}

export default function SimpleCropTool({ isOpen, imageUrl, onClose, onCropComplete }: SimpleCropToolProps) {
  const [rotation, setRotation] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleCrop = useCallback(async () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight

    // Apply rotation
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)
    ctx.restore()

    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `cropped-artwork-${Date.now()}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        })
        onCropComplete(file)
      }
    }, 'image/jpeg', 0.9)
  }, [rotation, onCropComplete])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h3 className="text-white text-lg font-bold">Adjust Your Photo</h3>
        <button
          onClick={onClose}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Image Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative max-w-full max-h-full">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full max-h-full rounded-lg"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
            crossOrigin="anonymous"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 p-6 bg-black/50">
        <button
          onClick={handleRotate}
          className="flex items-center gap-2 bg-white/20 text-white px-4 py-3 rounded-full hover:bg-white/30 transition-colors"
        >
          <RotateCw className="h-5 w-5" />
          Rotate
        </button>
        
        <button
          onClick={handleCrop}
          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors font-bold"
        >
          <Check className="h-5 w-5" />
          Use Photo
        </button>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}