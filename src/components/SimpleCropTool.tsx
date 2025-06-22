'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { RotateCw, Crop, Check, X, Move } from 'lucide-react'

interface SimpleCropToolProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
  onCropComplete: (croppedFile: File) => void
}

export default function SimpleCropTool({ isOpen, imageUrl, onClose, onCropComplete }: SimpleCropToolProps) {
  const [rotation, setRotation] = useState(0)
  const [cropArea, setCropArea] = useState({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 })

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  useEffect(() => {
    const updateImageSize = () => {
      const image = imageRef.current
      const container = containerRef.current
      if (image && container && image.complete) {
        const containerRect = container.getBoundingClientRect()
        const imageRect = image.getBoundingClientRect()
        setImageSize({ 
          width: imageRect.width, 
          height: imageRect.height,
          offsetX: imageRect.left - containerRect.left,
          offsetY: imageRect.top - containerRect.top
        })
      }
    }
    
    updateImageSize()
    window.addEventListener('resize', updateImageSize)
    return () => window.removeEventListener('resize', updateImageSize)
  }, [imageUrl, rotation])

  const handleImageLoad = () => {
    const image = imageRef.current
    const container = containerRef.current
    if (image && container) {
      const containerRect = container.getBoundingClientRect()
      const imageRect = image.getBoundingClientRect()
      setImageSize({ 
        width: imageRect.width, 
        height: imageRect.height,
        offsetX: imageRect.left - containerRect.left,
        offsetY: imageRect.top - containerRect.top
      })
    }
  }

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    setIsDragging(true)
    setDragHandle(handle)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragHandle || imageSize.width === 0) return

    const deltaX = (e.clientX - dragStart.x) / imageSize.width
    const deltaY = (e.clientY - dragStart.y) / imageSize.height

    setCropArea(prev => {
      let newArea = { ...prev }

      switch (dragHandle) {
        case 'move':
          newArea.x = Math.max(0, Math.min(1 - prev.width, prev.x + deltaX))
          newArea.y = Math.max(0, Math.min(1 - prev.height, prev.y + deltaY))
          break
        case 'tl':
          newArea.x = Math.max(0, Math.min(prev.x + prev.width - 0.1, prev.x + deltaX))
          newArea.y = Math.max(0, Math.min(prev.y + prev.height - 0.1, prev.y + deltaY))
          newArea.width = Math.max(0.1, prev.width - deltaX)
          newArea.height = Math.max(0.1, prev.height - deltaY)
          break
        case 'tr':
          newArea.y = Math.max(0, Math.min(prev.y + prev.height - 0.1, prev.y + deltaY))
          newArea.width = Math.max(0.1, Math.min(1 - prev.x, prev.width + deltaX))
          newArea.height = Math.max(0.1, prev.height - deltaY)
          break
        case 'bl':
          newArea.x = Math.max(0, Math.min(prev.x + prev.width - 0.1, prev.x + deltaX))
          newArea.width = Math.max(0.1, prev.width - deltaX)
          newArea.height = Math.max(0.1, Math.min(1 - prev.y, prev.height + deltaY))
          break
        case 'br':
          newArea.width = Math.max(0.1, Math.min(1 - prev.x, prev.width + deltaX))
          newArea.height = Math.max(0.1, Math.min(1 - prev.y, prev.height + deltaY))
          break
      }

      return newArea
    })

    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragHandle, dragStart, imageSize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragHandle(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleCrop = useCallback(async () => {
    const canvas = canvasRef.current
    const image = imageRef.current
    
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Calculate crop dimensions
    const naturalWidth = image.naturalWidth
    const naturalHeight = image.naturalHeight
    
    const cropX = Math.floor(cropArea.x * naturalWidth)
    const cropY = Math.floor(cropArea.y * naturalHeight)
    const cropWidth = Math.floor(cropArea.width * naturalWidth)
    const cropHeight = Math.floor(cropArea.height * naturalHeight)

    // Set canvas size to crop dimensions
    canvas.width = cropWidth
    canvas.height = cropHeight

    // Apply rotation and crop
    ctx.save()
    
    if (rotation !== 0) {
      // For rotation, we need to handle the crop differently
      ctx.translate(cropWidth / 2, cropHeight / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      
      // Draw the cropped and rotated image
      ctx.drawImage(
        image,
        cropX, cropY, cropWidth, cropHeight,
        -cropWidth / 2, -cropHeight / 2, cropWidth, cropHeight
      )
    } else {
      // Simple crop without rotation
      ctx.drawImage(
        image,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      )
    }
    
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
  }, [rotation, cropArea, onCropComplete])

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
        <div ref={containerRef} className="relative max-w-full max-h-full">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full max-h-96 rounded-lg select-none"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease'
            }}
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            draggable={false}
          />
          
          {/* Crop Overlay - Fixed positioning */}
          {imageSize.width > 0 && (
            <div 
              className="absolute pointer-events-none"
              style={{
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
            >              
              {/* Crop area */}
              <div
                className="absolute border-2 border-white bg-transparent pointer-events-auto cursor-move"
                style={{
                  left: `${cropArea.x * 100}%`,
                  top: `${cropArea.y * 100}%`,
                  width: `${cropArea.width * 100}%`,
                  height: `${cropArea.height * 100}%`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
              >
                {/* Corner handles */}
                <div
                  className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 cursor-nw-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'tl')
                  }}
                />
                <div
                  className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 cursor-ne-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'tr')
                  }}
                />
                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 cursor-sw-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'bl')
                  }}
                />
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 cursor-se-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'br')
                  }}
                />
                
                {/* Move indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <Move className="h-6 w-6 text-white opacity-60" />
                </div>
              </div>
            </div>
          )}
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
          onClick={() => setCropArea({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 })}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-full hover:bg-blue-600 transition-colors"
        >
          <Crop className="h-5 w-5" />
          Reset
        </button>
        
        <button
          onClick={handleCrop}
          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600 transition-colors font-bold"
        >
          <Check className="h-5 w-5" />
          Crop & Use
        </button>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}