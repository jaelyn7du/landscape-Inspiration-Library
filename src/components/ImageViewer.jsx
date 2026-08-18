import { useCallback, useEffect, useRef, useState } from 'react'

const MIN_SCALE = 0.2
const MAX_SCALE = 8
const STEP = 0.25
const INITIAL = { scale: 1, x: 0, y: 0 }

const clamp = (v) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v))

/**
 * 图片查看器：滚轮缩放（以光标为锚点）、拖拽平移、双击放大、快捷键
 * 沿用原 index.html 的「点击图片可缩放」交互，并做了完整增强
 */
export default function ImageViewer({ src, alt }) {
  const wrapRef = useRef(null)
  const viewRef = useRef(INITIAL)
  const dragStart = useRef(null)

  const [view, setView] = useState(INITIAL)
  const [dragging, setDragging] = useState(false)
  const [animated, setAnimated] = useState(true)
  const [failed, setFailed] = useState(false)

  viewRef.current = view

  const reset = useCallback(() => {
    setAnimated(true)
    setView(INITIAL)
  }, [])

  // 切换图片时复位
  useEffect(() => {
    setFailed(false)
    setAnimated(true)
    setView(INITIAL)
  }, [src])

  /**
   * 缩放。getNext 基于当前 scale 计算目标值；anchor 为容器中心坐标系下的锚点。
   * 使用纯函数式更新，避免 StrictMode 下重复执行造成偏移翻倍。
   */
  const applyZoom = useCallback((getNext, anchor) => {
    setView((v) => {
      const next = clamp(getNext(v.scale))
      if (next === v.scale) return v
      if (!anchor) {
        // 按钮缩放：以画面中心为锚点，位移等比缩放
        const k = next / v.scale
        return { scale: next, x: v.x * k, y: v.y * k }
      }
      return {
        scale: next,
        x: anchor.x - ((anchor.x - v.x) * next) / v.scale,
        y: anchor.y - ((anchor.y - v.y) * next) / v.scale,
      }
    })
  }, [])

  const zoomBy = useCallback(
    (delta) => {
      setAnimated(true)
      applyZoom((s) => s + delta, null)
    },
    [applyZoom]
  )

  /** 滚轮缩放：绑原生事件才能 preventDefault */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const anchor = {
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      }
      setAnimated(false)
      applyZoom((s) => s * (e.deltaY < 0 ? 1.14 : 1 / 1.14), anchor)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [applyZoom])

  /** 快捷键：+ / - / 0 */
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement) return
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomBy(STEP)
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomBy(-STEP)
      } else if (e.key === '0') {
        e.preventDefault()
        reset()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomBy, reset])

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = {
      px: e.clientX,
      py: e.clientY,
      x: viewRef.current.x,
      y: viewRef.current.y,
    }
    setDragging(true)
    setAnimated(false)
  }

  const onPointerMove = (e) => {
    const d = dragStart.current
    if (!d) return
    setView((v) => ({
      ...v,
      x: d.x + (e.clientX - d.px),
      y: d.y + (e.clientY - d.py),
    }))
  }

  const endDrag = (e) => {
    if (!dragStart.current) return
    dragStart.current = null
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    setDragging(false)
  }

  const onDoubleClick = (e) => {
    const el = wrapRef.current
    if (!el) return
    setAnimated(true)
    if (viewRef.current.scale > 1.05) {
      setView(INITIAL)
      return
    }
    const rect = el.getBoundingClientRect()
    applyZoom(() => 2.2, {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    })
  }

  return (
    <div
      ref={wrapRef}
      className={`viewer${dragging ? ' grabbing' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={onDoubleClick}
    >
      {failed || !src ? (
        <div className="viewer-placeholder">
          <span className="icon">🖼️</span>
          <span>图片加载失败</span>
        </div>
      ) : (
        <img
          className={animated ? 'animated' : ''}
          src={src}
          alt={alt}
          draggable={false}
          onError={() => setFailed(true)}
          style={{
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})`,
          }}
        />
      )}

      <div className="viewer-hint">滚轮缩放 · 拖拽平移 · 双击还原</div>

      <div
        className="viewer-toolbar"
        onPointerDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <button
          className="vt-btn"
          title="缩小 ( - )"
          disabled={view.scale <= MIN_SCALE}
          onClick={() => zoomBy(-STEP)}
        >
          −
        </button>
        <span className="vt-scale" title="点击还原 ( 0 )" onClick={reset}>
          {Math.round(view.scale * 100)}%
        </span>
        <button
          className="vt-btn"
          title="放大 ( + )"
          disabled={view.scale >= MAX_SCALE}
          onClick={() => zoomBy(STEP)}
        >
          ＋
        </button>
        <span className="vt-divider" />
        <button className="vt-btn" title="适应窗口 ( 0 )" onClick={reset}>
          ⤢
        </button>
        <a
          className="vt-btn"
          href={src || '#'}
          target="_blank"
          rel="noopener noreferrer"
          title="在新标签页查看原图"
          onClick={(e) => {
            if (!src) e.preventDefault()
          }}
        >
          ↗
        </a>
      </div>
    </div>
  )
}
