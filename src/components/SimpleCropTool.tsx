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

  const handleTouchStart = (e: React.TouchEvent, handle: string) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    setDragHandle(handle)
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragHandle || imageSize.width === 0) return

    // Calculate movement relative to image size
    const deltaX = (e.clientX - dragStart.x) / imageSize.width
    const deltaY = (e.clientY - dragStart.y) / imageSize.height

    setCropArea(prev => {
      let newArea = { ...prev }

      switch (dragHandle) {
        case 'move':
          // Move the entire crop area
          newArea.x = Math.max(0, Math.min(1 - prev.width, prev.x + deltaX))
          newArea.y = Math.max(0, Math.min(1 - prev.height, prev.y + deltaY))
          break
          
        case 'tl':
          // Top-left corner: adjust x, y, width, height
          const newX = Math.max(0, Math.min(prev.x + prev.width - 0.05, prev.x + deltaX))
          const newY = Math.max(0, Math.min(prev.y + prev.height - 0.05, prev.y + deltaY))
          newArea.x = newX
          newArea.y = newY
          newArea.width = prev.x + prev.width - newX
          newArea.height = prev.y + prev.height - newY
          break
          
        case 'tr':
          // Top-right corner: adjust y, width, height
          const newY2 = Math.max(0, Math.min(prev.y + prev.height - 0.05, prev.y + deltaY))
          newArea.y = newY2
          newArea.width = Math.max(0.05, Math.min(1 - prev.x, prev.width + deltaX))
          newArea.height = prev.y + prev.height - newY2
          break
          
        case 'bl':
          // Bottom-left corner: adjust x, width, height
          const newX2 = Math.max(0, Math.min(prev.x + prev.width - 0.05, prev.x + deltaX))
          newArea.x = newX2
          newArea.width = prev.x + prev.width - newX2
          newArea.height = Math.max(0.05, Math.min(1 - prev.y, prev.height + deltaY))
          break
          
        case 'br':
          // Bottom-right corner: adjust width, height
          newArea.width = Math.max(0.05, Math.min(1 - prev.x, prev.width + deltaX))
          newArea.height = Math.max(0.05, Math.min(1 - prev.y, prev.height + deltaY))
          break
          
        // Edge handles for dragging lines
        case 'top':
          // Top edge: adjust y and height
          const newYTop = Math.max(0, Math.min(prev.y + prev.height - 0.05, prev.y + deltaY))
          newArea.y = newYTop
          newArea.height = prev.y + prev.height - newYTop
          break
          
        case 'bottom':
          // Bottom edge: adjust height only
          newArea.height = Math.max(0.05, Math.min(1 - prev.y, prev.height + deltaY))
          break
          
        case 'left':
          // Left edge: adjust x and width
          const newXLeft = Math.max(0, Math.min(prev.x + prev.width - 0.05, prev.x + deltaX))
          newArea.x = newXLeft
          newArea.width = prev.x + prev.width - newXLeft
          break
          
        case 'right':
          // Right edge: adjust width only
          newArea.width = Math.max(0.05, Math.min(1 - prev.x, prev.width + deltaX))
          break
      }

      return newArea
    })

    // Update drag start position for next move
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragHandle, dragStart, imageSize])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragHandle || imageSize.width === 0) return

    const touch = e.touches[0]
    // Calculate movement relative to image size
    const deltaX = (touch.clientX - dragStart.x) / imageSize.width
    const deltaY = (touch.clientY - dragStart.y) / imageSize.height

    setCropArea(prev => {
      let newArea = { ...prev }

      switch (dragHandle) {
        case 'move':
          // Move the entire crop area
          newArea.x = Math.max(0, Math.min(1 - prev.width, prev.x + deltaX))
          newArea.y = Math.max(0, Math.min(1 - prev.height, prev.y + deltaY))
          break
          
        case 'tl':
          // Top-left corner: adjust x, y, width, height
          const newX = Math.max(0, Math.min(prev.x + prev.width - 0.05, prev.x + deltaX))
          const newY = Math.max(0, Math.min(prev.y + prev.height - 0.05, prev.y + deltaY))
          newArea.x = newX
          newArea.y = newY
          newArea.width = prev.x + prev.width - newX
          newArea.height = prev.y + prev.height - newY
          break
          
        case 'tr':
          // Top-right corner: adjust y, width, height
          const newY2 = Math.max(0, Math.min(prev.y + prev.height - 0.05, prev.y + deltaY))
          newArea.y = newY2
          newArea.width = Math.max(0.05, Math.min(1 - prev.x, prev.width + deltaX))
          newArea.height = prev.y + prev.height - newY2
          break
          
        case 'bl':
          // Bottom-left corner: adjust x, width, height
          const newX2 = Math.max(0, Math.min(prev.x + prev.width - 0.05, prev.x + deltaX))
          newArea.x = newX2
          newArea.width = prev.x + prev.width - newX2
          newArea.height = Math.max(0.05, Math.min(1 - prev.y, prev.height + deltaY))
          break
          
        case 'br':
          // Bottom-right corner: adjust width, height
          newArea.width = Math.max(0.05, Math.min(1 - prev.x, prev.width + deltaX))
          newArea.height = Math.max(0.05, Math.min(1 - prev.y, prev.height + deltaY))
          break
          
        // Edge handles for dragging lines
        case 'top':
          // Top edge: adjust y and height
          const newYTop = Math.max(0, Math.min(prev.y + prev.height - 0.05, prev.y + deltaY))
          newArea.y = newYTop
          newArea.height = prev.y + prev.height - newYTop
          break
          
        case 'bottom':
          // Bottom edge: adjust height only
          newArea.height = Math.max(0.05, Math.min(1 - prev.y, prev.height + deltaY))
          break
          
        case 'left':
          // Left edge: adjust x and width
          const newXLeft = Math.max(0, Math.min(prev.x + prev.width - 0.05, prev.x + deltaX))
          newArea.x = newXLeft
          newArea.width = prev.x + prev.width - newXLeft
          break
          
        case 'right':
          // Right edge: adjust width only
          newArea.width = Math.max(0.05, Math.min(1 - prev.x, prev.width + deltaX))
          break
      }

      return newArea
    })

    // Update drag start position for next move
    setDragStart({ x: touch.clientX, y: touch.clientY })
  }, [isDragging, dragHandle, dragStart, imageSize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragHandle(null)
  }, [])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setDragHandle(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

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
                onTouchStart={(e) => handleTouchStart(e, 'move')}
              >
                {/* Corner handles - larger and more visible */}
                <div
                  className="absolute -top-3 -left-3 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize shadow-lg hover:scale-110 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'tl')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart(e, 'tl')
                  }}
                />
                <div
                  className="absolute -top-3 -right-3 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize shadow-lg hover:scale-110 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'tr')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart(e, 'tr')
                  }}
                />
                <div
                  className="absolute -bottom-3 -left-3 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize shadow-lg hover:scale-110 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'bl')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart(e, 'bl')
                  }}
                />
                <div
                  className="absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-se-resize shadow-lg hover:scale-110 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'br')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart(e, 'br')
                  }}
                />
                
                {/* Edge handles for dragging lines - more prominent */}
                {/* Top edge */}
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-white border-2 border-blue-500 rounded-full cursor-n-resize shadow-lg hover:scale-110 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'top')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart(e, 'top')
                  }}
                />
                {/* Bottom edge */}
                <div
                  className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-white border-2 border-blue-500 rounded-full cursor-s-resize shadow-lg hover:scale-110 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'bottom')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart(e, 'bottom')
                  }}
                />
                {/* Left edge */}
                <div
                  className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white border-2 border-blue-500 rounded-full cursor-w-resize shadow-lg hover:scale-110 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'left')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart(e, 'left')
                  }}
                />
                {/* Right edge */}
                <div
                  className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white border-2 border-blue-500 rounded-full cursor-e-resize shadow-lg hover:scale-110 transition-transform"
                  onMouseDown={(e) => {
                    e.stopPropagation()
                    handleMouseDown(e, 'right')
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation()
                    handleTouchStart(e, 'right')
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