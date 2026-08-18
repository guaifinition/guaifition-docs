import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import * as cheerio from 'cheerio'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const workspaceRoot = path.resolve(projectRoot, '..')
const documentsRoot = path.join(os.homedir(), 'Documents')
const contentRoot = path.join(projectRoot, 'content-library')
const assetRoot = path.join(projectRoot, 'public', 'content-assets')

fs.rmSync(contentRoot, { recursive: true, force: true })
fs.rmSync(assetRoot, { recursive: true, force: true })
fs.mkdirSync(contentRoot, { recursive: true })
fs.mkdirSync(assetRoot, { recursive: true })

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

const records = []
const usedSlugs = new Set()

function readText(file) {
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')
}

function safeSlug(value) {
  const base = value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'article'
  let slug = base
  let index = 2
  while (usedSlugs.has(slug)) slug = `${base}-${index++}`
  usedSlugs.add(slug)
  return slug
}

function hash(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 10)
}

function relativeToWorkspace(file) {
  return path.relative(workspaceRoot, file).replaceAll('\\', '/')
}

function titleFromMarkdown(text, fallback) {
  const match = text.match(/^\s*#\s+(.+?)\s*$/m)
  return (match?.[1] || fallback).replace(/\s+/g, ' ').trim()
}

function titleFromHtml(text, fallback) {
  const $ = cheerio.load(text)
  const value = $('title').first().text().replace(/\s+/g, ' ').trim()
  return value.replace(/\s*[|—-]\s*(AI Field Notes|OpenAI-style documentation|Claude-style documentation).*$/i, '').trim() || fallback
}

function isNotFoundPage(file, text) {
  const normalizedPath = file.replaceAll('\\', '/')
  if (/(^|\/)(404|_not-found)(\/|$)/i.test(normalizedPath)) return true
  const $ = cheerio.load(text)
  const title = $('title').first().text().replace(/\s+/g, ' ').trim()
  $('script, style, noscript').remove()
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  return /^404\b/i.test(title) || /this page could not be found/i.test(bodyText)
}

function stripFirstH1(markdown) {
  return markdown.replace(/^\s*#\s+[^\n]+\n+/m, '').trim()
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

function summaryFromBody(markdown) {
  return cleanSummary(markdown
    .replace(/^\s*#{1,6}\s+[^\n]+\n+/m, '')
    .split(/\n\s*\n/)[0])
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

function copyAsset(source, course, slug) {
  if (!source || !fs.existsSync(source) || !fs.statSync(source).isFile()) return null
  const ext = path.extname(source)
  const name = `${hash(path.resolve(source))}${ext}`
  const targetDir = path.join(assetRoot, course, slug)
  fs.mkdirSync(targetDir, { recursive: true })
  const target = path.join(targetDir, name)
  if (!fs.existsSync(target)) fs.copyFileSync(source, target)
  return `/content-assets/${course}/${slug}/${name}`
}

function rewriteMarkdownAssets(markdown, sourceFile, course, slug, sourceRoot) {
  const sourceDir = path.dirname(sourceFile)
  return markdown.replace(/(!?\[[^\]]*\]\()([^\)]+)(\))/g, (full, prefix, rawRef, suffix) => {
    const ref = rawRef.trim().replace(/^<|>$/g, '')
    if (/^(https?:|data:|\/)/i.test(ref)) return full
    const cleanRef = ref.split(/[?#]/)[0]
    const candidates = [
      path.resolve(sourceDir, cleanRef),
      path.resolve(sourceRoot, cleanRef),
      path.resolve(sourceRoot, cleanRef.replace(/^\.\//, '')),
    ]
    const source = candidates.find((candidate) => fs.existsSync(candidate))
    const publicRef = copyAsset(source, course, slug, ref)
    return publicRef ? `${prefix}${publicRef}${suffix}` : full
  })
}

function htmlToMarkdown(sourceFile, text, course, slug, assetRoots = []) {
  const $ = cheerio.load(text, { decodeEntities: false })
  const root = $('main').first().length ? $('main').first() : $('article').first().length ? $('article').first() : $('body')
  root.find('script, style, link, nav, header, footer, aside, button, dialog, .sr-only, [aria-hidden="true"], .kb-breadcrumbs, [class*="breadcrumb"], .kb-article-nav, [class*="article-nav"], .kb-resize-handle').remove()
  root.find('[hidden]').remove()
  root.find('svg').each((_, element) => {
    const rawSvg = $.html(element)
    const svg = rawSvg.replace(/^<svg\s/i, '<svg xmlns="http://www.w3.org/2000/svg" width="100%" preserveAspectRatio="xMidYMid meet" ')
    const name = `${hash(svg)}.svg`
    const targetDir = path.join(assetRoot, course, slug)
    fs.mkdirSync(targetDir, { recursive: true })
    const target = path.join(targetDir, name)
    if (!fs.existsSync(target)) fs.writeFileSync(target, svg, 'utf8')
    const publicRef = `/content-assets/${course}/${slug}/${name}`
    const alt = $(element).attr('aria-label') || '图示'
    $(element).replaceWith(`<img src="${publicRef}" alt="${alt.replaceAll('"', '&quot;')}" />`)
  })
  root.find('img').each((_, element) => {
    const ref = $(element).attr('src') || $(element).attr('data-src')
    if (!ref || /^(https?:|data:)/i.test(ref)) return
    const cleanRef = ref.split(/[?#]/)[0]
    const candidates = [
      path.resolve(path.dirname(sourceFile), cleanRef),
      path.resolve(workspaceRoot, cleanRef.replace(/^\/+/, '')),
      ...assetRoots.map((rootPath) => path.resolve(rootPath, cleanRef.replace(/^\/+/, ''))),
    ]
    const source = candidates.find((candidate) => fs.existsSync(candidate))
    const publicRef = copyAsset(source, course, slug, ref)
    if (publicRef) $(element).attr('src', publicRef)
  })
  let htmlFragment = root.html() || ''
  const formulas = []
  const protectFormula = (full, body, display) => {
    const marker = `MATH_BLOCK_${formulas.length}_END`
    formulas.push({ marker, value: display ? `$$\n${body}\n$$` : `$${body}$` })
    return `<span>${marker}</span>`
  }
  htmlFragment = htmlFragment
    .replace(/\\\[([\s\S]*?)\\\]/g, (full, body) => protectFormula(full, body, true))
    .replace(/\\\(([\s\S]*?)\\\)/g, (full, body) => protectFormula(full, body, false))
    .replace(/\$\$([\s\S]*?)\$\$/g, (full, body) => protectFormula(full, body, true))
  let markdown = turndown.turndown(htmlFragment)
  for (const formula of formulas) {
    const escapedMarker = formula.marker.replaceAll('_', '\\_')
    markdown = markdown.replaceAll(escapedMarker, formula.value).replaceAll(formula.marker, formula.value)
  }
  return sanitizeMarkdownTables(stripFirstH1(markdown))
}

function addRecord({ course, courseTitle, module, title, summary, sourceFile, sourceFiles, type, body, order, tags = [], originalUrl }) {
  const slug = safeSlug(`${course}-${title}`)
  const bodyWithAssets = type === 'markdown'
    ? rewriteMarkdownAssets(body, sourceFile, course, slug, path.dirname(sourceFile))
    : body
  const normalizedBody = sanitizeMarkdownTables(formalize(stripFirstH1(bodyWithAssets)))
  const bodyFile = path.join(contentRoot, `${slug}.md`)
  fs.writeFileSync(bodyFile, normalizedBody + '\n', 'utf8')
  records.push({
    id: `${course}/${slug}`,
    course,
    courseTitle,
    module,
    title,
    summary: cleanSummary(summary || summaryFromBody(normalizedBody)),
    bodyFile: path.relative(projectRoot, bodyFile).replaceAll('\\', '/'),
    sourceFiles: [...new Set(sourceFiles || [relativeToWorkspace(sourceFile)])],
    type,
    order,
    tags,
    originalUrl,
  })
}

function markdownFile(file, config) {
  const text = readText(file)
  const title = titleFromMarkdown(text, path.basename(file, '.md'))
  addRecord({ ...config, title, sourceFile: file, sourceFiles: [relativeToWorkspace(file)], type: 'markdown', body: text })
}

function htmlFile(file, config) {
  const text = readText(file)
  if (isNotFoundPage(file, text)) return false
  const title = titleFromHtml(text, path.basename(file, '.html'))
  const slug = safeSlug(`${config.course}-${title}`)
  const body = htmlToMarkdown(file, text, config.course, slug, config.assetRoots || [])
  const bodyFile = path.join(contentRoot, `${slug}.md`)
  const normalizedBody = sanitizeMarkdownTables(formalize(body))
  fs.writeFileSync(bodyFile, normalizedBody + '\n', 'utf8')
  records.push({
    id: `${config.course}/${slug}`,
    course: config.course,
    courseTitle: config.courseTitle,
    module: config.module,
    title,
    summary: cleanSummary(config.summary || summaryFromBody(normalizedBody)),
    bodyFile: path.relative(projectRoot, bodyFile).replaceAll('\\', '/'),
    sourceFiles: [relativeToWorkspace(file)],
    type: 'html',
    order: config.order,
    tags: config.tags || [],
    originalUrl: config.originalUrl,
  })
  return true
}

function listFiles(root, extension) {
  if (!fs.existsSync(root)) return []
  const output = []
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name)
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist' || entry.name === '__MACOSX') continue
    if (entry.isDirectory()) output.push(...listFiles(full, extension))
    else if (full.toLowerCase().endsWith(extension)) output.push(full)
  }
  return output
}

const agenticRoot = path.join(workspaceRoot, 'agentic-ai-blog', 'agentic-ai')
const agenticFiles = listFiles(agenticRoot, '.md')
  .filter((file) => !['README.md', 'LICENSE'].includes(path.basename(file)))
  .filter((file) => !file.includes('无评分实验'))
  .sort((a, b) => a.localeCompare(b, 'zh-CN'))
agenticFiles.forEach((file, index) => {
  const rel = path.relative(agenticRoot, file)
  const sectionName = path.dirname(rel).split(path.sep)[0] || '课程正文'
  markdownFile(file, {
    course: 'agentic-ai',
    courseTitle: 'Agentic AI 智能体工作流',
    module: sectionName,
    order: index + 1,
    tags: ['Agentic AI', 'LLM', 'Agent Workflow'],
    originalUrl: 'https://learn.deeplearning.ai/courses/agentic-ai',
  })
})

const mctsFile = path.join(workspaceRoot, 'mcts-blog', 'public', 'index.html')
if (fs.existsSync(mctsFile)) htmlFile(mctsFile, {
  course: 'mcts', courseTitle: '搜索与决策算法', module: '蒙特卡洛树搜索', order: 1,
  tags: ['MCTS', 'UCT', 'Monte Carlo'],
})

const techRoot = path.join(workspaceRoot, 'tech-series')
const techFiles = listFiles(techRoot, '.html')
  .filter((file) => !isNotFoundPage(file, readText(file)))
  .sort((a, b) => a.localeCompare(b))
techFiles.forEach((file, index) => {
  const relative = path.relative(techRoot, file)
  const sectionName = relative === 'index.html' ? '系列总览' : '技术研究报告'
  htmlFile(file, {
    course: 'tech-series', courseTitle: 'Agent 系统与 LLM 基础设施', module: sectionName, order: index + 1,
    tags: ['Agent Systems', 'LLM Infrastructure'],
    assetRoots: [techRoot],
  })
})

const paperLibraryRoot = path.join(
  os.homedir(),
  'Downloads',
  'AI课程_论文式HTML知识库_13门88讲',
  'AI课程_论文式HTML知识库',
)
const paperManifestPath = path.join(paperLibraryRoot, 'manifest.json')
if (fs.existsSync(paperManifestPath)) {
  const paperManifest = JSON.parse(readText(paperManifestPath))
  const paperCourseRoot = path.join(paperLibraryRoot, 'courses')
  for (const item of paperManifest) {
    const sourceFile = path.join(paperLibraryRoot, item.file)
    if (!fs.existsSync(sourceFile)) continue
    htmlFile(sourceFile, {
      course: `paper-${item.slug}`,
      courseTitle: item.course,
      module: `第 ${String(item.course_no).padStart(2, '0')} 门课程`,
      order: Number(item.chapter),
      tags: ['AI 课程', '论文式讲义', item.course],
      assetRoots: [paperCourseRoot, paperLibraryRoot, path.dirname(sourceFile)],
    })
  }
}

const docFiles = listFiles(documentsRoot, '.md').concat(listFiles(documentsRoot, '.html')).filter((file) => {
  const rel = path.relative(documentsRoot, file).replaceAll('\\', '/')
  const base = path.basename(file)
  const businessDocumentNames = new Set(['# 分析 odin 接口参数.md', 'EXPERIMENT_REPORT.md', 'vrs_pugc_category_mapping.md', 'vrs-pugc分类对照.md'])
  if (rel.startsWith('Codex/') || rel.includes('__MACOSX/') || rel.includes('/node_modules/') || rel.includes('/.next/') || rel.includes('/dist/')) return false
  if (base === 'HANDOVER.md' || base === 'HANDOVER-flclash-js脚本交接.md' || base === 'OFFICIAL-SKILLS-MD-LIST.zh-CN.md') return false
  if (/^YouTube_字幕_翻译_/i.test(base)) return false
  if (businessDocumentNames.has(base)) return false
  if (base.startsWith('opus5_max_wedding_speeches') || base.includes('新郎')) return false
  if (base === 'frame.html') return false
  if (rel.includes('x-waterloo-intern/') && !rel.startsWith('x-waterloo-intern 2/')) return false
  if (rel.startsWith('x-waterloo-intern 2/') && file.toLowerCase().endsWith('.html') && fs.existsSync(file.replace(/\.html$/i, '.md'))) return false
  if (rel.startsWith('x-waterloo-intern 2/') && base.toLowerCase().endsWith('.en.md')) return false
  if (rel.includes('2402.17152v3_zh-CN.html') && !rel.includes('_openai.html')) return false
  if (rel.includes('朱松纯两万字演讲') && !base.includes('_openai_images_fixed.html')) return false
  if (rel === 'anthropic-ai-field-notes/README.md') return false
  return true
}).sort((a, b) => a.localeCompare(b, 'zh-CN'))

const docCourse = (file) => {
  const rel = path.relative(documentsRoot, file).replaceAll('\\', '/')
  if (rel.startsWith('md/')) return ['research-notes', '专题研究笔记', '研究与实验']
  if (rel.startsWith('anthropic-ai-field-notes/') || rel.startsWith('Controlling_Reasoning')) return ['ai-field-notes', 'AI Field Notes', '模型与 Agent 工程']
  if (rel.startsWith('x-waterloo-intern')) return ['model-evolution', '模型演进与架构', 'GPT-2 到 Kimi3']
  return ['research-articles', '技术研究与长文', '专题文章']
}
docFiles.forEach((file, index) => {
  const [course, courseTitle, module] = docCourse(file)
  const config = { course, courseTitle, module, order: index + 1, tags: ['技术研究', '中文整理'] }
  if (file.toLowerCase().endsWith('.md')) markdownFile(file, config)
  else htmlFile(file, config)
})

const byCourse = new Map()
for (const record of records) {
  if (!byCourse.has(record.course)) byCourse.set(record.course, [])
  byCourse.get(record.course).push(record)
}
for (const list of byCourse.values()) list.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'zh-CN'))

const index = {
  generatedAt: new Date().toISOString(),
  sourcePolicy: '保留经过整理的课程与技术研究内容；排除交接文档、Skills 清单、婚礼文稿、公司业务资料、原始工作区导出与重复副本。',
  courses: [...byCourse.entries()].map(([id, items]) => ({
    id,
    title: items[0].courseTitle,
    count: items.length,
    modules: [...new Set(items.map((item) => item.module))],
    items: items.map((item) => item.id),
  })),
  records,
}
fs.writeFileSync(path.join(contentRoot, 'index.json'), JSON.stringify(index, null, 2), 'utf8')
console.log(`Imported ${records.length} content records across ${byCourse.size} courses.`)
