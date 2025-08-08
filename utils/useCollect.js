import { collectListStatus, scienceAddCollect } from '@/api'

/**
 * 收藏逻辑封装
 * @param {Object} options
 * @param {Array} options.list 列表数据引用（响应式）
 * @param {String} options.idKey 每项的唯一ID字段，默认 'specialId'
 * @param {String} options.collectKey 状态字段，默认 'status'
 * @param {String} options.countKey 收藏数量字段，默认 'specialGood'
 */
export function useCollect({
  list = [],
  idKey = 'specialId',
  collectKey = 'status',
  countKey = 'specialGood'
}) {
  /**
   * 初始化收藏状态（批量查）
   */
  async function initCollectStatus() {
    const ids = list.map(item => item?.[idKey]).filter(Boolean)
    if (!ids.length) return

    try {
      const res = await collectListStatus({ listId: ids })
      const statusMap = {}
      // 统一转换为 Map 结构（更高效）
      res.data?.forEach(item => {
        statusMap[item[idKey]] = item.status
      })

      // 给原始列表里的每项添加/更新 status
      list.forEach(item => {
        const id = item[idKey]
        if (id != null) {
          item[collectKey] = statusMap[id] ?? 0 // 没有就默认 0
        }
      })
    } catch (err) {
      console.error('initCollectStatus error:', err)
    }
  }

  /**
   * 切换收藏状态
   * @param {Object} item 当前项
   */
  async function toggleCollect(item) {
    if (!item) return

    const originalStatus = item[collectKey]
    const originalCount = item[countKey]

    // 本地乐观更新
    item[collectKey] = originalStatus === 1 ? 0 : 1
    item[countKey] = originalStatus === 1
      ? Math.max(0, originalCount - 1)
      : originalCount + 1

    try {
      await scienceAddCollect({ specialId: item[idKey] })
    } catch (err) {
      // 回滚
      item[collectKey] = originalStatus
      item[countKey] = originalCount
      uni.showToast({ title: '收藏操作失败', icon: 'none' })
      console.error('toggleCollect error:', err)
    }
  }

  return {
    initCollectStatus,
    toggleCollect,
  }
}
