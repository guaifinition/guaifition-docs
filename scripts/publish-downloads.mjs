import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(projectRoot, 'content-library')
const assetRoot = path.join(projectRoot, 'public', 'content-assets')

const indexPath = path.join(contentRoot, 'index.json')
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
const existingRecords = indexData.records.filter((r) => !r.course.startsWith('aaai-2025') && r.course !== 'the-transformers')

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
})
turndown.use(gfm)
turndown.addRule('removeEmptyLinks', {
  filter: (node) => node.nodeName === 'A' && !node.textContent?.trim() && !node.querySelector('img'),
  replacement: () => '',
})

function safeSlug(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'article'
}

function cleanSummary(value) {
  return value
    .replace(/^\s*>\s?/gm, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220)
}

function sanitizeMarkdownTables(markdown) {
  const lines = markdown.split('\n')
  let columns = 0
  return lines.map((line) => {
    const trimmed = line.trim()
    if (!/^\|(?:\s*:?-+:?\s*\|)+\s*$/.test(trimmed)) {
      if (!/^\|.*\|\s*$/.test(trimmed)) columns = 0
      if (!columns || !/^\|.*\|\s*$/.test(trimmed)) return line
    }

    const rawCells = trimmed.replace(/^\|\s*/, '').replace(/\s*\|$/, '').split(/(?<!\\)\|/).map((cell) => cell.trim().replace(/\\\|/g, '|'))
    if (/^\|(?:\s*:?-+:?\s*\|)+\s*$/.test(trimmed)) {
      columns = rawCells.length
      return line
    }
    if (!columns || rawCells.length <= columns) return line
    const cells = [...rawCells.slice(0, columns - 1), rawCells.slice(columns - 1).join(' \\| ')]
    return `| ${cells.join(' | ')} |`
  }).join('\n')
}

function formalize(markdown) {
  return markdown
    .replace(/cite[\s\S]*?/g, '')
    .replace(/\bAl\b/g, 'AI')
    .replace(/\uFFFD+/g, '')
    .replace(/智能体AI/g, '智能体 AI')
    .replace(/大模型/g, '大型语言模型')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/(啊|呃|嗯|呢|对吧|就是说|我们来看|大家可以看到)[，、。；！]?/g, '')
    .replace(/！！！+/g, '。')
    .replace(/！！+/g, '。')
    .trim()
}

function stripFirstH1(markdown) {
  return markdown.replace(/^\s*#\s+[^\n]+\n+/m, '').trim()
}

// ---------------------------------------------------------------------------
// 1. 发布 AAAI 2025《人工智能研究的未来》逐章 MD
// ---------------------------------------------------------------------------
const downloadsDir = process.env.DOWNLOADS_DIR || path.join(os.homedir(), 'Downloads')
const aaaiSourceDir = path.join(downloadsDir, 'AAAI_2025_Future_of_AI_Research_逐章简体中文_MD')
const aaaiChapters = [
  { file: '00_封面与目录.md', module: '序言与报告概览', order: 1, fallbackSummary: 'AAAI 2025 主席专题小组《人工智能研究的未来》报告目录及各章节导览。' },
  { file: '01_引言.md', module: '序言与报告概览', order: 2 },
  { file: '02_专题小组成员与其他贡献者.md', module: '序言与报告概览', order: 3, fallbackSummary: 'AAAI 2025 主席专题小组成员、受邀贡献者及调研组织者名单。' },
  { file: '03_AI推理.md', module: '第一部分：核心能力与基础理论', order: 4 },
  { file: '04_AI事实性与可信性.md', module: '第一部分：核心能力与基础理论', order: 5 },
  { file: '05_AI智能体.md', module: '第一部分：核心能力与基础理论', order: 6 },
  { file: '06_AI评估.md', module: '第一部分：核心能力与基础理论', order: 7 },
  { file: '09_AI与认知科学.md', module: '第一部分：核心能力与基础理论', order: 8 },
  { file: '14_通用人工智能_AGI.md', module: '第一部分：核心能力与基础理论', order: 9 },
  { file: '08_具身人工智能.md', module: '第二部分：系统架构与物理结合', order: 10 },
  { file: '10_硬件与AI.md', module: '第二部分：系统架构与物理结合', order: 11 },
  { file: '07_AI伦理与安全.md', module: '第三部分：交叉学科与社会影响', order: 12 },
  { file: '11_AI促进社会公益.md', module: '第三部分：交叉学科与社会影响', order: 13 },
  { file: '12_AI与可持续发展.md', module: '第三部分：交叉学科与社会影响', order: 14 },
  { file: '13_AI促进科学发现.md', module: '第三部分：交叉学科与社会影响', order: 15 },
  { file: '15_AI的公众认知与现实.md', module: '第三部分：交叉学科与社会影响', order: 16 },
  { file: '16_AI研究方法的多样性.md', module: '第四部分：研究范式、生态与治理', order: 17 },
  { file: '17_超越AI研究社区的研究.md', module: '第四部分：研究范式、生态与治理', order: 18 },
  { file: '18_学术界的角色.md', module: '第四部分：研究范式、生态与治理', order: 19 },
  { file: '19_AI的地缘政治层面与影响.md', module: '第四部分：研究范式、生态与治理', order: 20 },
  { file: '20_关于AAAI.md', module: '附录与机构背景', order: 21 },
]

const newAaaiRecords = []
for (const item of aaaiChapters) {
  const filePath = path.join(aaaiSourceDir, item.file)
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`)
    continue
  }
  const rawText = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  const h1Match = rawText.match(/^\s*#\s+(.+?)\s*$/m)
  let title = h1Match ? h1Match[1].trim() : path.basename(item.file, '.md')
  if (item.file === '00_封面与目录.md') {
    title = '封面与目录'
  }

  const bodyText = stripFirstH1(rawText)
  const normalizedBody = sanitizeMarkdownTables(formalize(bodyText))

  let summary = ''
  if (item.fallbackSummary) {
    summary = item.fallbackSummary
  } else {
    const firstPara = normalizedBody.split(/\n\s*\n/).find((p) => {
      const trimmed = p.trim()
      return trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-') && !trimmed.startsWith('>')
    })
    summary = cleanSummary(firstPara || title)
  }

  const prefix = item.file.slice(0, 2)
  const slug = safeSlug(`aaai-2025-${prefix}-${title}`)
  const bodyFile = path.join(contentRoot, `${slug}.md`)
  fs.writeFileSync(bodyFile, normalizedBody + '\n', 'utf8')

  newAaaiRecords.push({
    id: `aaai-2025/${slug}`,
    course: 'aaai-2025',
    courseTitle: 'AAAI 2025 人工智能研究的未来',
    module: item.module,
    title,
    summary,
    bodyFile: path.relative(projectRoot, bodyFile).replaceAll('\\', '/'),
    sourceFiles: [`Downloads/AAAI_2025_Future_of_AI_Research_逐章简体中文_MD/${item.file}`],
    type: 'markdown',
    order: item.order,
    tags: ['AAAI 2025', 'AI 未来', '战略报告', '前沿研究'],
    originalUrl: 'https://aaai.org/',
  })
}

console.log(`Processed ${newAaaiRecords.length} AAAI 2025 chapters.`)

// ---------------------------------------------------------------------------
// 2. 发布 The Transformers 深度解析与实战指南 (HTML)
// ---------------------------------------------------------------------------
const transformersHtmlPath = path.join(downloadsDir, 'The Transformers - 简体中文版 (Vizuara AI Labs).html')
let newTransformersRecords = []

if (fs.existsSync(transformersHtmlPath)) {
  const rawHtml = fs.readFileSync(transformersHtmlPath, 'utf8')
  const $ = cheerio.load(rawHtml, { decodeEntities: false })

  const root = $('article .body.markup').first().clone()
  root.find('script, style, link, nav, header, footer, aside, button, dialog, .sr-only, [aria-hidden="true"], .image-controls, .post-ufi, .subscription-widget-wrap, .embedded-post-wrap, .digestPostEmbed-flwiST, .like-button-container').remove()

  // 截断文末推荐部分
  let foundMore = false
  root.children().each((_, el) => {
    if ($(el).text().includes('更多子堆栈')) foundMore = true
    if (foundMore) $(el).remove()
  })

  // 移除内嵌图的包含 <a>，保留 <img>
  root.find('a > img').each((_, img) => {
    const parentA = $(img).parent('a')
    parentA.replaceWith(img)
  })

  const courseSlug = 'the-transformers'
  const articleSlug = safeSlug(`${courseSlug}-the-transformers-架构深度解析与从零构建-bert`)
  const targetAssetDir = path.join(assetRoot, courseSlug, articleSlug)
  fs.mkdirSync(targetAssetDir, { recursive: true })

  let coverImageRelPath = null
  let imageCounter = 0

  root.find('img').each((_, element) => {
    const src = $(element).attr('src') || ''
    const match = src.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/)
    if (match) {
      const ext = match[1] === 'jpeg' ? '.jpg' : `.${match[1]}`
      const buffer = Buffer.from(match[2], 'base64')
      const imgHash = crypto.createHash('sha1').update(buffer).digest('hex').slice(0, 10)
      const filename = `fig_${String(imageCounter).padStart(3, '0')}_${imgHash}${ext}`
      const filePath = path.join(targetAssetDir, filename)
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, buffer)
      }
      const publicRef = `/content-assets/${courseSlug}/${articleSlug}/${filename}`
      $(element).attr('src', publicRef)
      if (imageCounter === 0) {
        // 第一张图作为封面图
        const coverFilename = `cover${ext}`
        const coverPath = path.join(targetAssetDir, coverFilename)
        if (!fs.existsSync(coverPath)) {
          fs.writeFileSync(coverPath, buffer)
        }
        coverImageRelPath = `/content-assets/${courseSlug}/${articleSlug}/${coverFilename}`
      }
      imageCounter++
    }
  })

  // 标题层级调整：原 H1 降为 H2，原 H2 降为 H3，原 H3 降为 H4，保证大纲可捕获
  root.find('h3').each((_, el) => { el.tagName = 'h4' })
  root.find('h2').each((_, el) => { el.tagName = 'h3' })
  root.find('h1').each((_, el) => { el.tagName = 'h2' })

  let markdown = turndown.turndown(root.html() || '')
  markdown = sanitizeMarkdownTables(formalize(stripFirstH1(markdown)))

  const bodyFile = path.join(contentRoot, `${articleSlug}.md`)
  fs.writeFileSync(bodyFile, markdown + '\n', 'utf8')

  newTransformersRecords.push({
    id: `${courseSlug}/${articleSlug}`,
    course: courseSlug,
    courseTitle: 'The Transformers — 架构解析与从零构建 BERT',
    module: '架构剖析与工程实战',
    title: 'The Transformers：架构深度解析与从零构建 BERT',
    summary: 'Transformer 架构的完整原理解析与自注意力机制详解，深入剖析输入嵌入与位置编码，并提供从零手写 BERT 代码的分步工程实战指南（Vizuara AI 实验室）。',
    bodyFile: path.relative(projectRoot, bodyFile).replaceAll('\\', '/'),
    sourceFiles: ['Downloads/The Transformers - 简体中文版 (Vizuara AI Labs).html'],
    type: 'html',
    order: 1,
    tags: ['Transformer', 'BERT', '自注意力机制', '架构实战'],
    publishedAt: '2026-09-03',
    coverImage: coverImageRelPath || undefined,
    coverAlt: 'The Transformers 完整架构与 BERT 构建实战封面',
    originalUrl: 'https://www.vizuaranewsletter.com/p/the-transformers',
  })

  console.log(`Processed The Transformers HTML with ${imageCounter} images extracted.`)
}

// ---------------------------------------------------------------------------
// 3. 整合并更新 index.json
// ---------------------------------------------------------------------------
const allRecords = [...existingRecords, ...newAaaiRecords, ...newTransformersRecords]

const byCourse = new Map()
for (const record of allRecords) {
  if (!byCourse.has(record.course)) byCourse.set(record.course, [])
  byCourse.get(record.course).push(record)
}
for (const list of byCourse.values()) {
  list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'zh-CN'))
}

const updatedCourses = [...byCourse.entries()].map(([id, items]) => ({
  id,
  title: items[0].courseTitle,
  count: items.length,
  modules: [...new Set(items.map((item) => item.module))],
  items: items.map((item) => item.id),
}))

const newIndex = {
  ...indexData,
  generatedAt: new Date().toISOString(),
  courses: updatedCourses,
  records: allRecords,
}

fs.writeFileSync(indexPath, JSON.stringify(newIndex, null, 2), 'utf8')
console.log(`Successfully updated index.json: total ${allRecords.length} records across ${updatedCourses.length} courses.`)
