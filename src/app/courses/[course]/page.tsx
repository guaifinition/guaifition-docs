import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DocsHeader } from '@/components/docs/DocsHeader'
import { getAllCourses, getCourse, getCourseRecords } from '@/lib/content'

export function generateStaticParams() {
  return getAllCourses().map((course) => ({ course: course.id }))
}

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course } = await params
  const metadata = getCourse(course)
  if (!metadata) notFound()
  const articles = getCourseRecords(course)

  return (
    <div className="docs-site">
      <DocsHeader course={course} courseTitle={metadata.title} />
      <main className="course-page">
        <Link className="back-link" href="/">← 返回知识库首页</Link>
        <p className="eyebrow">COURSE INDEX</p>
        <h1>{metadata.title}</h1>
        <p className="course-lead">按章节组织的技术课程与研究文章。进入文章后，左侧目录会自动提取正文 H2/H3 标题。</p>
        <div className="course-stats"><span>{articles.length} 篇文章</span><span>{metadata.modules.length} 个主题模块</span></div>
        <div className="lesson-list">
          {articles.map((article, index) => (
            <Link key={article.id} className="lesson-row" href={`/courses/${article.course}/${article.id.split('/')[1]}`}>
              <span className="lesson-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="lesson-copy"><strong>{article.title}</strong><small>{article.module} · {article.summary}</small></span>
              <span className="lesson-arrow">→</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
