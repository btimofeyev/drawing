export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  initialQuality?: number
  preserveExif?: boolean
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 5,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
  initialQuality: 0.9,
  preserveExif: false
}

export async function compressImage(
  file: File, 
  options: CompressionOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<File> {
  try {
    const imageCompression = (await import('browser-image-compression')).default
    const mergedOptions = { ...DEFAULT_COMPRESSION_OPTIONS, ...options }
    return await imageCompression(file, mergedOptions)
  } catch (error) {
    console.error('Image compression failed, using original:', error)
    return file
  }
}