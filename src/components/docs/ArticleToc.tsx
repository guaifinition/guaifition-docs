'use client'

import { useEffect, useState } from 'react'

export type ArticleHeading = {
  depth: number
  text: string
  id: string
}

export function ArticleToc({ headings }: { headings: ArticleHeading[] }) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => Boolean(el))

      if (headingElements.length === 0) return

      const scrollY = window.scrollY
      const offset = 120 // 视口偏移行

      // 找到最后一个位于视口上方/附近的标题
      let currentId = headingElements[0].id
      for (const el of headingElements) {
        const top = el.getBoundingClientRect().top
        if (top <= offset) {
          currentId = el.id
        } else {
          break
        }
      }

      // 如果滚动到了页面底部，激活最后一个标题
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50) {
        currentId = headingElements[headingElements.length - 1].id
      }

      setActiveId(currentId)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
      history.pushState(null, '', `#${id}`)
    }
  }

  return (
    <aside className="article-toc" aria-label="当前文章大纲">
      <div className="article-toc-inner">
        <div className="article-toc-header">
          <p className="article-toc-label">本文目录</p>
          <span className="article-toc-count">{headings.length} 节</span>
        </div>

        <nav className="article-toc-nav">
          <ul className="article-toc-list">
            {headings.map((heading) => {
              const isActive = activeId === heading.id
              return (
                <li
                  key={`${heading.id}-${heading.depth}`}
                  className={`article-toc-item ${heading.depth === 3 ? 'is-h3' : 'is-h2'}${isActive ? ' is-active' : ''}`}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={(e) => handleClick(e, heading.id)}
                    title={heading.text}
                  >
                    {heading.text}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="article-toc-footer">
          <a className="toc-back-to-top" href="#top">
            <span>↑</span> 回到顶部
          </a>
        </div>
      </div>
    </aside>
  )
}
