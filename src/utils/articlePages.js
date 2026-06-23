import { marked } from 'marked'
import { sanitizeArticleHtml } from '@/utils/markdownMedia'

export function createPage(title = '', content = '') {
  return {
    id: crypto.randomUUID(),
    title: title || 'Página 1',
    content,
  }
}

export function getArticlePages(article) {
  if (article?.pages?.length) return article.pages
  if (article?.content?.trim()) {
    return [{ id: 'legacy', title: 'Contenido', content: article.content }]
  }
  return [createPage()]
}

export function pagesToPlainText(pages) {
  return pages.map(p => p.content.trim()).filter(Boolean).join('\n\n')
}

export function computeReadTime(pages) {
  const text = pagesToPlainText(pages)
  if (!text) return '1 min lectura'
  const wordCount = text.split(/\s+/).length
  return `${Math.max(1, Math.ceil(wordCount / 200))} min lectura`
}

export function slugifyHeading(text) {
  return (text || 'seccion')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'seccion'
}

export function extractHeadings(markdown) {
  const headings = []
  const used = new Set()
  if (!markdown) return headings

  for (const line of markdown.split('\n')) {
    const match = line.match(/^(#{2,3})\s+(.+)$/)
    if (!match) continue
    const level = match[1].length
    const text = match[2].replace(/[#*_`[\]]/g, '').trim()
    if (!text) continue

    let base = slugifyHeading(text)
    let id = base
    let n = 2
    while (used.has(id)) {
      id = `${base}-${n++}`
    }
    used.add(id)
    headings.push({ level, text, id })
  }

  return headings
}

export function assignHeadingIds(html) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html
  const used = new Set()

  wrapper.querySelectorAll('h2, h3, h4').forEach((el) => {
    let base = slugifyHeading(el.textContent || '')
    let id = base
    let n = 2
    while (used.has(id)) {
      id = `${base}-${n++}`
    }
    used.add(id)
    el.id = id
  })

  return wrapper.innerHTML
}

export function renderMarkdownContent(markdown) {
  if (!markdown) return ''
  const rawHtml = marked.parse(markdown)
  const sanitized = sanitizeArticleHtml(rawHtml)
  return assignHeadingIds(sanitized)
}

export function buildTocEntries(pages, activePageId) {
  const activePage = pages.find(p => p.id === activePageId) ?? pages[0]
  const pageHeadings = activePage
    ? extractHeadings(activePage.content).map(h => ({ ...h, pageId: activePage.id }))
    : []

  return {
    pages: pages.map(p => ({ id: p.id, title: p.title || 'Sin título' })),
    headings: pageHeadings,
    hasMultiplePages: pages.length > 1,
  }
}
