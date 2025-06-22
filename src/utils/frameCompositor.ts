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
      // Gold gradient background - matching CSS frame-gold-ornate
      const goldGradient = ctx.createLinearGradient(0, 0, width, height)
      goldGradient.addColorStop(0, '#d4af37')
      goldGradient.addColorStop(0.5, '#ffd700')
      goldGradient.addColorStop(1, '#b8860b')
      ctx.fillStyle = goldGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add ornate pattern to match CSS
      ctx.strokeStyle = '#daa520'
      ctx.lineWidth = 2
      for (let i = 0; i < width; i += 8) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + 4, height)
        ctx.stroke()
      }
      break

    case 'silver-modern':
      // Silver gradient - matching CSS frame-silver-modern
      const silverGradient = ctx.createLinearGradient(0, 0, width, height)
      silverGradient.addColorStop(0, '#c0c0c0')
      silverGradient.addColorStop(0.5, '#e5e5e5')
      silverGradient.addColorStop(1, '#a8a8a8')
      ctx.fillStyle = silverGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'wood-rustic':
      // Wood texture background - matching CSS frame-wood-rustic
      const woodGradient = ctx.createLinearGradient(0, 0, width, height)
      woodGradient.addColorStop(0, '#8b4513')
      woodGradient.addColorStop(0.5, '#a0522d')
      woodGradient.addColorStop(1, '#cd853f')
      ctx.fillStyle = woodGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add wood grain effect
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.7)'
      ctx.lineWidth = 1
      for (let y = 0; y < height; y += 6) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      break

    case 'rainbow-gradient':
      // Rainbow gradient - matching CSS frame-rainbow-gradient
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
      // Space background with stars - matching CSS frame-space-stars
      const spaceGradient = ctx.createLinearGradient(0, 0, width, height)
      spaceGradient.addColorStop(0, '#1a1a2e')
      spaceGradient.addColorStop(0.5, '#16213e')
      spaceGradient.addColorStop(1, '#0f3460')
      ctx.fillStyle = spaceGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add stars to match CSS pattern
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 1.5 + 0.5
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      // Add yellow stars
      ctx.fillStyle = '#ffff00'
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 1 + 0.5
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case 'underwater-bubbles':
      // Underwater gradient - matching CSS frame-underwater-bubbles
      const waterGradient = ctx.createLinearGradient(0, 0, 0, height)
      waterGradient.addColorStop(0, '#4facfe')
      waterGradient.addColorStop(0.5, '#00f2fe')
      waterGradient.addColorStop(1, '#0093e9')
      ctx.fillStyle = waterGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add bubbles with varied opacity to match CSS
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 6 + 1
        const opacity = Math.random() * 0.3 + 0.2
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case 'crayon-texture':
      // Crayon-like texture - matching CSS frame-crayon-texture
      const crayonGradient = ctx.createLinearGradient(0, 0, width, height)
      crayonGradient.addColorStop(0, '#ff6b6b')
      crayonGradient.addColorStop(0.2, '#4ecdc4')
      crayonGradient.addColorStop(0.4, '#45b7d1')
      crayonGradient.addColorStop(0.6, '#f9ca24')
      crayonGradient.addColorStop(0.8, '#f0932b')
      crayonGradient.addColorStop(1, '#eb4d4b')
      ctx.fillStyle = crayonGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add striped texture to match CSS
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 4
      for (let i = 0; i < width; i += 12) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, height)
        ctx.stroke()
      }
      break

    case 'flower-garden':
      // Pastel garden background - matching CSS frame-flower-garden
      const gardenGradient = ctx.createLinearGradient(0, 0, width, height)
      gardenGradient.addColorStop(0, '#ff9a9e')
      gardenGradient.addColorStop(0.5, '#fecfef')
      gardenGradient.addColorStop(1, '#ff9a9e')
      ctx.fillStyle = gardenGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add flower dots to match CSS pattern
      ctx.fillStyle = 'rgba(255, 105, 180, 0.3)'
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case 'geometric-modern':
      // Geometric pattern background - matching CSS frame-geometric-modern
      const geometricGradient = ctx.createLinearGradient(0, 0, width, height)
      geometricGradient.addColorStop(0, '#667eea')
      geometricGradient.addColorStop(1, '#764ba2')
      ctx.fillStyle = geometricGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add geometric lines to match CSS
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 2
      for (let i = 0; i < width; i += 16) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + 8, height)
        ctx.stroke()
      }
      break

    case 'autumn-leaves':
      // Autumn gradient - matching CSS frame-autumn-leaves
      const autumnGradient = ctx.createLinearGradient(0, 0, width, height)
      autumnGradient.addColorStop(0, '#ff6b35')
      autumnGradient.addColorStop(0.33, '#f7931e')
      autumnGradient.addColorStop(0.66, '#ffcc02')
      autumnGradient.addColorStop(1, '#c13584')
      ctx.fillStyle = autumnGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add leaf shapes to match CSS
      ctx.fillStyle = 'rgba(210, 105, 30, 0.4)'
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 8 + 4
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.random() * Math.PI * 2)
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.lineTo(size, size)
        ctx.lineTo(-size, size)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      break

    case 'winter-snowflakes':
      // Winter gradient - matching CSS frame-winter-snowflakes
      const winterGradient = ctx.createLinearGradient(0, 0, 0, height)
      winterGradient.addColorStop(0, '#e3f2fd')
      winterGradient.addColorStop(0.5, '#bbdefb')
      winterGradient.addColorStop(1, '#90caf9')
      ctx.fillStyle = winterGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add snowflakes to match CSS
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      for (let i = 0; i < 25; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 3 + 1
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      // Smaller snowflakes
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 1.5 + 0.5
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case 'spring-flowers':
      // Spring gradient - matching CSS frame-spring-flowers
      const springGradient = ctx.createLinearGradient(0, 0, width, height)
      springGradient.addColorStop(0, '#a8e6cf')
      springGradient.addColorStop(0.33, '#dcedc1')
      springGradient.addColorStop(0.66, '#ffd3a5')
      springGradient.addColorStop(1, '#fd9853')
      ctx.fillStyle = springGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add flower dots to match CSS
      ctx.fillStyle = 'rgba(255, 105, 180, 0.4)'
      for (let i = 0; i < 8; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      }
      for (let i = 0; i < 6; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        ctx.beginPath()
        ctx.arc(x, y, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case 'summer-sun':
      // Summer gradient - matching CSS frame-summer-sun
      const summerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2)
      summerGradient.addColorStop(0, '#ffd54f')
      summerGradient.addColorStop(0.5, '#ffca28')
      summerGradient.addColorStop(1, '#ffb300')
      ctx.fillStyle = summerGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add radial stripes to match CSS
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.lineWidth = 2
      for (let i = 0; i < height; i += 10) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(width, i)
        ctx.stroke()
      }
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


    case 'halloween-spooky':
      // Halloween orange and black - matching CSS frame-halloween-spooky
      const halloweenGradient = ctx.createLinearGradient(0, 0, width, height)
      halloweenGradient.addColorStop(0, '#2d1b19')
      halloweenGradient.addColorStop(0.33, '#4a2c2a')
      halloweenGradient.addColorStop(0.66, '#8b4513')
      halloweenGradient.addColorStop(1, '#cd853f')
      ctx.fillStyle = halloweenGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add spooky dots to match CSS
      const spookyColors = ['rgba(255, 140, 0, 0.6)', 'rgba(255, 69, 0, 0.5)', 'rgba(139, 69, 19, 0.7)']
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 6 + 2
        const color = spookyColors[Math.floor(Math.random() * spookyColors.length)]
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
      break

    case 'paint-splatter':
      // Paint splatter - matching CSS frame-paint-splatter
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      break

    case 'glitter-sparkle':
      // Glitter sparkle - matching CSS frame-glitter-sparkle
      const glitterGradient = ctx.createLinearGradient(0, 0, width, height)
      glitterGradient.addColorStop(0, '#ffd700')
      glitterGradient.addColorStop(0.25, '#ffff00')
      glitterGradient.addColorStop(0.5, '#ff69b4')
      glitterGradient.addColorStop(0.75, '#00ffff')
      glitterGradient.addColorStop(1, '#ffd700')
      ctx.fillStyle = glitterGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'neon-glow':
      // Neon glow - matching CSS frame-neon-glow
      const neonGradient = ctx.createLinearGradient(0, 0, width, height)
      neonGradient.addColorStop(0, '#00ffff')
      neonGradient.addColorStop(0.25, '#ff00ff')
      neonGradient.addColorStop(0.5, '#ffff00')
      neonGradient.addColorStop(0.75, '#00ff00')
      neonGradient.addColorStop(1, '#00ffff')
      ctx.fillStyle = neonGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'candy-stripes':
      // Candy stripes - matching CSS frame-candy-stripes
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      
      // Add diagonal candy stripes
      const stripeColors = ['#ff6b9d', '#ffffff', '#4ecdc4', '#ffffff']
      const candyStripeWidth = 24
      ctx.save()
      for (let i = -height; i < width + height; i += candyStripeWidth) {
        const colorIndex = Math.floor((i + height) / candyStripeWidth) % stripeColors.length
        ctx.fillStyle = stripeColors[colorIndex]
        ctx.save()
        ctx.translate(i, 0)
        ctx.rotate(Math.PI / 4)
        ctx.fillRect(0, -height, candyStripeWidth, width + height * 2)
        ctx.restore()
      }
      ctx.restore()
      break

    case 'jungle-adventure':
      // Jungle adventure - matching CSS frame-jungle-adventure
      const jungleGradient = ctx.createLinearGradient(0, 0, width, height)
      jungleGradient.addColorStop(0, '#2d5016')
      jungleGradient.addColorStop(0.33, '#3e6b1c')
      jungleGradient.addColorStop(0.66, '#4f7c23')
      jungleGradient.addColorStop(1, '#6b8e2a')
      ctx.fillStyle = jungleGradient
      ctx.fillRect(0, 0, width, height)
      break

    case 'medieval-castle':
      // Medieval castle - matching CSS frame-medieval-castle
      const castleGradient = ctx.createLinearGradient(0, 0, width, height)
      castleGradient.addColorStop(0, '#8b4513')
      castleGradient.addColorStop(0.33, '#a0522d')
      castleGradient.addColorStop(0.66, '#cd853f')
      castleGradient.addColorStop(1, '#daa520')
      ctx.fillStyle = castleGradient
      ctx.fillRect(0, 0, width, height)
      
      // Add stone texture blocks
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)'
      ctx.lineWidth = 1
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      for (let x = 0; x < width; x += 16) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      break

    case 'museum-white':
    default:
      // Museum white - matching CSS frame-museum-white
      const whiteGradient = ctx.createLinearGradient(0, 0, width, height)
      whiteGradient.addColorStop(0, '#ffffff')
      whiteGradient.addColorStop(0.5, '#f8f8f8')
      whiteGradient.addColorStop(1, '#eeeeee')
      ctx.fillStyle = whiteGradient
      ctx.fillRect(0, 0, width, height)
      break
  }
}

function addFrameOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, frameId: string) {
  // Frame-specific overlays to match CSS effects
  switch (frameId) {
    case 'glitter-sparkle':
      // Add glitter sparkles to match CSS animation
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      for (let i = 0; i < 25; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 3 + 1
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.random() * Math.PI * 2)
        ctx.fillRect(-size, -size/4, size*2, size/2)
        ctx.fillRect(-size/4, -size, size/2, size*2)
        ctx.restore()
      }
      break

    case 'paint-splatter':
      // Add paint splatters to match CSS ::before pseudo-element
      const splatColors = ['#ff6b6b', '#4ecdc4', '#f9ca24', '#6c5ce7', '#fd79a8']
      for (let i = 0; i < 12; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const radius = Math.random() * 4 + 1
        const color = splatColors[Math.floor(Math.random() * splatColors.length)]
        
        ctx.fillStyle = color
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