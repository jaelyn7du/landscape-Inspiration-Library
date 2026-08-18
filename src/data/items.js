import rawItems from 'virtual:inspiration-data'

/**
 * 归一化数据：补齐字段，保证渲染层不用到处判空
 * 数据源仍是项目根目录的 data.js（由 generate_data.py 生成）
 */
function normalize(item, index) {
  const arr = (v) => (Array.isArray(v) ? v.filter(Boolean) : [])
  return {
    ...item,
    id: item.id || `item-${index}`,
    title: item.title || item.file_name || '未命名',
    image_url: normalizeUrl(item.image_url),
    style_tags: arr(item.style_tags),
    material_tags: arr(item.material_tags),
    color_tags: arr(item.color_tags),
    space_tags: arr(item.space_tags),
    element_tags: arr(item.element_tags),
    keywords: arr(item.keywords),
    like_count: Number(item.like_count) || 0,
    collect_count: Number(item.collect_count) || 0,
    comment_count: Number(item.comment_count) || 0,
    confidence: Number(item.confidence) || 0,
    favorite: !!item.favorite,
    liked: !!item.liked,
  }
}

/**
 * 统一为「相对路径」形式：./小红书素材爬取/x.jpeg
 * 配合 vite.config.js 的 base: './'，可部署到任意子路径（含 GitHub Pages）
 * 远程 https:// 与 data: 链接原样返回
 */
function normalizeUrl(url) {
  if (!url) return ''
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:')) return url
  let u = String(url).replace(/\\/g, '/').trim()
  if (!u.startsWith('/') && !u.startsWith('./')) u = './' + u
  if (u.startsWith('/')) u = '.' + u
  return u
}

export const allItems = (rawItems || []).map(normalize)

/** 一级分类定义：与原 index.html 的智能关联规则保持一致 */
export const CATEGORIES = [
  { key: '全部', match: () => true },
  { key: '居住与社区', match: (i) => i.landscape_type === '居住区景观' },
  {
    key: '商业与园区',
    match: (i) => ['商业景观', '办公园区景观'].includes(i.landscape_type),
  },
  {
    key: '公共与公园',
    match: (i) => ['公园景观', '城市公共空间', '校园景观'].includes(i.landscape_type),
  },
  {
    key: '滨水与生态',
    match: (i) =>
      ['滨水景观', '山地与自然景观', '乡村景观', '生态修复景观'].includes(
        i.landscape_type
      ),
  },
  { key: '文旅与度假', match: (i) => i.landscape_type === '文旅景观' },
  {
    key: '水景与构筑',
    match: (i) =>
      i.landscape_type === '滨水景观' ||
      ['水体', '景观小品', '园路', '铺装'].some((t) => i.element_tags.includes(t)),
  },
  {
    key: '植物与植物造景',
    match: (i) =>
      i.landscape_type === '植物景观' ||
      i.element_tags.includes('植物') ||
      i.material_tags.includes('植物材料'),
  },
  {
    key: '表达与分析图',
    match: (i) =>
      [
        '分析图',
        '总平面图',
        '功能分区图',
        '植物配置图',
        '竖向设计图',
        '节点详图',
        '剖面图',
        '轴测图',
        '流程图',
        '图表',
      ].includes(i.image_type),
  },
]

/** 提取某字段的全部取值（用于下拉框） */
export function collectOptions(items, key, isArray = false) {
  const set = new Set()
  items.forEach((item) => {
    if (isArray) {
      item[key].forEach((v) => v && set.add(v))
    } else if (item[key]) {
      set.add(item[key])
    }
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

export const SORT_OPTIONS = [
  { value: 'default', label: '默认排序' },
  { value: 'hot', label: '最热优先' },
  { value: 'newest', label: '最新优先' },
  { value: 'oldest', label: '最早优先' },
  { value: 'title', label: '标题排序' },
  { value: 'favorite', label: '收藏优先' },
]
