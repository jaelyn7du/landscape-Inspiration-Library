import { memo, useState } from 'react'

function Card({ item, index, onOpen }) {
  const [failed, setFailed] = useState(false)

  return (
    <article
      className="card"
      style={{ animationDelay: `${Math.min(index, 20) * 22}ms` }}
      onClick={() => onOpen(item)}
    >
      <div className="card-img-wrapper">
        {failed || !item.image_url ? (
          <div className="card-img-placeholder">
            <span className="icon">🖼️</span>
            <span>图片加载失败</span>
          </div>
        ) : (
          <img
            src={item.image_url}
            alt={item.title}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{item.title}</h3>

        <div className="card-info">
          {item.source_platform && <span>📍 {item.source_platform}</span>}
        </div>
      </div>
    </article>
  )
}

export default memo(Card)
