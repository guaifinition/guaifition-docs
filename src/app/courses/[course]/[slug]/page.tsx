import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/docs/ArticleLayout'
import { getAllRecords, getBody, getRecord } from '@/lib/content'

export function generateStaticParams() {
  const params: { course: string; slug: string }[] = []
  for (const record of getAllRecords()) {
    const slug = record.id.split('/')[1]
    params.push({ course: record.course, slug })
    const encoded = encodeURIComponent(slug)
    if (encoded !== slug && encoded.length < 150) {
      params.push({ course: record.course, slug: encoded })
    }
  }
  return params
}

export default async function ArticlePage({ params }: { params: Promise<{ course: string; slug: string }> }) {
  const { course, slug } = await params
  const record = getRecord(course, slug)
  if (!record) notFound()
  return <ArticleLayout record={record} source={getBody(record)} />
}
