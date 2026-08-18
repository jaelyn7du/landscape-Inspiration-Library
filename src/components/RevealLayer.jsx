import { useRef, useEffect, useState } from 'react'

const SPOTLIGHT_R = 280

export default function RevealLayer({ baseImage, revealImage, cursorX, cursorY }) {
  const canvasRef = useRef(null)
  const [maskURL, setMaskURL] = useState('')
  const [size, setSize] = useState({ w: 0, h: 0 })

  /* 调整 canvas 尺寸（跟随窗口） */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w
      canvas.height = h
      setSize({ w, h })
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  /* 光标位置或画布尺寸变化时重绘 mask */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size.w === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cx = cursorX ?? -999
    const cy = cursorY ?? -999

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, SPOTLIGHT_R)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.4, 'rgba(255,255,255,1)')
    grad.addColorStop(0.6, 'rgba(255,255,255,0.75)')
    grad.addColorStop(0.75, 'rgba(255,255,255,0.4)')
    grad.addColorStop(0.88, 'rgba(255,255,255,0.12)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.beginPath()
    ctx.arc(cx, cy, SPOTLIGHT_R, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()

    try {
      const url = canvas.toDataURL()
      setMaskURL(url)
    } catch {
      /* 跨域等异常时忽略 */
    }
  }, [cursorX, cursorY, size])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <div
        className="reveal-layer"
        style={{
          backgroundImage: `url("${encodeURI(revealImage)}")`,
          maskImage: maskURL ? `url(${maskURL})` : undefined,
          WebkitMaskImage: maskURL ? `url(${maskURL})` : undefined,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
        }}
      />
    </>
  )
}
