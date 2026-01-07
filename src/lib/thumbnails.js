import sharp from 'sharp'
import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import { getSetting } from './settings'


export async function generateThumbnail(filePath) {
  try {
    const configuredPath = await getSetting('cachePath', '.cache/thumbnails')
    const CACHE_DIR = path.isAbsolute(configuredPath) 
        ? configuredPath 
        : path.join(process.cwd(), configuredPath)

    await fs.ensureDir(CACHE_DIR)
    
    // Generate a unique cache name based on path and mtime (to handle updates)
    const stats = await fs.stat(filePath)
    const hash = crypto.createHash('md5')
      .update(filePath + stats.mtime.getTime().toString())
      .digest('hex')
    
    const thumbName = `${hash}.webp`
    const thumbPath = path.join(CACHE_DIR, thumbName)
    
    // Check if thumbnail already exists
    if (await fs.pathExists(thumbPath)) {
      return `/api/thumbnail?name=${thumbName}`
    }

    const ext = path.extname(filePath).toLowerCase().replace('.', '')
    const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)

    if (isVideo) {
        console.log(`[Thumbnail] Extracting frame from video: ${filePath}`)
        // Extract first frame from video
        let tempPath = path.join(CACHE_DIR, thumbName.replace('.webp', '.jpg'))
        
        // Try multiple approaches to extract a frame
        const extractionAttempts = [
            // Try 0.5 seconds
            { timestamps: [0.5], label: '0.5s' },
            // Try 2 seconds
            { timestamps: [2], label: '2s' },
            // Try first frame
            { count: 1, label: 'first frame' },
            // Try 5 seconds
            { timestamps: [5], label: '5s' }
        ]
        
        let extractionSuccess = false
        
        for (const attempt of extractionAttempts) {
            try {
                await new Promise((resolve, reject) => {
                    const cmd = ffmpeg(filePath)
                        .on('end', () => {
                            console.log(`[Thumbnail] FFmpeg ${attempt.label} attempt finished for: ${filePath}`)
                            resolve()
                        })
                        .on('error', (err) => {
                            console.warn(`[Thumbnail] FFmpeg ${attempt.label} attempt failed for ${filePath}:`, err.message)
                            reject(err)
                        })
                    
                    if (attempt.timestamps) {
                        cmd.screenshots({
                            timestamps: attempt.timestamps,
                            folder: CACHE_DIR,
                            filename: thumbName.replace('.webp', '.jpg'),
                            size: '400x?'
                        })
                    } else if (attempt.count) {
                        cmd.screenshots({
                            count: attempt.count,
                            folder: CACHE_DIR,
                            filename: thumbName.replace('.webp', '.jpg'),
                            size: '400x?'
                        })
                    }
                })
                
                // Wait a bit for FFmpeg to fully release the file (Windows optimization)
                await new Promise(r => setTimeout(r, 300))
                
                if (await fs.pathExists(tempPath)) {
                    extractionSuccess = true
                    break
                }
            } catch (error) {
                // Continue to next attempt
                console.warn(`[Thumbnail] Extraction attempt failed: ${error.message}`)
            }
        }
        
        if (!extractionSuccess) {
            console.error(`[Thumbnail] All extraction attempts failed for: ${filePath}`)
            return null
        }

        if (await fs.pathExists(tempPath)) {
            // Read into buffer to avoid sharp holding a file handle
            const inputBuffer = await fs.readFile(tempPath)
            
            await sharp(inputBuffer)
                .webp({ quality: 80 })
                .toFile(thumbPath)
            
            // Cleanup temp file with a bit of grace
            try {
                await fs.remove(tempPath)
            } catch (unlinkErr) {
                console.warn(`[Thumbnail] Could not cleanup temp file (handled): ${tempPath}`, unlinkErr.message)
            }
        }
    } else {
        // Generate thumbnail for image
        const targetSize = 448;
        await sharp(filePath)
          .resize(targetSize, targetSize, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toFile(thumbPath)
    }

    return `/api/thumbnail?name=${thumbName}`
  } catch (error) {
    console.error(`[Thumbnail] Failed for ${filePath}:`, error)
    return null
  }
}
