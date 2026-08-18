import Link from 'next/link'
import { getRecordAnchorId } from '@/lib/content'
import type { ContentCourse, ContentRecord } from '@/lib/content'

function LargeCourseLessons({ articles }: { articles: ContentRecord[] }) {
  return (
    <ol className="toc-lesson-list">
      {articles.map((article, index) => (
        <li key={article.id} id={getRecordAnchorId(article)}>
          <Link href={`/courses/${article.course}/${article.id.split('/')[1]}`}>
            <span className="toc-lesson-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="toc-lesson-title">{article.title}</span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

export function LargeCourseToc({ courses, getArticles }: { courses: ContentCourse[]; getArticles: (course: string) => ContentRecord[] }) {
  return (
    <section className="large-course-toc" id="course-follow-ai" aria-labelledby="course-follow-ai-title">
      <div className="large-course-heading">
        <span className="toc-course-number">01</span>
        <div>
          <p className="eyebrow">LARGE COURSE · 大课</p>
          <h2 id="course-follow-ai-title">跟我学 AI</h2>
          <p>13 门子课 · 88 讲 · 从人工智能基础到 Transformer 模型</p>
        </div>
      </div>
      <div className="large-course-list">
        {courses.map((course, index) => (
          <section className="toc-subcourse" key={course.id}>
            <div className="toc-subcourse-heading">
              <span>子课 {String(index + 1).padStart(2, '0')}</span>
              <h3><Link href={`/courses/${course.id}`}>{course.title}</Link></h3>
              <Link href={`/courses/${course.id}`}>课程首页&nbsp;→</Link>
            </div>
            <LargeCourseLessons articles={getArticles(course.id)} />
          </section>
        ))}
      </div>
    </section>
  )
}
