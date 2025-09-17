import sharp from 'sharp'
import { readdir, stat, mkdir } from 'fs/promises'
import { join, extname, basename, dirname } from 'path'
import { existsSync } from 'fs'

interface CompressionOptions {
  quality: number
  effort: number
  lossless: boolean
}

interface CompressionStats {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  fileName: string
}

class ImageCompressor {
  private options: CompressionOptions
  private stats: CompressionStats[] = []

  constructor(
    options: CompressionOptions = {
      quality: 80,
      effort: 6,
      lossless: false,
    },
  ) {
    this.options = options
  }

  async compressImage(inputPath: string, outputPath: string): Promise<CompressionStats> {
    try {
      const originalStats = await stat(inputPath)
      const originalSize = originalStats.size

      // Ensure output directory exists
      const outputDir = dirname(outputPath)
      if (!existsSync(outputDir)) {
        await mkdir(outputDir, { recursive: true })
      }

      let sharpInstance = sharp(inputPath)

      // Convert to WebP with specified options
      if (this.options.lossless) {
        sharpInstance = sharpInstance.webp({
          lossless: true,
          effort: this.options.effort,
        })
      } else {
        sharpInstance = sharpInstance.webp({
          quality: this.options.quality,
          effort: this.options.effort,
        })
      }

      await sharpInstance.toFile(outputPath)

      const compressedStats = await stat(outputPath)
      const compressedSize = compressedStats.size
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100

      const stats: CompressionStats = {
        originalSize,
        compressedSize,
        compressionRatio,
        fileName: basename(inputPath),
      }

      this.stats.push(stats)
      return stats
    } catch (error) {
      console.error(`Error compressing ${inputPath}:`, error)
      throw error
    }
  }

  async compressDirectory(inputDir: string, outputDir: string): Promise<void> {
    try {
      const files = await readdir(inputDir)
      const pngFiles = files.filter((file) => extname(file).toLowerCase() === '.png')

      if (pngFiles.length === 0) {
        console.log('No PNG files found in the directory.')
        return
      }

      console.log(`Found ${pngFiles.length} PNG files to compress...`)
      console.log('')

      for (const file of pngFiles) {
        const inputPath = join(inputDir, file)
        const outputFileName = basename(file, '.png') + '.webp'
        const outputPath = join(outputDir, outputFileName)

        console.log(`Compressing: ${file} -> ${outputFileName}`)

        const stats = await this.compressImage(inputPath, outputPath)

        console.log(`  Original: ${this.formatBytes(stats.originalSize)}`)
        console.log(`  Compressed: ${this.formatBytes(stats.compressedSize)}`)
        console.log(`  Savings: ${stats.compressionRatio.toFixed(1)}%`)
        console.log('')
      }

      this.printSummary()
    } catch (error) {
      console.error('Error compressing directory:', error)
      throw error
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private printSummary(): void {
    if (this.stats.length === 0) return

    const totalOriginal = this.stats.reduce((sum, stat) => sum + stat.originalSize, 0)
    const totalCompressed = this.stats.reduce((sum, stat) => sum + stat.compressedSize, 0)
    const totalSavings = ((totalOriginal - totalCompressed) / totalOriginal) * 100

    console.log('='.repeat(50))
    console.log('COMPRESSION SUMMARY')
    console.log('='.repeat(50))
    console.log(`Total files processed: ${this.stats.length}`)
    console.log(`Total original size: ${this.formatBytes(totalOriginal)}`)
    console.log(`Total compressed size: ${this.formatBytes(totalCompressed)}`)
    console.log(`Total space saved: ${this.formatBytes(totalOriginal - totalCompressed)}`)
    console.log(`Average compression ratio: ${totalSavings.toFixed(1)}%`)
    console.log('='.repeat(50))
  }

  getStats(): CompressionStats[] {
    return [...this.stats]
  }
}

async function main() {
  const elementsDir = join(process.cwd(), 'public', 'elements')
  const outputDir = join(process.cwd(), 'public', 'elements', 'webp')

  // Check if elements directory exists
  if (!existsSync(elementsDir)) {
    console.error(`Elements directory not found: ${elementsDir}`)
    process.exit(1)
  }

  console.log('🖼️  PNG to WebP Image Compressor')
  console.log('================================')
  console.log(`Input directory: ${elementsDir}`)
  console.log(`Output directory: ${outputDir}`)
  console.log('')

  // Create compressor with different quality options
  const compressor = new ImageCompressor({
    quality: 85, // Good balance between quality and file size
    effort: 6, // Higher effort = better compression but slower
    lossless: false, // Set to true for lossless compression
  })

  try {
    await compressor.compressDirectory(elementsDir, outputDir)
    console.log('✅ Compression completed successfully!')
  } catch (error) {
    console.error('❌ Compression failed:', error)
    process.exit(1)
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}
