/**
 * Utility for compositing artwork images with decorative frames
 */

export interface FrameCompositionOptions {
  frameId: string
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

export async function applyFrameToImage(
  imageFile: File, 
  frameId: string, 
  options: Omit<FrameCompositionOptions, 'frameId'> = {}
): Promise<File> {
  const { quality = 0.9, maxWidth = 2048, maxHeight = 2048 } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        // Calculate dimensions maintaining aspect ratio
        let { width, height } = img
        const aspectRatio = width / height
        
        if (width > maxWidth) {
          width = maxWidth
          height = width / aspectRatio
        }
        if (height > maxHeight) {
          height = maxHeight
          width = height * aspectRatio
        }

        // Add frame padding (20% of smaller dimension)
        const framePadding = Math.min(width, height) * 0.1
        const canvasWidth = width + (framePadding * 2)
        const canvasHeight = height + (framePadding * 2)

        // Create canvas for composition
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        canvas.width = canvasWidth
        canvas.height = canvasHeight

        // Create frame background based on frameId
        createFrameBackground(ctx, canvasWidth, canvasHeight, frameId)

        // Draw the artwork image in the center
        ctx.drawImage(
          img,
          framePadding,
          framePadding,
          width,
          height
        )

        // Add frame overlay effects
        addFrameOverlay(ctx, canvasWidth, canvasHeight, frameId)

        // Convert to blob and create file
        canvas.toBlob((blob) => {
          if (blob) {
            const framedFile = new File([blob], `framed-artwork-${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(framedFile)
          } else {
            reject(new Error('Failed to create framed image'))
          }
        }, 'image/jpeg', quality)

      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(imageFile)
  })
}

function createFrameBackground(ctx: CanvasRenderingContext2D, width: number, height: number, frameId: string) {
  const centerX = width / 2
  const centerY = height / 2
  
  switch (frameId) {
    case 'gold-ornate':
      // Gold gradient background
      const goldGradient = ctx.createLinearGradient(0, 0, width, height)
      goldGradient.addColorStop(0, '#d4af37')
      goldGradient.addColorStop(0.5, '#ffd700')
      goldGradient.addColorStop(1, '#b8860b')
      ctx.fillStyle = goldGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'silver-modern':
      // Silver gradient
      const silverGradient = ctx.createLinearGradient(0, 0, width, height)
      silverGradient.addColorStop(0, '#e5e5e5')
      silverGradient.addColorStop(0.5, '#c0c0c0')
      silverGradient.addColorStop(1, '#a8a8a8')
      ctx.fillStyle = silverGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'wood-rustic':
      // Wood texture background
      const woodGradient = ctx.createLinearGradient(0, 0, width, height)
      woodGradient.addColorStop(0, '#8b4513')
      woodGradient.addColorStop(0.5, '#a0522d')
      woodGradient.addColorStop(1, '#cd853f')
      ctx.fillStyle = woodGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'rainbow-gradient':
      // Rainbow gradient
      const rainbowGradient = ctx.createLinearGradient(0, 0, width, height)
      rainbowGradient.addColorStop(0, '#ff0000')
      rainbowGradient.addColorStop(0.16, '#ff8000')
      rainbowGradient.addColorStop(0.33, '#ffff00')
      rainbowGradient.addColorStop(0.5, '#00ff00')
      rainbowGradient.addColorStop(0.66, '#0080ff')
      rainbowGradient.addColorStop(0.83, '#8000ff')
      rainbowGradient.addColorStop(1, '#ff0080')
      ctx.fillStyle = rainbowGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'space-stars':
      // Space background with stars
      const spaceGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2)
      spaceGradient.addColorStop(0, '#16213e')
      spaceGradient.addColorStop(1, '#1a1a2e')
      ctx.fillStyle = spaceGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add stars
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 2 + 0.5
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case 'underwater-bubbles':
      // Underwater gradient
      const waterGradient = ctx.createLinearGradient(0, 0, 0, height)
      waterGradient.addColorStop(0, '#4facfe')
      waterGradient.addColorStop(0.5, '#00f2fe')
      waterGradient.addColorStop(1, '#0093e9')
      ctx.fillStyle = waterGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add bubbles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 8 + 2
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    default:
      // Museum white (default)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      break
  }
}

function addFrameOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, frameId: string) {
  // Add inner shadow for depth
  const shadowSize = Math.min(width, height) * 0.05
  
  // Create inner shadow gradient
  const shadowGradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) / 2 - shadowSize,
    width / 2, height / 2, Math.min(width, height) / 2
  )
  shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)')
  
  ctx.fillStyle = shadowGradient
  ctx.fillRect(0, 0, width, height)

  // Frame-specific overlays
  switch (frameId) {
    case 'glitter-sparkle':
      // Add glitter effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.random() * Math.PI * 2)
        ctx.fillRect(-2, -0.5, 4, 1)
        ctx.fillRect(-0.5, -2, 1, 4)
        ctx.restore()
      }
      break

    case 'paint-splatter':
      // Add paint splatters
      const colors = ['#ff6b6b', '#4ecdc4', '#f9ca24', '#6c5ce7', '#fd79a8']
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 5 + 2
        const color = colors[Math.floor(Math.random() * colors.length)]
        
        ctx.fillStyle = color + '80' // Add transparency
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      break
  }
}

export function getFramePreviewStyle(frameId: string): string {
  // Map frame IDs to CSS classes for preview
  const frameClassMap: Record<string, string> = {
    'gold-ornate': 'frame-gold-ornate',
    'silver-modern': 'frame-silver-modern',
    'wood-rustic': 'frame-wood-rustic',
    'museum-white': 'frame-museum-white',
    'rainbow-gradient': 'frame-rainbow-gradient',
    'crayon-texture': 'frame-crayon-texture',
    'paint-splatter': 'frame-paint-splatter',
    'glitter-sparkle': 'frame-glitter-sparkle',
    'space-stars': 'frame-space-stars',
    'underwater-bubbles': 'frame-underwater-bubbles',
    'flower-garden': 'frame-flower-garden',
    'geometric-modern': 'frame-geometric-modern',
    'autumn-leaves': 'frame-autumn-leaves',
    'winter-snowflakes': 'frame-winter-snowflakes',
    'spring-flowers': 'frame-spring-flowers',
    'summer-sun': 'frame-summer-sun'
  }
  
  return frameClassMap[frameId] || 'frame-museum-white'
}