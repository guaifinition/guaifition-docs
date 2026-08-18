import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export function DocsHeader({ courseTitle, course }: { courseTitle?: string; course?: string }) {
  return (
    <header className="docs-header">
      <Link className="docs-brand" href="/" aria-label="返回知识库首页">
        <span className="docs-brand-mark">✳</span>
        <span>Guaifinition Docs</span>
      </Link>
      <div className="docs-header-context">
        <Link href="/">首页</Link>
        {course && <Link href={`/courses/${course}`}>{courseTitle || '课程首页'}</Link>}
      </div>
      <ThemeToggle />
    </header>
  )
}
