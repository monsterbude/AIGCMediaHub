import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { parseAigcMetadata } from '@/lib/metadata'
import { generateThumbnail } from '@/lib/thumbnails'
import { getSetting } from '@/lib/settings'

const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov']

async function calculateHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)
    stream.on('error', err => reject(err))
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

export async function scanDirectory(dirPath, onProgress = () => { }, options = {}) {
  const { force = false, signal } = options

  if (signal?.aborted) return

  if (!await fs.pathExists(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`)
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  // Track disk contents for cleanup
  const diskFileNames = new Set()
  const diskDirNames = new Set()

  for (const entry of entries) {
    if (signal?.aborted) return
    if (entry.isFile()) diskFileNames.add(entry.name)
    if (entry.isDirectory()) diskDirNames.add(entry.name)
  }

  for (const file of entries) {
    if (signal?.aborted) return
    const fullPath = path.join(dirPath, file.name)

    if (file.isDirectory()) {
      await scanDirectory(fullPath, onProgress, options)
    } else if (file.isFile()) {
      const ext = path.extname(file.name).toLowerCase().replace('.', '')

      if (SUPPORTED_EXTENSIONS.includes(ext)) {
        try {
          const stats = await fs.stat(fullPath)

          onProgress({ type: 'scanning', file: fullPath })

          // Check if file exists and is unchanged
          const existingFile = await prisma.fileMetaInfo.findUnique({
            where: { filePath: fullPath },
            include: { aigcMetaInfo: true } // Check if meta already extracted
          })

          if (!force && existingFile &&
            existingFile.fileSize === BigInt(stats.size) &&
            existingFile.modifiedTime.getTime() === stats.mtime.getTime()) {

            await prisma.fileMetaInfo.update({
              where: { filePath: fullPath },
              data: { lastScanned: new Date() }
            })
            onProgress({ type: 'skipped', file: fullPath })
            continue
          }

          // File changed or new, calculate hash
          const hash = await calculateHash(fullPath)

          if (signal?.aborted) return

          // Upsert File Info
          const upsertedFile = await prisma.fileMetaInfo.upsert({
            where: { filePath: fullPath },
            update: {
              modifiedTime: stats.mtime,
              lastScanned: new Date(),
              fileSize: stats.size,
              fileHash: hash,
              isActive: true
            },
            create: {
              filePath: fullPath,
              parentPath: dirPath,
              fileName: file.name,
              fileSize: stats.size,
              fileHash: hash,
              fileExt: ext,
              createdTime: stats.birthtime,
              modifiedTime: stats.mtime,
              fileType: ['mp4', 'mov'].includes(ext) ? 'video' : 'image',
              thumbnailPath: null // Placeholder
            }
          })

          if (signal?.aborted) return

          // Generate Thumbnail (Images and Videos)
          if (['png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov'].includes(ext)) {
            try {
              const thumbPath = await generateThumbnail(fullPath)
              if (thumbPath) {
                await prisma.fileMetaInfo.update({
                  where: { id: upsertedFile.id },
                  data: { thumbnailPath: thumbPath }
                })
              }
            } catch (thumbError) {
              console.error(`[Scanner] Thumbnail generation failed for ${file.name}:`, thumbError)
            }
          }

          if (signal?.aborted) return

          // Extract & Save AIGC Metadata (Images only for now)
          if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
            try {
              const aigcData = await parseAigcMetadata(fullPath)

              if (aigcData) {
                const { loras, ...metaToSave } = aigcData
                await prisma.aigcMetaInfo.upsert({
                  where: { fileMetaInfoId: upsertedFile.id },
                  update: {
                    ...metaToSave,
                    generatedTime: null
                  },
                  create: {
                    fileMetaInfoId: upsertedFile.id,
                    ...metaToSave
                  }
                })

                // Save Tags
                await saveAigcTags(upsertedFile.id, aigcData)
              }
            } catch (metaError) {
              console.error(`[Scanner] Metadata extraction failed for ${file.name}:`, metaError)
            }
          }

          // AI Visual Tagging (Images only, after thumbnail generation)
          if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
            try {
              // Check if AI tagging is enabled in settings
              const aiEnabled = await getSetting('ai_tagger_enabled', 'false')
              if (aiEnabled === 'true') {
                const { tagImage } = await import('@/lib/tagger')
                await tagImage(upsertedFile.id)
              }
            } catch (aiError) {
              // Silently fail if AI tagger is not available or disabled
              if (aiError.message && !aiError.message.includes('Cannot find module')) {
                console.error(`[Scanner] AI tagging failed for ${file.name}:`, aiError)
              }
            }
          }

          onProgress({ type: 'processed', file: fullPath })

        } catch (error) {
          console.error(`Error processing file ${fullPath}:`, error)
          onProgress({ type: 'error', file: fullPath, error: error.message })
        }
      }
    }
  }

  if (signal?.aborted) return

  // --- CLEANUP LOGIC ---
  try {
    // 1. Cleanup missing files in THIS directory
    const dbFiles = await prisma.fileMetaInfo.findMany({
      where: { parentPath: dirPath },
      select: { id: true, fileName: true, filePath: true }
    })

    for (const dbFile of dbFiles) {
      if (signal?.aborted) return
      if (!diskFileNames.has(dbFile.fileName)) {
        await prisma.fileMetaInfo.delete({ where: { id: dbFile.id } })
        onProgress({ type: 'deleted', file: dbFile.filePath, message: 'File no longer exists, removed from DB' })
      }
    }

    // 2. Cleanup missing subfolders
    const dbChildPaths = await prisma.fileMetaInfo.findMany({
      where: { parentPath: { startsWith: dirPath + (dirPath.endsWith(path.sep) ? '' : path.sep) } },
      select: { parentPath: true },
      distinct: ['parentPath']
    })

    for (const childPathObj of dbChildPaths) {
      if (signal?.aborted) return
      const cp = childPathObj.parentPath
      if (!await fs.pathExists(cp)) {
        const deleteResult = await prisma.fileMetaInfo.deleteMany({ where: { parentPath: cp } })
        onProgress({ type: 'cleanup', message: `Removed ${deleteResult.count} records for deleted directory: ${cp}` })
      }
    }
  } catch (cleanupError) {
    console.error(`[Scanner] Cleanup failed for ${dirPath}:`, cleanupError)
  }
}

const TAG_COLORS = {
  model: '#8b5cf6', // Purple
  lora: '#3b82f6',  // Blue
  tool: '#6b7280',  // Gray
  custom: '#10b981' // Green
}

async function saveAigcTags(fileId, aigcData) {
  const tagsToSave = []

  // 1. Model Name
  if (aigcData.modelName) {
    tagsToSave.push({ name: aigcData.modelName, type: 'model', color: TAG_COLORS.model })
  }

  // 2. LoRAs
  if (aigcData.loras && Array.isArray(aigcData.loras)) {
    aigcData.loras.forEach(lora => {
      tagsToSave.push({ name: lora, type: 'lora', color: TAG_COLORS.lora })
    })
  }

  // 3. Source Tool
  if (aigcData.sourceTool) {
    tagsToSave.push({ name: aigcData.sourceTool, type: 'tool', color: TAG_COLORS.tool })
  }

  for (const tagInfo of tagsToSave) {
    try {
      // Find or create tag
      const tag = await prisma.tag.upsert({
        where: { name: tagInfo.name },
        update: {
          type: tagInfo.type,
          color: tagInfo.color // Update color too if needed
        },
        create: {
          name: tagInfo.name,
          type: tagInfo.type,
          color: tagInfo.color
        }
      })

      // Link to file
      await prisma.fileTag.upsert({
        where: {
          fileId_tagId: {
            fileId: fileId,
            tagId: tag.id
          }
        },
        update: { source: 'auto' },
        create: {
          fileId: fileId,
          tagId: tag.id,
          source: 'auto'
        }
      })
    } catch (e) {
      console.error('Error saving tag:', tagInfo.name, e)
    }
  }
}
