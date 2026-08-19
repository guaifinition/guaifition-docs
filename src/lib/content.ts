import fs from 'node:fs'
import path from 'node:path'
import index from '../../content-library/index.json'

export type ContentRecord = {
  id: string
  course: string
  courseTitle: string
  module: string
  title: string
  summary: string
  bodyFile: string
  sourceFiles: string[]
  type: string
  order: number
  tags: string[]
  publishedAt?: string
  coverImage?: string
  coverAlt?: string
  originalUrl?: string
}

export type ContentCourse = {
  id: string
  title: string
  count: number
  modules: string[]
  items: string[]
}

export type ArticleGroup = {
  key: string
  title: string
  articles: ContentRecord[]
}

const records = index.records as ContentRecord[]
const courses = index.courses as ContentCourse[]
const generatedAt = (index as { generatedAt?: string }).generatedAt || ''

const paperFoundationCourses = new Set([
  'paper-ai-overview',
  'paper-neural-network',
  'paper-go',
  'paper-shortest-path',
  'paper-combinatorial-optimization',
  'paper-statistical-learning',
])

const paperLlmCourses = new Set([
  'paper-llm-prep',
  'paper-what-is-llm',
  'paper-reinforcement-learning',
  'paper-rlhf',
  'paper-bert',
  'paper-gpt',
  'paper-transformer',
])

export function getAllRecords() {
  return records
}

export function getLatestUpdate() {
  const datedRecords = records
    .filter((record) => record.publishedAt)
    .sort((a, b) => String(a.publishedAt).localeCompare(String(b.publishedAt)) || a.order - b.order)
  return {
    generatedAt,
    record: datedRecords[datedRecords.length - 1] || records[records.length - 1],
  }
}

export function getAllCourses() {
  return courses
}

export function getRecord(course: string, slug: string) {
  const decoded = decodeURIComponent(slug).normalize('NFC')
  return records.find((record) => record.course === course && record.id.split('/')[1].normalize('NFC') === decoded)
}

export function getCourse(course: string) {
  return courses.find((item) => item.id === course)
}

export function getCourseRecords(course: string) {
  return records
    .filter((record) => record.course === course)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'zh-CN'))
}

export function getCourseArticleGroups(course: string): ArticleGroup[] {
  const groups: ArticleGroup[] = []
  for (const article of getCourseRecords(course)) {
    const key = article.module || '课程正文'
    const existing = groups.find((group) => group.key === key)
    if (existing) existing.articles.push(article)
    else groups.push({ key, title: key, articles: [article] })
  }
  return groups
}

export function getBody(record: ContentRecord) {
  return fs.readFileSync(path.join(process.cwd(), 'content-library', path.basename(record.bodyFile)), 'utf8')
}

export function getCollectionName(course: string) {
  if (paperFoundationCourses.has(course)) return 'AI 基础与经典算法'
  if (paperLlmCourses.has(course)) return '大语言模型与生成式 AI'
  if (course === 'agentic-ai') return 'Agentic AI 智能体工作流'
  if (course === 'mcts') return '强化学习与智能决策'
  if (course === 'tech-series') return 'Agent 系统与 LLM 基础设施'
  if (course === 'ai-field-notes') return '专题研究与技术论文'
  if (course === 'model-evolution') return '专题研究与技术论文'
  if (course === 'research-notes') return '专题研究与技术论文'
  return '专题研究与技术论文'
}

export function getCollectionCourses() {
  const order = [
    'AI 基础与经典算法',
    '大语言模型与生成式 AI',
    'Agentic AI 智能体工作流',
    '强化学习与智能决策',
    'Agent 系统与 LLM 基础设施',
    '专题研究与技术论文',
  ]
  return order.map((name) => ({
    name,
    courses: courses.filter((course) => getCollectionName(course.id) === name),
  })).filter((group) => group.courses.length > 0)
}

export function getHomepageDirectory() {
  const learningAiIds = new Set([...paperFoundationCourses, ...paperLlmCourses])
  const collections = getCollectionCourses()
    .filter((group) => (
      group.name !== 'AI 基础与经典算法' &&
      group.name !== '大语言模型与生成式 AI' &&
      group.name !== 'Agentic AI 智能体工作流'
    ))
    .map((group) => ({ ...group, courses: group.courses.filter((course) => course.id !== 'mcts') }))
    .filter((group) => group.courses.length > 0)
  return {
    collections,
    agentic: courses.find((course) => course.id === 'agentic-ai'),
    learningAi: courses.filter((course) => learningAiIds.has(course.id)),
    supplement: courses.find((course) => course.id === 'mcts'),
  }
}

export function getPrevNext(record: ContentRecord) {
  const list = getCourseRecords(record.course)
  const position = list.findIndex((item) => item.id === record.id)
  return {
    previous: position > 0 ? list[position - 1] : undefined,
    next: position >= 0 && position < list.length - 1 ? list[position + 1] : undefined,
  }
}

export function getRecordAnchorId(record: ContentRecord) {
  return `article-${slugify(record.id)}`
}

export function extractHeadings(markdown: string) {
  const occurrences = new Map<string, number>()
  return [...markdown.matchAll(/^#{2,3}\s+(.+?)\s*$/gm)].map((match) => {
    const baseId = slugify(match[1])
    const occurrence = (occurrences.get(baseId) || 0) + 1
    occurrences.set(baseId, occurrence)
    return {
      depth: match[0].startsWith('###') ? 3 : 2,
      text: match[1].replace(/[`*_]/g, '').replace(/\\([.])/g, '$1').trim(),
      id: occurrence === 1 ? baseId : `${baseId}-${occurrence}`,
    }
  })
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[`*_]/g, '')
    .replace(/\\([.])/g, '$1')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}
