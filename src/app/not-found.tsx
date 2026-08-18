import Link from 'next/link'
import { DocsHeader } from '@/components/docs/DocsHeader'

export default function NotFound() {
  return (
    <div className="docs-site">
      <DocsHeader />
      <main className="not-found-page">
        <p className="eyebrow">PAGE NOT FOUND</p>
        <h1>这篇内容暂时不可用。</h1>
        <p>页面可能已经移动，或者链接地址并不属于当前知识库。</p>
        <Link className="button-primary" href="/">
          <span>返回知识库首页</span><span className="button-arrow">→</span>
        </Link>
      </main>
    </div>
  )
}
