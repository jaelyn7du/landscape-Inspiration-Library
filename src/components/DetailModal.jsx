import { useEffect, useMemo } from 'react'
import { formatDate, STATUS_MAP, statusClass, PLACEHOLDER, buildIntro } from '../utils/format.js'

function Row({ label, value }) {
  const empty = value === null || value === undefined || value === ''
  return (
    <div className="detail-row">
      <div className="dl-label">{label}</div>
      <div className={`dl-value${empty ? ' empty' : ''}`}>{empty ? '—' : value}</div>
    </div>
  )
}

function TagRow({ label, tags, cls = '', onTagClick, field }) {
  const list = Array.isArray(tags) ? tags : []
  return (
    <div className="detail-row">
      <div className="dl-label">{label}</div>
      <div className={`dl-value${list.length === 0 ? ' empty' : ''}`}>
        {list.length === 0 ? (
          '—'
        ) : (
          <div className="detail-tags">
            {list.map((t, i) => (
              <span
                key={`${t}-${i}`}
                className={`detail-tag ${cls}`}
                onClick={() => field && onTagClick?.(field, t)}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RecoList({ title, list, onOpen }) {
  return (
    <div className="reco-section">
      <div className="reco-section-title">{title}</div>
      {list.length === 0 ? (
        <div className="reco-empty">暂无推荐</div>
      ) : (
        list.map((s) => (
          <div className="reco-item" key={s.id} onClick={() => onOpen(s)}>
            <img
              src={s.image_url || PLACEHOLDER}
              alt={s.title}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER
              }}
            />
            <div>
              <div className="reco-item-title">{s.title}</div>
              {s.source_platform && (
                <div className="reco-item-platform">{s.source_platform}</div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function DetailModal({
  item,
  allItems,
  onClose,
  onOpenItem,
  onToggleFav,
  onToggleLike,
  onTagClick,
  onOpenFullscreen,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) {
  /* 锁滚动 + Esc / 左右键 */
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft' && hasPrev) onPrev()
      else if (e.key === 'ArrowRight' && hasNext) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, onPrev, onNext, hasPrev, hasNext])

  const { similar, sameLandscape, sameStyle } = useMemo(() => {
    if (!item) return { similar: [], sameLandscape: [], sameStyle: [] }

    const keywords = (item.title || '')
      .toLowerCase()
      .split(/[\s\-—_,，。、:：;；!！?？()（）|]+/)
      .filter((k) => k.length > 1)

    const scored = []
    allItems.forEach((other) => {
      if (other.id === item.id) return
      const t = (other.title || '').toLowerCase()
      let score = keywords.reduce((s, kw) => (t.includes(kw) ? s + 1 : s), 0)
      score += other.keywords.filter((k) => item.keywords.includes(k)).length
      if (score > 0) scored.push({ other, score })
    })
    scored.sort((a, b) => b.score - a.score)

    const styleScored = []
    allItems.forEach((other) => {
      if (other.id === item.id) return
      const overlap = other.style_tags.filter((s) => item.style_tags.includes(s))
      if (overlap.length) styleScored.push({ other, score: overlap.length })
    })
    styleScored.sort((a, b) => b.score - a.score)

    return {
      similar: scored.slice(0, 4).map((s) => s.other),
      sameLandscape: item.landscape_type
        ? allItems
            .filter(
              (o) => o.id !== item.id && o.landscape_type === item.landscape_type
            )
            .slice(0, 4)
        : [],
      sameStyle: styleScored.slice(0, 4).map((s) => s.other),
    }
  }, [item, allItems])

  if (!item) return null

  const confPct = Math.round((item.confidence || 0) * 100)
  const st = item.tagging_status || 'pending'

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h2 title={item.title}>{item.title}</h2>
          <div className="modal-header-right">
            <button className="modal-nav-btn" disabled={!hasPrev} onClick={onPrev}>
              ← 上一张
            </button>
            <button className="modal-nav-btn" disabled={!hasNext} onClick={onNext}>
              下一张 →
            </button>
            <button className="modal-close" onClick={onClose} aria-label="关闭">
              ✕
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* 左：图片（直接展示，点击展开全屏看图） */}
          <div className="modal-left">
            <img
              className="modal-image"
              src={item.image_url}
              alt={item.title}
              loading="lazy"
              onClick={() => onOpenFullscreen?.(item.id)}
            />
          </div>

          {/* 中：元数据 */}
          <div className="modal-center">
            <div className="detail-section">
              <div className="detail-section-title">基本信息</div>
              <Row label="图片介绍" value={buildIntro(item)} />
              <Row label="来源用户名" value={item.source_user} />
              <Row label="来源平台" value={item.source_platform} />
              <Row label="原始标题" value={item.source_title} />
              <Row
                label="爬取时间"
                value={item.crawl_time ? formatDate(item.crawl_time) : ''}
              />
              <Row label="景观类型" value={item.landscape_type} />
              <Row label="图片类型" value={item.image_type} />
            </div>

            {(item.like_count > 0 ||
              item.collect_count > 0 ||
              item.comment_count > 0) && (
              <div className="detail-section">
                <div className="detail-section-title">互动数据</div>
                <Row label="点赞数" value={`👍 ${item.like_count}`} />
                <Row label="收藏数" value={`⭐ ${item.collect_count}`} />
                <Row label="评论数" value={`💬 ${item.comment_count}`} />
              </div>
            )}

            <div className="detail-section">
              <div className="detail-section-title">标签信息</div>
              <TagRow
                label="风格标签"
                tags={item.style_tags}
                field="style"
                onTagClick={onTagClick}
              />
              <TagRow
                label="材料标签"
                tags={item.material_tags}
                cls="blue"
                field="material"
                onTagClick={onTagClick}
              />
              <TagRow label="色彩标签" tags={item.color_tags} cls="gray" />
              <TagRow
                label="空间标签"
                tags={item.space_tags}
                cls="purple"
                field="space"
                onTagClick={onTagClick}
              />
              <TagRow label="设计元素" tags={item.element_tags} cls="gray" />
              <TagRow label="关键词" tags={item.keywords} cls="gray" />
            </div>

            <div className="detail-section">
              <div className="detail-section-title">AI 标注</div>
              <Row label="AI 描述" value={item.ai_description} />
              <div className="detail-row">
                <div className="dl-label">AI 置信度</div>
                <div className="dl-value">
                  {confPct}%
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${confPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="detail-row">
                <div className="dl-label">需人工审核</div>
                <div className="dl-value">
                  <span
                    className={`status-badge status-${
                      item.need_review ? 'pending' : 'completed'
                    }`}
                  >
                    {item.need_review ? '是' : '否'}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <div className="dl-label">打标状态</div>
                <div className="dl-value">
                  <span className={`status-badge status-${statusClass(st)}`}>
                    {STATUS_MAP[st] || st}
                  </span>
                </div>
              </div>
              {item.tagging_error && (
                <Row label="打标错误" value={item.tagging_error} />
              )}
            </div>

            <div className="detail-section">
              <div className="detail-section-title">操作</div>
              <div className="detail-actions">
                <button
                  className={`btn-outline${item.favorite ? ' active' : ''}`}
                  onClick={() => onToggleFav(item.id)}
                >
                  ★ {item.favorite ? '已收藏' : '收藏'}
                </button>
                <button
                  className={`btn-outline${item.liked ? ' active' : ''}`}
                  onClick={() => onToggleLike(item.id)}
                >
                  ♥ {item.liked ? '已喜欢' : '喜欢'}
                </button>
                {item.source_url && (
                  <a
                    className="btn-source-url"
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔗 查看原始网页
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 右：推荐 */}
          <div className="modal-right">
            <RecoList title="相似灵感推荐" list={similar} onOpen={onOpenItem} />
            <RecoList title="同景观类型" list={sameLandscape} onOpen={onOpenItem} />
            <RecoList title="同风格推荐" list={sameStyle} onOpen={onOpenItem} />
          </div>
        </div>
      </div>
    </div>
  )
}
