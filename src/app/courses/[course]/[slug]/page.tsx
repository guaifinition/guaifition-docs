import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/docs/ArticleLayout'
import { getAllRecords, getBody, getRecord } from '@/lib/content'

export function generateStaticParams() {
  return getAllRecords().map((record) => ({
    course: record.course,
    slug: record.id.split('/')[1],
  }))
}

export default async function ArticlePage({ params }: { params: Promise<{ course: string; slug: string }> }) {
  const { course, slug } = await params
  const record = getRecord(course, slug)
  if (!record) notFound()
  return <ArticleLayout record={record} source={getBody(record)} />
}
