import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import StrokeText from './StrokeText.jsx'
import RevealLayer from './RevealLayer.jsx'
import CardSwap, { Card as SwapCard } from './CardSwap.jsx'

const HERO_IMAGE = './小红书素材爬取/一窥世界-重庆龙湖江屿海棠.jpeg'

export default function Hero({ items, onExplore, onPersonal, onOpenItem }) {
  const stats = useMemo(() => {
    const styles = new Set()
    const types = new Set()
    items.forEach((i) => {
      i.style_tags.forEach((s) => styles.add(s))
      if (i.landscape_type) types.add(i.landscape_type)
    })
    return {
      total: items.length,
      styles: styles.size,
      types: types.size,
    }
  }, [items])

  /* 从灵感库随机抽取 6 张有图的照片用于右侧 CardSwap 轮播 */
  const [swapItems] = useState(() => {
    const list = items.filter((i) => i.image_url)
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[list[i], list[j]] = [list[j], list[i]]
    }
    return list.slice(0, 6)
  })
  const swapCards = useMemo(
    () =>
      swapItems.map((i) => (
        <SwapCard key={i.id}>
          <img
            src={i.image_url}
            alt={i.title || '素材照片'}
            className="swap-card-image"
          />
        </SwapCard>
      )),
    [swapItems]
  )

  /* ---------- Interactive Discovery: 鼠标跟随聚光灯 ---------- */
  const mouseRef = useRef({ x: -999, y: -999 })
  const smoothRef = useRef({ x: -999, y: -999 })
  const rafRef = useRef(null)
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 })

  const handleMouseMove = useCallback((e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  useEffect(() => {
    /* lerp 平滑循环 */
    const loop = () => {
      const m = mouseRef.current
      const s = smoothRef.current
      s.x += (m.x - s.x) * 0.1
      s.y += (m.y - s.y) * 0.1
      setCursorPos({ x: s.x, y: s.y })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <header className="hero" id="hero" onMouseMove={handleMouseMove}>
      {/* Layer 1: 底层暗化图片（base） */}
      <div
        className="hero-base-layer"
        style={{ backgroundImage: `url("${encodeURI(HERO_IMAGE)}")` }}
      />

      {/* Layer 2: 聚光灯揭示层（reveal） */}
      <RevealLayer
        baseImage={HERO_IMAGE}
        revealImage={HERO_IMAGE}
        cursorX={cursorPos.x}
        cursorY={cursorPos.y}
      />

      {/* 遮罩 + 噪点 */}
      <div className="hero-overlay" />
      <div className="hero-grain" />

      {/* 内容区 — 左侧对齐 */}
      <div className="hero-content">
        {/* 左侧主标题区 */}
        <div className="hero-left">
          <h1 className="hero-title">
            <span className="title-line title-stroke">
              <StrokeText
                text="藏山川于像素"
                strokeColor="#a8e6c4"
                fillColor="#d0e8dc"
                strokeWidth={1.2}
                drawDuration={1.8}
                fillDelay={0.15}
                stagger={0.06}
                ease="power2.out"
                trigger="mount"
                fillMode="wipe"
                fontSize={96}
                fontWeight={700}
                letterSpacing={6}
              />
            </span>
            <span className="title-line title-stroke">
              <StrokeText
                text="赋场地以新生"
                strokeColor="#8fd4b1"
                fillColor="#ffffff"
                strokeWidth={1.2}
                drawDuration={1.8}
                fillDelay={0.15}
                stagger={0.06}
                ease="power2.out"
                trigger="mount"
                fillMode="wipe"
                fontSize={96}
                fontWeight={700}
                letterSpacing={6}
              />
            </span>
          </h1>

          <div className="hero-divider" />

          <p className="hero-desc">
            汇集国内外优质景观案例，用像素记录山川肌理，为设计注入新生灵感
          </p>

          <div className="hero-actions">
            <button className="hero-btn primary" onClick={onExplore}>
              进入灵感库
              <span>→</span>
            </button>
          </div>

          <div className="hero-stats">
            <div>
              <div className="hero-stat-val">{stats.total}</div>
              <div className="hero-stat-label">案例图片</div>
            </div>
            <div>
              <div className="hero-stat-val">{stats.types}</div>
              <div className="hero-stat-label">景观类型</div>
            </div>
            <div>
              <div className="hero-stat-val">{stats.styles}</div>
              <div className="hero-stat-label">设计风格</div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：CardSwap 照片堆叠轮播 */}
      <div className="hero-card-swap" aria-hidden="true">
        <CardSwap
          width={260}
          height={340}
          cardDistance={30}
          verticalDistance={45}
          delay={4500}
          pauseOnHover={true}
          skewAmount={5}
          easing="elastic"
          onCardClick={(idx) => onOpenItem?.(swapItems[idx])}
        >
          {swapCards}
        </CardSwap>
      </div>

      <button className="hero-scroll" onClick={onExplore} aria-label="向下滚动">
        <span className="mouse" />
        SCROLL
      </button>
    </header>
  )
}
