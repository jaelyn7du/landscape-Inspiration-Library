import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { SORT_OPTIONS } from '../data/items.js'
import SpecularButton from './SpecularButton.jsx'

const SELECT_DEFS = [
  { key: 'landscape', label: '景观类型' },
  { key: 'imageType', label: '图片类型' },
  { key: 'platform', label: '来源平台' },
  { key: 'style', label: '设计风格' },
  { key: 'material', label: '主要材料' },
  { key: 'space', label: '空间类型' },
]

const MARK_OPTIONS = [
  { value: 'fav', label: '只看收藏' },
  { value: 'liked', label: '只看点赞' },
  { value: 'both', label: '收藏和点赞' },
]

export default function FilterBar({
  categories,
  category,
  onCategoryChange,
  filters,
  onFilterChange,
  onReset,
  options,
  count,
  total,
  activeChips,
}) {
  const [markOpen, setMarkOpen] = useState(false)
  const [isStuck, setIsStuck] = useState(false)
  const stickyRef = useRef(null)

  const markLabel = MARK_OPTIONS.find((o) => o.value === filters.mark)?.label

  useEffect(() => {
    const el = stickyRef.current
    if (!el) return undefined

    const check = () => {
      const rect = el.getBoundingClientRect()
      setIsStuck(rect.top <= 82)
    }

    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <div ref={stickyRef} className={`sticky-tools${isStuck ? ' is-stuck' : ''}`}>
      {/* 一级分类 — SpecularButton 镜面按钮组 */}
      <div className="cat-bar cat-specular-container">
        <div className="specular-btn-group">
          {categories.map((c) => (
            <SpecularButton
              key={c.key}
              size="sm"
              radius={22}
              tint={category === c.key ? "#1b523d" : "#ffffff"}
              tintOpacity={category === c.key ? 1 : 0.1}
              blur={category === c.key ? 8 : 4}
              textColor={category === c.key ? "#ffffff" : "#ece7dd"}
              lineColor="#ffffff"
              baseColor={category === c.key ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.7)"}
              intensity={1.4}
              shineSize={14}
              shineFade={32}
              thickness={1.4}
              speed={0.4}
              followMouse
              proximity={220}
              autoAnimate={category === c.key}
              onClick={() => onCategoryChange(c.key)}
              className={`specular-cat-btn${category === c.key ? ' is-active' : ''}`}
            >
              {c.key}
            </SpecularButton>
          ))}
        </div>
      </div>

      {/* 筛选条件 */}
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={filters.keyword}
            placeholder="搜索标题、用户、标签、描述…"
            onChange={(e) => onFilterChange('keyword', e.target.value)}
          />
          {filters.keyword && (
            <button
              className="clear-btn"
              onClick={() => onFilterChange('keyword', '')}
              aria-label="清空搜索"
            >
              ✕
            </button>
          )}
        </div>

        {SELECT_DEFS.map((def) => (
          <select
            key={def.key}
            className={`filter-select${filters[def.key] ? ' filled' : ''}`}
            value={filters[def.key]}
            onChange={(e) => onFilterChange(def.key, e.target.value)}
          >
            <option value="">{def.label}</option>
            {(options[def.key] || []).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        ))}

        <select
          className={`filter-select${filters.sort !== 'default' ? ' filled' : ''}`}
          value={filters.sort}
          onChange={(e) => onFilterChange('sort', e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* 已看：下拉选择收藏 / 点赞筛选 */}
        <div className={`mark-dropdown${markOpen ? ' open' : ''}`}>
          <button
            className={`mark-btn${filters.mark ? ' active' : ''}`}
            onClick={() => setMarkOpen((v) => !v)}
            onBlur={() => setTimeout(() => setMarkOpen(false), 150)}
          >
            {markLabel ? `已看 · ${markLabel}` : '已看'}
            <span className="mark-caret">▾</span>
          </button>
          {markOpen && (
            <div className="mark-menu">
              {MARK_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`mark-item${filters.mark === o.value ? ' active' : ''}`}
                  onMouseDown={() => {
                    onFilterChange('mark', filters.mark === o.value ? '' : o.value)
                    setMarkOpen(false)
                  }}
                >
                  {o.label}
                  {filters.mark === o.value && <span className="mark-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="btn-reset" onClick={onReset}>
          重置
        </button>

        <div className="filter-count">
          共 <span>{count}</span> 张 / {total} 张
        </div>
      </div>

      {/* 已选条件 */}
      {activeChips.length > 0 && (
        <div className="active-chips">
          {activeChips.map((chip) => (
            <span className="chip" key={chip.key}>
              {chip.label}
              <button onClick={chip.onRemove} aria-label="移除条件">
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
