import { useEffect } from 'react'
import ImageViewer from './ImageViewer.jsx'

/**
 * 全屏看图页：点击详情页左侧图片后独立展开，
 * 占据整个视口，图片可自由缩放 / 拖拽平移。
 */
export default function FullscreenViewer({ item, onClose }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!item) return null

  return (
    <div className="fs-viewer" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fs-viewer-top">
        <div className="fs-viewer-title" title={item.title}>
          {item.title}
        </div>
        <button className="fs-viewer-close" onClick={onClose} aria-label="关闭">
          ✕ 关闭
        </button>
      </div>

      <div className="fs-viewer-stage">
        <ImageViewer src={item.image_url} alt={item.title} />
      </div>

      <div className="fs-viewer-foot">
        滚轮缩放 · 拖拽平移 · 双击放大/还原 · Esc 关闭
      </div>
    </div>
  )
}
