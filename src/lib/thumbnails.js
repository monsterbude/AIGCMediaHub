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
        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .on('end', () => {
                    console.log(`[Thumbnail] FFmpeg finished for: ${filePath}`)
                    resolve()
                })
                .on('error', (err) => {
                    console.error(`[Thumbnail] FFmpeg error for ${filePath}:`, err)
                    reject(err)
                })
                .screenshots({
                    timestamps: [1], // Use number instead of string for 1 second
                    folder: CACHE_DIR,
                    filename: thumbName.replace('.webp', '.jpg'),
                    size: '400x?'
                })
        })
        
        // Convert the extracted frame to webp using sharp for consistency
        const tempPath = path.join(CACHE_DIR, thumbName.replace('.webp', '.jpg'))
        
        // Wait a bit for FFmpeg to fully release the file (Windows optimization)
        await new Promise(r => setTimeout(r, 200))

        if (!await fs.pathExists(tempPath)) {
            // If 1s failed, try simple count 1
            await new Promise((resolve, reject) => {
                ffmpeg(filePath)
                    .on('end', resolve)
                    .on('error', reject)
                    .screenshots({
                        count: 1,
                        folder: CACHE_DIR,
                        filename: thumbName.replace('.webp', '.jpg'),
                        size: '400x?'
                    })
            })
            await new Promise(r => setTimeout(r, 200))
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
        await sharp(filePath)
          .resize(400, 400, {
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
