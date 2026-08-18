import { useRef, useState } from 'react'
import { PLACEHOLDER } from '../utils/format.js'

/**
 * 详情页左侧图片：默认固定展示（不滚动缩放），
 * 鼠标悬停时以光标为锚点预览放大，点击进入全屏看图页。
 */
export default function HoverZoomImage({ src, alt, onOpen }) {
  const wrapRef = useRef(null)
  const [zoom, setZoom] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')

  const onMove = (e) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }

  return (
    <div
      className={`hover-zoom${zoom ? ' zooming' : ''}`}
      ref={wrapRef}
      onClick={() => onOpen?.()}
      onMouseEnter={() => setZoom(true)}
      onMouseMove={onMove}
      onMouseLeave={() => setZoom(false)}
      title="点击放大查看"
    >
      <img
        src={src || PLACEHOLDER}
        alt={alt}
        draggable={false}
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER
        }}
        style={{
          transformOrigin: origin,
          transform: zoom ? 'scale(2.2)' : 'scale(1)',
        }}
      />
      <div className="hover-zoom-hint">🔍 悬浮预览 · 点击放大</div>
    </div>
  )
}
