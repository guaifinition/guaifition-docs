import { LargeCourseToc } from '@/components/docs/LargeCourseToc'
import { CourseToc } from '@/components/docs/CourseToc'
import { DocsHeader } from '@/components/docs/DocsHeader'
import { LatestArticleCard } from '@/components/docs/LatestArticleCard'
import { QuickCourseGuide } from '@/components/docs/QuickCourseGuide'
import { getAllRecords, getCourseArticleGroups, getCourseRecords, getHomepageDirectory, getLatestUpdate } from '@/lib/content'

export default function HomePage() {
  const { collections, agentic, learningAi, supplement } = getHomepageDirectory()
  const records = getAllRecords()
  const latestUpdate = getLatestUpdate()
  const latestUpdatedAt = latestUpdate.generatedAt
    ? new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(latestUpdate.generatedAt))
    : '暂无记录'
  const guideItems = [
    ...collections.map((collection) => ({ id: `book-section-${collection.name}`, label: collection.name, detail: `${collection.courses.length} 门课程` })),
    ...(agentic ? [{ id: 'course-agentic-ai', label: agentic.title, detail: `${agentic.count} 讲` }] : []),
    { id: 'course-follow-ai', label: '跟我学 AI', detail: '13 门子课 · 88 讲' },
    ...(supplement ? [{ id: 'course-supplement', label: '课外补充', detail: `${supplement.title} · ${supplement.count} 讲` }] : []),
  ]

  return (
    <div className="docs-site" id="top">
      <DocsHeader />
      <main className="book-home">
        <section className="book-preface">
          <p className="book-kicker">GUAIFINITION DOCS · 前言</p>
          <h1>Guaifinition Docs</h1>
          <p className="book-lead">本库以课程、章节和技术文章为基本组织单元，收录从人工智能基础、经典算法到大语言模型与 Agent 系统工程的连续知识脉络。正文以 Markdown 保存，并由统一文档组件渲染公式、图表、代码和参考资料。</p>
          <div className="book-preface-note">阅读方式：先按下方目录选择课程，再进入章节。文章页提供当前文章目录、课程导航和前后篇切换。</div>
          <dl className="book-metrics">
            <div><dt>课程</dt><dd>{collections.reduce((sum, group) => sum + group.courses.length, 0) + (agentic ? 1 : 0) + (learningAi.length ? 1 : 0) + (supplement ? 1 : 0)}</dd></div>
            <div><dt>文章</dt><dd>{records.length}</dd></div>
            <div><dt>内容层</dt><dd>Markdown</dd></div>
          </dl>
          <LatestArticleCard
            updatedAt={latestUpdatedAt}
            article={latestUpdate.record ? {
              title: latestUpdate.record.title,
              summary: latestUpdate.record.summary,
              detail: `${latestUpdate.record.courseTitle} · ${latestUpdate.record.module}`,
              href: `/courses/${latestUpdate.record.course}/${latestUpdate.record.id.split('/')[1]}`,
              coverImage: latestUpdate.record.coverImage,
              coverAlt: latestUpdate.record.coverAlt,
            } : undefined}
          />
          <QuickCourseGuide items={guideItems} />
        </section>

        <section className="book-toc" id="courses" aria-labelledby="toc-title">
          <header className="book-toc-heading">
            <p className="book-kicker">CONTENTS · 目录</p>
            <h2 id="toc-title">课程目录</h2>
            <p>按知识主题分编；课程下列出全部章节。</p>
          </header>
          {collections.map((collection, collectionIndex) => (
            <section className="book-section" id={`book-section-${collection.name}`} key={collection.name}>
              <div className="book-section-heading">
                <span>编 {String(collectionIndex + 1).padStart(2, '0')}</span>
                <h2>{collection.name}</h2>
              </div>
              <div className="book-course-list">
                {collection.courses.map((course, courseIndex) => (
                  <CourseToc key={course.id} course={course} number={courseIndex + 1} articles={getCourseRecords(course.id)} />
                ))}
              </div>
            </section>
          ))}
          {agentic && (
            <section className="book-section book-section-agentic" id="course-agentic-ai">
              <div className="book-section-heading">
                <span>编 {String(collections.length + 1).padStart(2, '0')}</span>
                <h2>Agentic AI 智能体工作流</h2>
              </div>
              <div className="book-course-list">
                <CourseToc
                  course={agentic}
                  number={1}
                  articles={getCourseRecords(agentic.id)}
                  groups={getCourseArticleGroups(agentic.id)}
                  stripNestedPrefix
                />
              </div>
            </section>
          )}
          {learningAi.length > 0 && <LargeCourseToc courses={learningAi} getArticles={getCourseRecords} />}
          {supplement && (
            <section className="book-section book-section-supplement" id="course-supplement">
              <div className="book-section-heading">
                <span>补充</span>
                <h2>课外补充</h2>
              </div>
              <div className="book-course-list">
                <CourseToc course={supplement} number={1} articles={getCourseRecords(supplement.id)} />
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  )
}
