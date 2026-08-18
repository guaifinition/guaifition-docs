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
          </div>
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
