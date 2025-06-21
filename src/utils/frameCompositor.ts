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

        // Add frame padding (12% of smaller dimension)
        const framePadding = Math.min(width, height) * 0.12
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

        // Add inner border for better frame visibility
        ctx.strokeStyle = getFrameBorderColor(frameId)
        ctx.lineWidth = Math.min(width, height) * 0.02
        ctx.strokeRect(
          framePadding - ctx.lineWidth / 2,
          framePadding - ctx.lineWidth / 2,
          width + ctx.lineWidth,
          height + ctx.lineWidth
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

    case 'crayon-texture':
      // Crayon-like texture with bright colors
      const crayonColors = ['#ff6b6b', '#4ecdc4', '#f9ca24', '#fd79a8', '#6c5ce7']
      ctx.fillStyle = '#fffacd' // Light yellow background
      ctx.fillRect(0, 0, width, height)
      
      // Add crayon strokes
      for (let i = 0; i < 20; i++) {
        const color = crayonColors[Math.floor(Math.random() * crayonColors.length)]
        ctx.strokeStyle = color
        ctx.lineWidth = Math.random() * 10 + 5
        ctx.globalAlpha = 0.3
        ctx.beginPath()
        ctx.moveTo(Math.random() * width, 0)
        ctx.lineTo(Math.random() * width, height)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      break

    case 'flower-garden':
      // Pastel garden background
      const gardenGradient = ctx.createLinearGradient(0, 0, width, height)
      gardenGradient.addColorStop(0, '#ffb3c6')
      gardenGradient.addColorStop(0.5, '#fff0f3')
      gardenGradient.addColorStop(1, '#c9ada7')
      ctx.fillStyle = gardenGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'geometric-modern':
      // Geometric pattern background
      ctx.fillStyle = '#2d3436'
      ctx.fillRect(0, 0, width, height)
      
      // Add geometric shapes
      const geometricColors = ['#00b894', '#e17055', '#fdcb6e', '#6c5ce7']
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = geometricColors[i % geometricColors.length] + '40'
        const size = Math.random() * 100 + 50
        ctx.save()
        ctx.translate(Math.random() * width, Math.random() * height)
        ctx.rotate(Math.random() * Math.PI)
        ctx.fillRect(-size/2, -size/2, size, size)
        ctx.restore()
      }
      break

    case 'autumn-leaves':
      // Autumn gradient
      const autumnGradient = ctx.createLinearGradient(0, 0, width, height)
      autumnGradient.addColorStop(0, '#d35400')
      autumnGradient.addColorStop(0.5, '#e67e22')
      autumnGradient.addColorStop(1, '#f39c12')
      ctx.fillStyle = autumnGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'winter-snowflakes':
      // Winter gradient
      const winterGradient = ctx.createLinearGradient(0, 0, 0, height)
      winterGradient.addColorStop(0, '#e3f2fd')
      winterGradient.addColorStop(0.5, '#bbdefb')
      winterGradient.addColorStop(1, '#90caf9')
      ctx.fillStyle = winterGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'spring-flowers':
      // Spring gradient
      const springGradient = ctx.createLinearGradient(0, 0, width, height)
      springGradient.addColorStop(0, '#f8bbd0')
      springGradient.addColorStop(0.5, '#e1bee7')
      springGradient.addColorStop(1, '#c5cae9')
      ctx.fillStyle = springGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'summer-sun':
      // Summer gradient
      const summerGradient = ctx.createRadialGradient(width * 0.7, height * 0.3, 0, width * 0.7, height * 0.3, Math.max(width, height))
      summerGradient.addColorStop(0, '#fff59d')
      summerGradient.addColorStop(0.5, '#ffeb3b')
      summerGradient.addColorStop(1, '#ffc107')
      ctx.fillStyle = summerGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'bronze-vintage':
      // Bronze vintage gradient
      const bronzeGradient = ctx.createLinearGradient(0, 0, width, height)
      bronzeGradient.addColorStop(0, '#cd7f32')
      bronzeGradient.addColorStop(0.5, '#b8860b')
      bronzeGradient.addColorStop(1, '#8b4513')
      ctx.fillStyle = bronzeGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'black-elegant':
      // Elegant black with subtle gradient
      const blackGradient = ctx.createLinearGradient(0, 0, width, height)
      blackGradient.addColorStop(0, '#2c2c2c')
      blackGradient.addColorStop(0.5, '#1a1a1a')
      blackGradient.addColorStop(1, '#000000')
      ctx.fillStyle = blackGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'neon-glow':
      // Dark background for neon effect
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, width, height)
      break

    case 'candy-stripes':
      // White base for stripes
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      
      // Add diagonal candy stripes
      const stripeWidth = 20
      const colors = ['#ff69b4', '#00bfff', '#32cd32', '#ffd700', '#ff4500']
      ctx.save()
      for (let i = 0; i < width + height; i += stripeWidth * 2) {
        const colorIndex = Math.floor(i / (stripeWidth * 2)) % colors.length
        ctx.fillStyle = colors[colorIndex]
        ctx.save()
        ctx.translate(i, 0)
        ctx.rotate(Math.PI / 4)
        ctx.fillRect(-height, -height, stripeWidth, width + height * 2)
        ctx.restore()
      }
      ctx.restore()
      break

    case 'jungle-adventure':
      // Jungle green gradient
      const jungleGradient = ctx.createLinearGradient(0, 0, width, height)
      jungleGradient.addColorStop(0, '#228b22')
      jungleGradient.addColorStop(0.5, '#32cd32')
      jungleGradient.addColorStop(1, '#006400')
      ctx.fillStyle = jungleGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'medieval-castle':
      // Stone gray gradient
      const stoneGradient = ctx.createLinearGradient(0, 0, width, height)
      stoneGradient.addColorStop(0, '#708090')
      stoneGradient.addColorStop(0.5, '#556b2f')
      stoneGradient.addColorStop(1, '#2f4f4f')
      ctx.fillStyle = stoneGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'halloween-spooky':
      // Halloween orange and black
      const halloweenGradient = ctx.createLinearGradient(0, 0, width, height)
      halloweenGradient.addColorStop(0, '#ff8c00')
      halloweenGradient.addColorStop(0.5, '#ff4500')
      halloweenGradient.addColorStop(1, '#1a1a1a')
      ctx.fillStyle = halloweenGradient
      ctx.fillRect(0, 0, width, height)
      break


    default:
      // Museum white (default)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      break
  }
}

function addFrameOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, frameId: string) {
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

    case 'neon-glow':
      // Add neon glow effect
      ctx.shadowColor = '#00ffff'
      ctx.shadowBlur = 20
      ctx.strokeStyle = '#00ffff'
      ctx.lineWidth = 4
      ctx.strokeRect(10, 10, width - 20, height - 20)
      
      ctx.shadowColor = '#ff00ff'
      ctx.shadowBlur = 15
      ctx.strokeStyle = '#ff00ff'
      ctx.lineWidth = 2
      ctx.strokeRect(15, 15, width - 30, height - 30)
      
      ctx.shadowBlur = 0 // Reset shadow
      break

    case 'jungle-adventure':
      // Add tropical leaves
      ctx.fillStyle = 'rgba(34, 139, 34, 0.6)'
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 30 + 10
        
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.random() * Math.PI * 2)
        ctx.beginPath()
        ctx.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      break

    case 'halloween-spooky':
      // Add spooky bats
      ctx.fillStyle = '#1a1a1a'
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 15 + 5
        
        // Simple bat shape
        ctx.save()
        ctx.translate(x, y)
        ctx.beginPath()
        ctx.ellipse(-size/2, 0, size/3, size/6, -0.5, 0, Math.PI * 2)
        ctx.ellipse(size/2, 0, size/3, size/6, 0.5, 0, Math.PI * 2)
        ctx.ellipse(0, 0, size/8, size/4, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      break

    case 'bronze-vintage':
      // Add vintage patina spots
      ctx.fillStyle = 'rgba(101, 67, 33, 0.3)'
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 12 + 3
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case 'black-elegant':
      // Add subtle corner highlights
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'candy-stripes':
      // Add candy shine effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      for (let i = 0; i < width + height; i += 60) {
        ctx.save()
        ctx.translate(i, 0)
        ctx.rotate(Math.PI / 4)
        ctx.fillRect(0, -height, 5, width + height * 2)
        ctx.restore()
      }
      break

    case 'medieval-castle':
      // Add stone texture blocks
      ctx.fillStyle = 'rgba(169, 169, 169, 0.4)'
      const blockSize = 30
      for (let x = 0; x < width; x += blockSize) {
        for (let y = 0; y < height; y += blockSize) {
          if (Math.random() > 0.7) {
            ctx.strokeStyle = 'rgba(105, 105, 105, 0.6)'
            ctx.lineWidth = 1
            ctx.strokeRect(x, y, blockSize, blockSize)
          }
        }
      }
      break

  }
}

function getFrameBorderColor(frameId: string): string {
  switch (frameId) {
    case 'gold-ornate':
      return '#b8860b'
    case 'silver-modern':
      return '#808080'
    case 'wood-rustic':
      return '#654321'
    case 'museum-white':
      return '#e0e0e0'
    case 'rainbow-gradient':
      return '#ff00ff'
    case 'crayon-texture':
      return '#ff6b6b'
    case 'paint-splatter':
      return '#333333'
    case 'glitter-sparkle':
      return '#ff69b4'
    case 'space-stars':
      return '#4a4a6a'
    case 'underwater-bubbles':
      return '#0066cc'
    case 'flower-garden':
      return '#ff69b4'
    case 'geometric-modern':
      return '#00b894'
    case 'autumn-leaves':
      return '#d35400'
    case 'winter-snowflakes':
      return '#90caf9'
    case 'spring-flowers':
      return '#f8bbd0'
    case 'summer-sun':
      return '#ffc107'
    case 'bronze-vintage':
      return '#cd7f32'
    case 'black-elegant':
      return '#404040'
    case 'neon-glow':
      return '#00ffff'
    case 'candy-stripes':
      return '#ff69b4'
    case 'jungle-adventure':
      return '#228b22'
    case 'medieval-castle':
      return '#708090'
    case 'halloween-spooky':
      return '#ff8c00'
    default:
      return '#cccccc'
  }
}

export function getFramePreviewStyle(frameId: string): string {
  // Map frame IDs to CSS classes for preview
  const frameClassMap: Record<string, string> = {
    'gold-ornate': 'frame-gold-ornate',
    'silver-modern': 'frame-silver-modern',
    'wood-rustic': 'frame-wood-rustic',
    'museum-white': 'frame-museum-white',
    'bronze-vintage': 'frame-bronze-vintage',
    'black-elegant': 'frame-black-elegant',
    'rainbow-gradient': 'frame-rainbow-gradient',
    'crayon-texture': 'frame-crayon-texture',
    'paint-splatter': 'frame-paint-splatter',
    'glitter-sparkle': 'frame-glitter-sparkle',
    'neon-glow': 'frame-neon-glow',
    'candy-stripes': 'frame-candy-stripes',
    'space-stars': 'frame-space-stars',
    'underwater-bubbles': 'frame-underwater-bubbles',
    'flower-garden': 'frame-flower-garden',
    'geometric-modern': 'frame-geometric-modern',
    'jungle-adventure': 'frame-jungle-adventure',
    'medieval-castle': 'frame-medieval-castle',
    'autumn-leaves': 'frame-autumn-leaves',
    'winter-snowflakes': 'frame-winter-snowflakes',
    'spring-flowers': 'frame-spring-flowers',
    'summer-sun': 'frame-summer-sun',
    'halloween-spooky': 'frame-halloween-spooky'
  }
  
  return frameClassMap[frameId] || 'frame-museum-white'
}