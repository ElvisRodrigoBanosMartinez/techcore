function slugify(text) {
  return (text || 'articulo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'articulo'
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function prepareContentForPdf(html) {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = html

  wrapper.querySelectorAll('video, iframe').forEach((el) => {
    const url = el.getAttribute('src')
    const note = document.createElement('p')
    note.style.cssText = 'font-size:12px;color:#64748b;font-style:italic;margin:8px 0;'
    note.textContent = url
      ? `Contenido multimedia disponible en: ${url}`
      : 'Contenido multimedia (consultar en TechCore)'
    el.replaceWith(note)
  })

  wrapper.querySelectorAll('img').forEach((img) => {
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.crossOrigin = 'anonymous'
  })

  wrapper.querySelectorAll('h1, h2, h3, h4').forEach((el) => {
    el.style.color = '#1e293b'
    el.style.marginTop = '1.2em'
    el.style.marginBottom = '0.5em'
  })

  wrapper.querySelectorAll('p, li').forEach((el) => {
    el.style.color = '#334155'
    el.style.lineHeight = '1.6'
  })

  wrapper.querySelectorAll('a').forEach((el) => {
    el.style.color = '#6d28d9'
  })

  wrapper.querySelectorAll('code').forEach((el) => {
    el.style.backgroundColor = '#f1f5f9'
    el.style.padding = '2px 4px'
    el.style.borderRadius = '3px'
    el.style.fontSize = '0.9em'
  })

  wrapper.querySelectorAll('pre').forEach((el) => {
    el.style.backgroundColor = '#f1f5f9'
    el.style.padding = '12px'
    el.style.borderRadius = '6px'
    el.style.fontSize = '12px'
  })

  return wrapper.innerHTML
}

function waitForImages(root) {
  const images = [...root.querySelectorAll('img')]
  return Promise.all(images.map((img) => {
    if (img.complete) return Promise.resolve()
    return new Promise((resolve) => {
      img.onload = resolve
      img.onerror = resolve
    })
  }))
}

function waitForLayout() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })
}

function buildPdfContainer(article, contentHtml, { formatDate, categoryLabel }) {
  const container = document.createElement('div')
  container.style.cssText = [
    'width:700px',
    'padding:40px',
    'background:#ffffff',
    'font-family:Inter,system-ui,sans-serif',
    'color:#1e293b',
    'box-sizing:border-box',
  ].join(';')

  const tagsHtml = article.tags?.length
    ? `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;">
         <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#94a3b8;margin:0 0 8px;">Etiquetas</p>
         <p style="font-size:13px;color:#64748b;margin:0;">${article.tags.map(t => `#${escapeHtml(t)}`).join(' · ')}</p>
       </div>`
    : ''

  const updatedAtHtml = article.updatedAt
    ? `<p style="font-size:11px;color:#94a3b8;margin-top:16px;">Última actualización: ${formatDate(article.updatedAt)}</p>`
    : ''

  container.innerHTML = `
    <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #7c3aed;">
      <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#7c3aed;margin:0 0 4px;">TechCore RRHH</p>
      <p style="font-size:11px;color:#94a3b8;margin:0;">Base de conocimiento empresarial</p>
    </div>
    <p style="font-size:12px;color:#64748b;margin:0 0 8px;">${escapeHtml(categoryLabel)} · ${formatDate(article.createdAt)}</p>
    <h1 style="font-size:28px;font-weight:700;color:#0f172a;line-height:1.25;margin:0 0 16px;">${escapeHtml(article.title)}</h1>
    <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 8px;">${escapeHtml(article.excerpt)}</p>
    <p style="font-size:13px;color:#64748b;margin:0 0 32px;">Por ${escapeHtml(article.author?.displayName || 'RRHH')}</p>
    <div style="font-size:14px;line-height:1.7;color:#334155;">${prepareContentForPdf(contentHtml)}</div>
    ${tagsHtml}
    ${updatedAtHtml}
  `

  return container
}

export async function exportArticleToPdf(article, contentHtml, { formatDate, categoryLabel }) {
  const container = buildPdfContainer(article, contentHtml, { formatDate, categoryLabel })

  // Wrapper fuera de vista; el contenedor exportado no lleva opacity/position que html2pdf clonaría.
  const mount = document.createElement('div')
  mount.style.cssText = 'position:fixed;left:-10000px;top:0;width:700px;overflow:visible;'
  mount.appendChild(container)
  document.body.appendChild(mount)

  try {
    await waitForImages(container)
    await waitForLayout()

    const html2pdf = (await import('html2pdf.js')).default

    await html2pdf().set({
      margin: [12, 12, 12, 12],
      filename: `${slugify(article.title)}.pdf`,
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        windowWidth: container.scrollWidth,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    }).from(container).save()
  } finally {
    document.body.removeChild(mount)
  }
}
