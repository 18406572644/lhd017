export interface CompressOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  quality?: number
}

export function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxSizeMB = 2,
    maxWidthOrHeight = 1920,
    quality = 0.8,
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = (height / width) * maxWidthOrHeight
            width = maxWidthOrHeight
          } else {
            width = (width / height) * maxWidthOrHeight
            height = maxWidthOrHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        let currentQuality = quality
        let result = canvas.toDataURL('image/jpeg', currentQuality)

        const maxSizeBytes = maxSizeMB * 1024 * 1024
        while (result.length > maxSizeBytes && currentQuality > 0.1) {
          currentQuality -= 0.1
          result = canvas.toDataURL('image/jpeg', currentQuality)
        }

        resolve(result)
      }
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
