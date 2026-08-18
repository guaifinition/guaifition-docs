import Link from 'next/link'
import type { ContentCourse } from '@/lib/content'

export function CourseCard({ course }: { course: ContentCourse }) {
  return (
    <Link className="course-card" href={`/courses/${course.id}`}>
      <div className="course-card-index">{String(course.count).padStart(2, '0')}</div>
      <div>
        <p className="eyebrow">COURSE</p>
        <h3>{course.title}</h3>
        <p>{course.count} 篇文章 · {course.modules.slice(0, 2).join(' · ')}</p>
      </div>
      <span className="course-card-arrow">→</span>
    </Link>
  )
}
