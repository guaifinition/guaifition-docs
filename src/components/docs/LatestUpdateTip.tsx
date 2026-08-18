'use client'

import type { MouseEvent } from 'react'

type LatestArticle = {
  title: string
  detail: string
  targetId: string
}

export function LatestUpdateTip({ updatedAt, article }: { updatedAt: string; article?: LatestArticle }) {
  function jumpToArticle(event: MouseEvent<HTMLAnchorElement>) {
    if (!article) return
    const target = document.getElementById(article.targetId)
    if (!target) return
    event.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <aside className="latest-update-tip" aria-label="最近更新">
      <span className="latest-update-label">最近更新</span>
      <div className="latest-update-copy">
        <span>内容库更新时间 · {updatedAt}</span>
        {article && (
          <a href={`#${article.targetId}`} onClick={jumpToArticle}>
            <strong>{article.title}</strong>
            <small>{article.detail}</small>
          </a>
        )}
      </div>
    </aside>
  )
}
