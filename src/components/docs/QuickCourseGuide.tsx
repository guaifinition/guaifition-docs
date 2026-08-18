'use client'

import type { MouseEvent } from 'react'

type GuideItem = {
  id: string
  label: string
  detail?: string
}

function scrollToTarget(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id)
  if (!target) return
  event.preventDefault()
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function QuickCourseGuide({ items }: { items: GuideItem[] }) {
  return (
    <nav className="quick-course-guide" aria-label="课程快速定位">
      <div className="quick-course-guide-heading">
        <span>快速定位</span>
        <p>选择课程或主题，直接定位到首页目录</p>
      </div>
      <div className="quick-course-guide-list">
        {items.map((item, index) => (
          <a key={item.id} href={`#${item.id}`} onClick={(event) => scrollToTarget(event, item.id)}>
            <span className="quick-course-guide-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="quick-course-guide-copy">
              <strong>{item.label}</strong>
              {item.detail && <small>{item.detail}</small>}
            </span>
          </a>
        ))}
      </div>
    </nav>
  )
}
