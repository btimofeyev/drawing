/**
 * Canvas memory management utilities
 * Helps prevent memory leaks in canvas operations
 */

export function createManagedCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  cleanup: () => void
} {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Canvas context not available')
  }
  
  canvas.width = width
  canvas.height = height
  
  const cleanup = () => {
    // Force canvas to release memory
    canvas.width = 0
    canvas.height = 0
    // Clear any remaining context references
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  
  return { canvas, ctx, cleanup }
}

export function cleanupImageUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export function cleanupCanvas(canvas: HTMLCanvasElement) {
  canvas.width = 0
  canvas.height = 0
}

export async function imageToCanvas(
  imageFile: File, 
  maxWidth: number = 2048, 
  maxHeight: number = 2048
): Promise<{ canvas: HTMLCanvasElement; cleanup: () => void }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const imageUrl = URL.createObjectURL(imageFile)
    
    const cleanup = () => {
      URL.revokeObjectURL(imageUrl)
      img.src = ''
      img.onload = null
      img.onerror = null
    }
    
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
        
        const { canvas, ctx, cleanup: canvasCleanup } = createManagedCanvas(width, height)
        
        // Draw image to canvas
        ctx.drawImage(img, 0, 0, width, height)
        
        cleanup() // Clean up image resources
        
        resolve({ 
          canvas, 
          cleanup: canvasCleanup
        })
      } catch (error) {
        cleanup()
        reject(error)
      }
    }
    
    img.onerror = () => {
      cleanup()
      reject(new Error('Failed to load image'))
    }
    
    img.src = imageUrl
  })
}