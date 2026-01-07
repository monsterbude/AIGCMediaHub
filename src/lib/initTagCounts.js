import prisma from './prisma.js'

/**
 * 初始化TagCount表，基于现有的FileTag关系
 */
async function initTagCounts() {
  try {
    console.log('开始初始化TagCount表...')

    // 获取所有标签及其关联的文件数量
    const tagsWithCount = await prisma.tag.findMany({
      include: {
        _count: { select: { files: true } }
      }
    })

    console.log(`找到 ${tagsWithCount.length} 个标签`)

    // 批量创建或更新TagCount记录
    for (const tag of tagsWithCount) {
      const existingTagCount = await prisma.tagCount.findUnique({
        where: { tagId: tag.id }
      })

      if (existingTagCount) {
        // 更新现有记录
        await prisma.tagCount.update({
          where: { tagId: tag.id },
          data: {
            count: tag._count.files,
            lastUpdated: new Date()
          }
        })
        console.log(`更新标签 ${tag.name} 的计数: ${tag._count.files}`)
      } else {
        // 创建新记录
        await prisma.tagCount.create({
          data: {
            tagId: tag.id,
            count: tag._count.files,
            lastUpdated: new Date()
          }
        })
        console.log(`创建标签 ${tag.name} 的计数: ${tag._count.files}`)
      }
    }

    console.log('TagCount表初始化完成!')
  } catch (error) {
    console.error('初始化TagCount表失败:', error)
    throw error
  }
}

// 直接运行初始化函数
if (import.meta.url === `file://${process.argv[1]}`) {
  initTagCounts()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

export default initTagCounts