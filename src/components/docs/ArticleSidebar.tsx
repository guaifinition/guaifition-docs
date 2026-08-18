'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

type ArticleHeading = {
  depth: number
  text: string
  id: string
}

export function ArticleSidebar({ course, headings }: { course: string; headings: ArticleHeading[] }) {
  const [collapsed, setCollapsed] = useState(false)
  const [width, setWidth] = useState(360)
  const sidebarRef = useRef<HTMLElement>(null)
  const draggingRef = useRef(false)

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current || !sidebarRef.current) return
      const layout = sidebarRef.current.parentElement?.getBoundingClientRect()
      if (!layout) return
      setWidth(Math.min(520, Math.max(280, event.clientX - layout.left)))
    }
    const stopDragging = () => {
      draggingRef.current = false
      document.body.classList.remove('is-resizing-sidebar')
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
    }
  }, [])

  const startDragging = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (collapsed) return
    event.preventDefault()
    draggingRef.current = true
    document.body.classList.add('is-resizing-sidebar')
  }

  return (
    <aside
      ref={sidebarRef}
      className={`article-sidebar${collapsed ? ' is-collapsed' : ''}`}
      style={{ width: collapsed ? 58 : width }}
      aria-label="文章目录"
    >
      <div className="sidebar-toolbar">
        {!collapsed && <Link className="back-link" href={`/courses/${course}`}>← 返回课程首页</Link>}
        <button
          className="sidebar-toggle"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? '展开文章目录' : '收起文章目录'}
          title={collapsed ? '展开目录' : '收起目录'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="sidebar-heading-row">
            <p className="sidebar-label">本文目录</p>
            <span>{headings.length} 节</span>
          </div>
          <nav>
            {headings.map((heading) => (
              <a key={`${heading.id}-${heading.depth}`} className={heading.depth === 3 ? 'toc-h3' : ''} href={`#${heading.id}`}>
                {heading.text}
              </a>
            ))}
          </nav>
          <button className="sidebar-resizer" type="button" onPointerDown={startDragging} aria-label="拖动调整目录宽度" title="拖动调整目录宽度" />
        </>
      )}
    </aside>
  )
}
