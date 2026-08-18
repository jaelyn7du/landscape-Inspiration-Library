import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import FilterBar from './components/FilterBar.jsx'
import Card from './components/Card.jsx'
import DetailModal from './components/DetailModal.jsx'
import FullscreenViewer from './components/FullscreenViewer.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import { allItems as sourceItems, CATEGORIES, collectOptions } from './data/items.js'

const STORAGE_KEY = 'landscape-lib-marks'

const DEFAULT_FILTERS = {
  keyword: '',
  landscape: '',
  imageType: '',
  platform: '',
  style: '',
  material: '',
  space: '',
  sort: 'default',
  mark: '',
}

const FILTER_LABELS = {
  landscape: '景观类型',
  imageType: '图片类型',
  platform: '来源平台',
  style: '设计风格',
  material: '主要材料',
  space: '空间类型',
}

/** 收藏 / 喜欢 状态本地持久化 */
function loadMarks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export default function App() {
  const [tab, setTab] = useState('library')
  const [items, setItems] = useState(() => {
    const marks = loadMarks()
    return sourceItems.map((i) =>
      marks[i.id] ? { ...i, ...marks[i.id] } : i
    )
  })
  const [category, setCategory] = useState('全部')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [detailId, setDetailId] = useState(null)
  const [viewerId, setViewerId] = useState(null)
  const [showBackTop, setShowBackTop] = useState(false)
  const [adminSub, setAdminSub] = useState('overview')
  const libraryRef = useRef(null)

  /* ---------------- 下拉框选项 ---------------- */
  const options = useMemo(
    () => ({
      landscape: collectOptions(items, 'landscape_type'),
      imageType: collectOptions(items, 'image_type'),
      platform: collectOptions(items, 'source_platform'),
      style: collectOptions(items, 'style_tags', true),
      material: collectOptions(items, 'material_tags', true),
      space: collectOptions(items, 'space_tags', true),
    }),
    [items]
  )

  /* ---------------- 分类计数 ---------------- */
  const categories = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        key: c.key,
        count: c.key === '全部' ? items.length : items.filter(c.match).length,
      })),
    [items]
  )

  /* ---------------- 筛选 + 排序 ---------------- */
  const filteredItems = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.key === category) || CATEGORIES[0]
    const kw = filters.keyword.trim().toLowerCase()

    let result = items.filter((item) => {
      if (!cat.match(item)) return false
      if (filters.mark === 'fav' && !item.favorite) return false
      if (filters.mark === 'liked' && !item.liked) return false
      if (filters.mark === 'both' && !(item.favorite && item.liked)) return false
      if (filters.landscape && item.landscape_type !== filters.landscape) return false
      if (filters.imageType && item.image_type !== filters.imageType) return false
      if (filters.platform && item.source_platform !== filters.platform) return false
      if (filters.style && !item.style_tags.includes(filters.style)) return false
      if (filters.material && !item.material_tags.includes(filters.material))
        return false
      if (filters.space && !item.space_tags.includes(filters.space)) return false

      if (kw) {
        const haystack = [
          item.title,
          item.file_name,
          item.source_user,
          item.source_title,
          item.source_platform,
          item.landscape_type,
          item.image_type,
          item.ai_description,
          ...item.style_tags,
          ...item.material_tags,
          ...item.color_tags,
          ...item.space_tags,
          ...item.element_tags,
          ...item.keywords,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(kw)) return false
      }
      return true
    })

    const s = filters.sort
    if (s === 'hot') {
      result = [...result].sort(
        (a, b) =>
          b.like_count + b.collect_count * 2 - (a.like_count + a.collect_count * 2)
      )
    } else if (s === 'newest') {
      result = [...result].sort((a, b) =>
        String(b.created_at || '').localeCompare(String(a.created_at || ''))
      )
    } else if (s === 'oldest') {
      result = [...result].sort((a, b) =>
        String(a.created_at || '').localeCompare(String(b.created_at || ''))
      )
    } else if (s === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
    } else if (s === 'favorite') {
      result = [...result].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0))
    }
    return result
  }, [items, category, filters])

  /* ---------------- 已选条件 chips ---------------- */
  const activeChips = useMemo(() => {
    const chips = []
    Object.entries(FILTER_LABELS).forEach(([key, label]) => {
      if (filters[key]) {
        chips.push({
          key,
          label: `${label}：${filters[key]}`,
          onRemove: () => setFilters((f) => ({ ...f, [key]: '' })),
        })
      }
    })
    if (filters.keyword) {
      chips.push({
        key: 'keyword',
        label: `关键词：${filters.keyword}`,
        onRemove: () => setFilters((f) => ({ ...f, keyword: '' })),
      })
    }
    if (filters.mark) {
      const markLabel = {
        fav: '只看收藏',
        liked: '只看点赞',
        both: '收藏和点赞',
      }
      chips.push({
        key: 'mark',
        label: `已看：${markLabel[filters.mark] || filters.mark}`,
        onRemove: () => setFilters((f) => ({ ...f, mark: '' })),
      })
    }
    if (category !== '全部') {
      chips.push({
        key: 'category',
        label: `分类：${category}`,
        onRemove: () => setCategory('全部'),
      })
    }
    return chips
  }, [filters, category])

  /* ---------------- 交互 ---------------- */
  const handleFilterChange = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }))
  }, [])

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setCategory('全部')
  }, [])

  /* 退出登录（当前无后端，仅作占位交互） */
  const handleLogout = useCallback(() => {
    setTab('library')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleTagClick = useCallback((field, value) => {
    setFilters((f) => ({ ...f, [field]: f[field] === value ? '' : value }))
    setDetailId(null)
    document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const persistMark = useCallback((id, patch) => {
    const marks = loadMarks()
    marks[id] = { ...(marks[id] || {}), ...patch }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(marks))
    } catch {
      /* 存储不可用时忽略 */
    }
  }, [])

  const toggleField = useCallback(
    (id, field) => {
      setItems((list) =>
        list.map((i) => {
          if (i.id !== id) return i
          const next = { ...i, [field]: !i[field] }
          persistMark(id, { [field]: next[field] })
          return next
        })
      )
    },
    [persistMark]
  )

  const toggleFav = useCallback((id) => toggleField(id, 'favorite'), [toggleField])
  const toggleLike = useCallback((id) => toggleField(id, 'liked'), [toggleField])

  const scrollToLibrary = useCallback(() => {
    setTab('library')
    requestAnimationFrame(() => {
      const top = (libraryRef.current?.offsetTop || window.innerHeight) - 90
      window.scrollTo({ top, behavior: 'smooth' })
    })
  }, [])

  const goAdmin = useCallback((sub = 'overview') => {
    setAdminSub(sub)
    setTab('admin')
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
  }, [])

  /* 详情：上一张 / 下一张 */
  const detailIndex = filteredItems.findIndex((i) => i.id === detailId)
  const detailItem =
    detailIndex >= 0 ? filteredItems[detailIndex] : items.find((i) => i.id === detailId)

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > window.innerHeight * 0.9)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <Navbar
        tab={tab}
        onTabChange={(t, sub) => {
          if (t === 'admin') {
            goAdmin(sub)
          } else {
            setTab(t)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        total={items.length}
        filtered={filteredItems.length}
      />

      <Hero items={items} onExplore={scrollToLibrary} onPersonal={() => goAdmin('overview')} />

      {tab === 'library' ? (
        <section className="section container" id="library" ref={libraryRef}>
          <div className="section-head">
            <div>
              <div className="section-eyebrow">Inspiration Library</div>
              <h2 className="section-title">案例灵感库</h2>
            </div>
          </div>

          <FilterBar
            categories={categories}
            category={category}
            onCategoryChange={setCategory}
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            options={options}
            count={filteredItems.length}
            total={items.length}
            activeChips={activeChips}
          />

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📭</div>
              <h3>没有符合条件的案例</h3>
              <p>试着放宽筛选条件，或点击「重置」查看全部。</p>
            </div>
          ) : (
            <div className="masonry">
              {filteredItems.map((item, idx) => (
                <Card
                  key={item.id}
                  item={item}
                  index={idx}
                  onOpen={(it) => setDetailId(it.id)}
                  onToggleFav={toggleFav}
                  onToggleLike={toggleLike}
                  onTagClick={handleTagClick}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <AdminPanel
          items={items}
          onOpenItem={(it) => setDetailId(it.id)}
          onToggleFav={toggleFav}
          onToggleLike={toggleLike}
          initialTab={adminSub}
        />
      )}

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">藏山川于像素 · 赋场地以新生</div>
          <div className="footer-meta">
            风景园林案例灵感库 · 共 {items.length} 张案例图片 · 数据源 data.js
          </div>
        </div>
      </footer>

      <button
        className={`back-top${showBackTop ? ' show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="回到顶部"
      >
        ↑
      </button>

      {detailItem && (
        <DetailModal
          item={detailItem}
          allItems={items}
          onClose={() => setDetailId(null)}
          onOpenItem={(it) => setDetailId(it.id)}
          onOpenFullscreen={setViewerId}
          onToggleFav={toggleFav}
          onToggleLike={toggleLike}
          onTagClick={handleTagClick}
          hasPrev={detailIndex > 0}
          hasNext={detailIndex >= 0 && detailIndex < filteredItems.length - 1}
          onPrev={() =>
            detailIndex > 0 && setDetailId(filteredItems[detailIndex - 1].id)
          }
          onNext={() =>
            detailIndex >= 0 &&
            detailIndex < filteredItems.length - 1 &&
            setDetailId(filteredItems[detailIndex + 1].id)
          }
        />
      )}

      {viewerId &&
        (() => {
          const v = items.find((i) => i.id === viewerId)
          return v ? (
            <FullscreenViewer item={v} onClose={() => setViewerId(null)} />
          ) : null
        })()}
    </>
  )
}
