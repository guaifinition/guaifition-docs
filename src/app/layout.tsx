import type { Metadata } from 'next'
import 'katex/dist/katex.min.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Guaifinition Docs · AI 技术课程知识库',
  description: '以 Markdown 为内容层、统一渲染公式与图表的本地 AI 技术课程知识库。',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="dark" data-theme="dark">
      <body>{children}</body>
    </html>
  )
}
