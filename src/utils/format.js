export function formatDate(d) {
  if (!d) return ''
  const date = new Date(String(d).replace(/-/g, '/'))
  if (Number.isNaN(date.getTime())) return String(d)
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())} ${p(
    date.getHours()
  )}:${p(date.getMinutes())}`
}

export function formatCount(n) {
  const v = Number(n) || 0
  if (v >= 10000) return (v / 10000).toFixed(1).replace(/\.0$/, '') + 'w'
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(v)
}

export const STATUS_MAP = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  success: '已完成',
  error: '错误',
  failed: '失败',
}

export function statusClass(status) {
  if (status === 'completed' || status === 'success') return 'completed'
  if (status === 'error' || status === 'failed') return 'error'
  return 'pending'
}

/** 占位图（图片加载失败时使用） */
export const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect fill='%23e2d9d0' width='56' height='56'/%3E%3C/svg%3E"

/**
 * 根据结构化字段生成一句「图片介绍」——简洁描述画面内容，
 * 与下方较长的 AI 描述区分开，不重复。
 */
export function buildIntro(item = {}) {
  const landscape = item.landscape_type || ''
  const imageType = item.image_type || ''
  const styles = (item.style_tags || []).slice(0, 2)
  const materials = (item.material_tags || []).slice(0, 2)
  const spaces = (item.space_tags || []).slice(0, 1)

  const segs = []
  if (landscape && imageType) segs.push(`这是一张${landscape}的${imageType}`)
  else if (landscape) segs.push(`这是一处${landscape}场景`)
  else if (imageType) segs.push(`这是一张${imageType}`)
  else segs.push('这是一张景观案例图')

  const tail = []
  if (styles.length) tail.push(`${styles.join('、')}风格`)
  if (materials.length) tail.push(`${materials.join('、')}材质`)
  if (spaces.length) tail.push(`${spaces[0]}空间`)
  if (tail.length) segs.push('，整体以' + tail.join('、') + '为主')

  let txt = segs.join('')
  if (txt.endsWith('，')) txt = txt.slice(0, -1) + '。'
  else if (!txt.endsWith('。')) txt += '。'
  return txt
}
