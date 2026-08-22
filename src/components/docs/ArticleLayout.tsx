/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { DocsHeader } from './DocsHeader'
import { ArticleSidebar } from './ArticleSidebar'
import { MarkdownArticle } from './MarkdownArticle'
import { TitleWithEnglish } from './TitleWithEnglish'
import { extractHeadings, getPrevNext, type ContentRecord } from '@/lib/content'

export function ArticleLayout({ record, source }: { record: ContentRecord; source: string }) {
  const headings = extractHeadings(source)
  const { previous, next } = getPrevNext(record)

  return (
    <div id="top" className="docs-site">
      <DocsHeader course={record.course} courseTitle={record.courseTitle} />
      <div className="article-layout">
        <ArticleSidebar course={record.course} headings={headings} />

        <main className="article-main">
          <div className="article-kicker">{record.courseTitle} / {record.module}</div>
          <h1 className="bilingual-title"><TitleWithEnglish title={record.title} /></h1>
          <p className="article-summary">{record.summary}</p>
          <div className="article-meta">
            <span>{record.tags.slice(0, 4).join(' · ')}</span>
            <span>知识库文章</span>
            {record.originalUrl && (
              <a className="article-source-link" href={record.originalUrl} target="_blank" rel="noreferrer">
                {record.originalUrl.includes('youtube.com') || record.originalUrl.includes('youtu.be')
                  ? '原视频链接 · YouTube'
                  : record.originalUrl.includes('deeplearning.ai')
                  ? '原文来源 · DeepLearning.AI'
                  : '查看原文来源'}
              </a>
            )}
          </div>
          {record.coverImage && (
            <figure className="article-cover">
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}${record.coverImage}`}
                alt={record.coverAlt || record.title}
                loading="eager"
                decoding="async"
              />
            </figure>
          )}
          <MarkdownArticle source={source} />
          <nav className="article-pager" aria-label="文章导航">
            {previous ? <Link href={`/courses/${previous.course}/${previous.id.split('/')[1]}`}>← {previous.title}</Link> : <span />}
            <a href="#top">回到顶部</a>
            {next ? <Link href={`/courses/${next.course}/${next.id.split('/')[1]}`}>{next.title} →</Link> : <span />}
          </nav>
        </main>
      </div>
    </div>
  )
}
