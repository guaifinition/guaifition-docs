import Link from 'next/link'
import { getRecordAnchorId } from '@/lib/content'
import type { ArticleGroup, ContentCourse, ContentRecord } from '@/lib/content'

function lessonTitle(article: ContentRecord, stripNestedPrefix: boolean) {
  return stripNestedPrefix ? article.title.replace(/^\d+\.\d+\s*/, '') : article.title
}

function LessonList({ articles, stripNestedPrefix = false }: { articles: ContentRecord[]; stripNestedPrefix?: boolean }) {
  return (
    <ol className="toc-lesson-list">
      {articles.map((article, index) => (
        <li key={article.id} id={getRecordAnchorId(article)}>
          <Link href={`/courses/${article.course}/${article.id.split('/')[1]}`}>
            <span className="toc-lesson-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="toc-lesson-title">{lessonTitle(article, stripNestedPrefix)}</span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

export function CourseToc({ course, articles, number, groups, stripNestedPrefix = false }: { course: ContentCourse; articles: ContentRecord[]; number: number; groups?: ArticleGroup[]; stripNestedPrefix?: boolean }) {
  return (
    <section className="toc-course" aria-labelledby={`course-${course.id}`}>
      <div className="toc-course-heading">
        <span className="toc-course-number">{String(number).padStart(2, '0')}</span>
        <div className="toc-course-title">
          <p className="eyebrow">COURSE</p>
          <h3 id={`course-${course.id}`}><Link href={`/courses/${course.id}`}>{course.title}</Link></h3>
          <p>{course.count} 讲 · {course.modules.slice(0, 2).join(' · ')}</p>
        </div>
        <Link className="toc-course-index" href={`/courses/${course.id}`} aria-label={`阅读${course.title}课程首页`}>课程首页&nbsp;→</Link>
      </div>
      {groups ? groups.map((group, index) => (
        <section className="toc-subsection" key={group.key}>
          <h4><span>{group.title.match(/^(\d+)\./)?.[1] || String(index + 1)}</span>{group.title.replace(/^\d+\.\s*/, '')}</h4>
          <LessonList articles={group.articles} stripNestedPrefix={stripNestedPrefix} />
        </section>
      )) : <LessonList articles={articles} stripNestedPrefix={stripNestedPrefix} />}
    </section>
  )
}
