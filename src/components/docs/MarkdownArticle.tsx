/* eslint-disable @next/next/no-img-element */
import ReactMarkdown from 'react-markdown'
import type { ReactNode } from 'react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import { slugify } from '@/lib/content'

export function MarkdownArticle({ source }: { source: string }) {
  const headingOccurrences = new Map<string, number>()
  const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const uniqueHeadingId = (children: ReactNode) => {
    const base = slugify(String(children))
    const occurrence = (headingOccurrences.get(base) || 0) + 1
    headingOccurrences.set(base, occurrence)
    return occurrence === 1 ? base : `${base}-${occurrence}`
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          h2: ({ children, ...props }) => <h2 id={uniqueHeadingId(children)} {...props}>{children}</h2>,
          h3: ({ children, ...props }) => <h3 id={uniqueHeadingId(children)} {...props}>{children}</h3>,
          a: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a>,
          img: ({ alt, ...props }) => <img alt={alt || ''} loading="eager" decoding="async" {...props} />,
          pre: ({ children }) => <pre className="code-block">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="callout">{children}</blockquote>,
        }}
      >
        {source
          .replace(/cite[\s\S]*?/g, '')
          .replaceAll('](/content-assets/', `](${assetPrefix}/content-assets/`)
          .replaceAll('src="/content-assets/', `src="${assetPrefix}/content-assets/`)}
      </ReactMarkdown>
    </div>
  )
}
