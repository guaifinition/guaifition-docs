import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contentRoot = path.join(projectRoot, 'content-library')
const assetRoot = path.join(projectRoot, 'public', 'content-assets')
const index = JSON.parse(fs.readFileSync(path.join(contentRoot, 'index.json'), 'utf8'))
const errors = []
let formulaCount = 0
let tableCount = 0
let imageCount = 0

for (const record of index.records) {
  const bodyPath = path.join(contentRoot, path.basename(record.bodyFile))
  if (!fs.existsSync(bodyPath)) errors.push(`${record.id}: missing body`) 
  const body = fs.existsSync(bodyPath) ? fs.readFileSync(bodyPath, 'utf8') : ''
  if (/^\s*404\b|this page could not be found/i.test(record.title) || /this page could not be found/i.test(body)) errors.push(`${record.id}: not-found page imported`)
  if (/来源与编辑状态|已完成(?: HTML 内容抽取|文本清洗)|editorialStatus/i.test(body)) errors.push(`${record.id}: internal editorial status exposed`)
  if (/\[返回首页\]\([^)]*\)/.test(body)) errors.push(`${record.id}: source navigation residue found`)
  if (/^(?:\s*[>*]\s?|\s*\*\*)/.test(record.summary) || /\*\*[^\n]+\*\*|`[^`]+`/.test(record.summary)) errors.push(`${record.id}: markdown syntax leaked into summary`)
  if (body.includes('\uFFFD')) errors.push(`${record.id}: replacement character found`)
  formulaCount += (body.match(/\$\$|\\\[|\\\(/g) || []).length
  tableCount += (body.match(/^\|.+\|$/gm) || []).length
  const assetScanBody = body.replace(/```[\s\S]*?```/g, '')
  for (const src of assetScanBody.matchAll(/(?:!\[[^\]]*\]|<img[^>]+src=)[(\s"]?([^\s)"']+)/g)) {
    const ref = src[1].replace(/^<|>$/g, '')
    if (ref.startsWith('/content-assets/')) {
      const file = path.join(assetRoot, ref.replace(/^\/content-assets\//, '').replaceAll('/', path.sep))
      if (!fs.existsSync(file)) errors.push(`${record.id}: missing asset ${ref}`)
      else imageCount += 1
    } else if (record.course !== 'research-notes' && !/^(https?:|data:)/i.test(ref)) {
      errors.push(`${record.id}: non-project asset reference ${ref}`)
    }
  }
}

console.log(JSON.stringify({
  records: index.records.length,
  courses: index.courses.length,
  formulas: formulaCount,
  tableLines: tableCount,
  linkedAssets: imageCount,
  errors,
}, null, 2))
if (errors.length) process.exitCode = 1
