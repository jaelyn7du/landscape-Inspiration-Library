import { useEffect, useMemo, useState } from 'react'
import Card from './Card.jsx'
import { STATUS_MAP, statusClass } from '../utils/format.js'

export default function AdminPanel({ items, onOpenItem, onToggleFav, onToggleLike, initialTab = 'overview' }) {
  const [sub, setSub] = useState(initialTab)

  useEffect(() => {
    setSub(initialTab)
  }, [initialTab])

  const favItems = useMemo(() => items.filter((i) => i.favorite), [items])
  const likedItems = useMemo(() => items.filter((i) => i.liked), [items])

  const stats = useMemo(() => {
    const sum = (k) => items.reduce((s, i) => s + (i[k] || 0), 0)
    const isDone = (i) => ['completed', 'success'].includes(i.tagging_status)
    return [
      { label: '图片总数', value: items.length, sub: '本地扫描图片' },
      {
        label: 'Excel 匹配',
        value: items.filter((i) => i.excel_matched).length,
        sub: '已匹配来源信息',
      },
      {
        label: 'AI 已完成',
        value: items.filter(isDone).length,
        sub: 'AI 标注完成',
      },
      {
        label: '待 AI 打标',
        value: items.filter((i) => !isDone(i)).length,
        sub: '尚未完成 AI 标注',
        warm: true,
      },
      {
        label: '需人工审核',
        value: items.filter((i) => i.need_review).length,
        sub: '置信度不足或待审核',
        warm: true,
      },
      { label: '总点赞数', value: sum('like_count'), sub: '来源帖子点赞汇总' },
      { label: '总收藏数', value: sum('collect_count'), sub: '来源帖子收藏汇总' },
      { label: '总评论数', value: sum('comment_count'), sub: '来源帖子评论汇总' },
      {
        label: '本地收藏',
        value: favItems.length,
        sub: '本地标记收藏',
        warm: true,
      },
      {
        label: '本地喜欢',
        value: likedItems.length,
        sub: '本地标记喜欢',
        warm: true,
      },
    ]
  }, [items, favItems.length, likedItems.length])

  const noop = () => {}

  const renderGrid = (list, emptyText) => {
    if (list.length === 0) {
      return (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>{emptyText}</h3>
          <p>去灵感库点击卡片上的 ★ / ♥ 标记，这里就会显示对应内容。</p>
        </div>
      )
    }
    return (
      <div className="masonry">
        {list.map((item, idx) => (
          <Card
            key={item.id}
            item={item}
            index={idx}
            onOpen={onOpenItem}
            onToggleFav={onToggleFav}
            onToggleLike={onToggleLike}
            onTagClick={noop}
          />
        ))}
      </div>
    )
  }

  return (
    <section className="section container" id="admin">
      <div className="section-head">
        <div>
          <div className="section-eyebrow">Dashboard</div>
          <h2 className="section-title">管理中心</h2>
          <p className="section-desc">数据概览与 AI 打标状态明细</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab${sub === 'overview' ? ' active' : ''}`}
          onClick={() => setSub('overview')}
        >
          概览
        </button>
        <button
          className={`admin-tab${sub === 'fav' ? ' active' : ''}`}
          onClick={() => setSub('fav')}
        >
          已收藏 <span className="admin-tab-count">{favItems.length}</span>
        </button>
        <button
          className={`admin-tab${sub === 'liked' ? ' active' : ''}`}
          onClick={() => setSub('liked')}
        >
          已点赞 <span className="admin-tab-count">{likedItems.length}</span>
        </button>
      </div>

      {sub === 'overview' && (
        <>
          <div className="admin-stats">
            {stats.map((s) => (
              <div className={`stat-card${s.warm ? ' warm' : ''}`} key={s.label}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>文件名</th>
                  <th>来源平台</th>
                  <th>景观类型</th>
                  <th>图片类型</th>
                  <th>AI状态</th>
                  <th>置信度</th>
                  <th>点赞</th>
                  <th>收藏</th>
                  <th>评论</th>
                  <th>需审核</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const st = item.tagging_status || 'pending'
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="ellipsis" title={item.title}>
                          {item.title}
                        </div>
                      </td>
                      <td>
                        <div className="ellipsis" title={item.file_name}>
                          {item.file_name || '-'}
                        </div>
                      </td>
                      <td>{item.source_platform || '-'}</td>
                      <td>{item.landscape_type || '-'}</td>
                      <td>{item.image_type || '-'}</td>
                      <td>
                        <span className={`status-badge status-${statusClass(st)}`}>
                          {STATUS_MAP[st] || st}
                        </span>
                      </td>
                      <td>{Math.round((item.confidence || 0) * 100)}%</td>
                      <td>{item.like_count}</td>
                      <td>{item.collect_count}</td>
                      <td>{item.comment_count}</td>
                      <td>{item.need_review ? '是' : '否'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {sub === 'fav' && renderGrid(favItems, '还没有收藏的内容')}
      {sub === 'liked' && renderGrid(likedItems, '还没有点赞的内容')}
    </section>
  )
}
