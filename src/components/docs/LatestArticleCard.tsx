/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'

type LatestArticle = {
  title: string
  summary: string
  detail: string
  href: string
  coverImage?: string
  coverAlt?: string
}

export function LatestArticleCard({ updatedAt, article }: { updatedAt: string; article?: LatestArticle }) {
  if (!article) return null

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

  return (
    <aside className="latest-article-card" aria-label="置顶与最近更新">
      <div className="latest-article-card-copy">
        <div className="latest-article-card-label">置顶 · 最近更新</div>
        <div className="latest-article-card-date">内容库更新时间 · {updatedAt}</div>
        <h2>{article.title}</h2>
        <p className="latest-article-card-summary">{article.summary}</p>
        <p className="latest-article-card-detail">{article.detail}</p>
        <Link className="latest-article-card-link" href={article.href}>阅读文章</Link>
      </div>
      <Link className="latest-article-card-media" href={article.href} aria-label={`阅读：${article.title}`}>
        {article.coverImage ? (
          <img src={`${basePath}${article.coverImage}`} alt={article.coverAlt || article.title} />
        ) : (
          <span>文章总结图</span>
        )}
      </Link>
    </aside>
  )
}
