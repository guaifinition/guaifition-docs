'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { ArticleGroup, ContentCourse, ContentRecord } from '@/lib/content'

type CourseSidebarProps = {
  course: ContentCourse
  articles: ContentRecord[]
  groups?: ArticleGroup[]
  currentArticleId: string
}

export function CourseSidebar({ course, articles, groups, currentArticleId }: CourseSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [width, setWidth] = useState(300)
  const sidebarRef = useRef<HTMLElement>(null)
  const draggingRef = useRef(false)
  const activeItemRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current || !sidebarRef.current) return
      const layout = sidebarRef.current.parentElement?.getBoundingClientRect()
      if (!layout) return
      setWidth(Math.min(460, Math.max(240, event.clientX - layout.left)))
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

  // 自动将当前阅读章节滚动到左侧导航视野中
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [currentArticleId])

  const startDragging = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (collapsed) return
    event.preventDefault()
    draggingRef.current = true
    document.body.classList.add('is-resizing-sidebar')
  }

  // 检查是否有实质性的多分组
  const hasMultipleGroups = Boolean(
    groups && groups.length > 1 && groups.some((g) => g.key !== '课程正文' && g.key !== '专题文章')
  )

  const renderArticleItem = (article: ContentRecord, index: number) => {
    const isActive = article.id === currentArticleId
    const slug = article.id.split('/')[1]
    const href = `/courses/${article.course}/${slug}`

    return (
      <li
        key={article.id}
        ref={isActive ? activeItemRef : undefined}
        className={`course-nav-item${isActive ? ' is-active' : ''}`}
      >
        <Link href={href} title={article.title}>
          <span className="course-nav-num">{String(article.order || index + 1).padStart(2, '0')}</span>
          <span className="course-nav-text">{article.title}</span>
        </Link>
      </li>
    )
  }

  return (
    <aside
      ref={sidebarRef}
      className={`course-sidebar${collapsed ? ' is-collapsed' : ''}`}
      style={{ width: collapsed ? 56 : width }}
      aria-label="课程章节导航"
    >
      <div className="course-sidebar-toolbar">
        {!collapsed ? (
          <Link className="course-sidebar-back" href={`/courses/${course.id}`}>
            ← 返回课程首页
          </Link>
        ) : (
          <span className="course-sidebar-collapsed-mark" title={course.title}>📚</span>
        )}
        <button
          className="course-sidebar-toggle"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? '展开课程导航' : '收起课程导航'}
          title={collapsed ? '展开课程导航' : '收起课程导航'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {!collapsed && (
        <div className="course-sidebar-content">
          <div className="course-sidebar-header">
            <p className="course-sidebar-badge">COURSE</p>
            <h2 className="course-sidebar-title">
              <Link href={`/courses/${course.id}`}>{course.title}</Link>
            </h2>
            <div className="course-sidebar-meta">
              <span>共 {articles.length} 篇</span>
              <span>·</span>
              <Link href="/" className="course-sidebar-home-link">知识库首页</Link>
            </div>
          </div>

          <nav className="course-sidebar-nav">
            {hasMultipleGroups && groups ? (
              groups.map((group) => (
                <div className="course-nav-group" key={group.key}>
                  <div className="course-nav-group-title" title={group.title}>
                    {group.title}
                  </div>
                  <ul className="course-nav-list">
                    {group.articles.map((article, idx) => renderArticleItem(article, idx))}
                  </ul>
                </div>
              ))
            ) : (
              <ul className="course-nav-list">
                {articles.map((article, idx) => renderArticleItem(article, idx))}
              </ul>
            )}
          </nav>

          <button
            className="sidebar-resizer"
            type="button"
            onPointerDown={startDragging}
            aria-label="拖动调整边栏宽度"
            title="拖动调整边栏宽度"
          />
        </div>
      )}
    </aside>
  )
}
