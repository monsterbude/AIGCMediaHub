import prisma from './prisma.js'

/**
 * 更新标签的计数
 * @param {number} tagId - 标签ID
 */
async function updateTagCount(tagId) {
  try {
    // 计算标签关联的文件数量
    const count = await prisma.fileTag.count({
      where: { tagId }
    })

    // 查找现有的TagCount记录
    const existingTagCount = await prisma.tagCount.findUnique({
      where: { tagId }
    })

    if (existingTagCount) {
      // 更新现有记录
      await prisma.tagCount.update({
        where: { tagId },
        data: {
          count,
          lastUpdated: new Date()
        }
      })

      // 如果计数为0，删除标签
      if (count === 0) {
        await deleteTagIfZeroCount(tagId)
      }
    } else if (count > 0) {
      // 创建新记录
      await prisma.tagCount.create({
        data: {
          tagId,
          count,
          lastUpdated: new Date()
        }
      })
    }

    return count
  } catch (error) {
    console.error(`更新标签计数失败 (tagId: ${tagId}):`, error)
    throw error
  }
}

/**
 * 当标签计数为0时删除标签
 * @param {number} tagId - 标签ID
 */
async function deleteTagIfZeroCount(tagId) {
  try {
    // 先删除TagCount记录
    await prisma.tagCount.delete({
      where: { tagId }
    })

    // 再删除标签
    await prisma.tag.delete({
      where: { id: tagId }
    })

    console.log(`标签计数为0，已删除标签 (tagId: ${tagId})`)
  } catch (error) {
    console.error(`删除标签失败 (tagId: ${tagId}):`, error)
    // 忽略错误，因为可能是并发操作导致的
  }
}

/**
 * 批量更新标签计数
 * @param {number[]} tagIds - 标签ID数组
 */
async function updateMultipleTagCounts(tagIds) {
  try {
    for (const tagId of tagIds) {
      await updateTagCount(tagId)
    }
  } catch (error) {
    console.error('批量更新标签计数失败:', error)
    throw error
  }
}

export {
  updateTagCount,
  deleteTagIfZeroCount,
  updateMultipleTagCounts
}