import { useEffect, useState } from 'react'

const USER = {
  name: 'Jaelyn',
  account: 'Jaelyn_2024',
}

export default function Navbar({ tab, onTabChange, total, filtered }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div
        className="nav-left"
        onClick={() => onTabChange('library')}
      >
        <div className="nav-logo">景</div>
        <div className="nav-brand">
          <span className="nav-title">风景园林案例灵感库</span>
          <span className="nav-sub">Landscape Inspiration</span>
        </div>
      </div>

      <div className="nav-center">
        <button
          className={`nav-tab${tab === 'library' ? ' active' : ''}`}
          onClick={() => onTabChange('library')}
        >
          灵感库
        </button>
      </div>

      <div className="nav-right">
        <span className="nav-stat">
          <b>{filtered}</b> / {total} 张
        </span>

        {/* 个人中心 */}
        <div className="nav-user">
          <div className="nav-user-trigger">
            <div className="nav-avatar">{USER.name[0]}</div>
            <span className="nav-user-name">{USER.name}</span>
            <span className="nav-caret">▾</span>
          </div>

          <div className="nav-user-pop">
            <button
              className="nav-menu-item"
              onClick={() => onTabChange('admin', 'overview')}
            >
              个人中心
            </button>
            <button
              className="nav-menu-item"
              onClick={() => onTabChange('admin', 'fav')}
            >
              已收藏
            </button>
            <button
              className="nav-menu-item"
              onClick={() => onTabChange('admin', 'liked')}
            >
              已点赞
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
