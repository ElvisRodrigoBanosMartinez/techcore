import DOMPurify from 'dompurify'

const TRUSTED_IFRAME_HOSTS = [
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
]

const TRUSTED_VIDEO_HOSTS = ['res.cloudinary.com']

let sanitizeHooksRegistered = false

function registerSanitizeHooks() {
  if (sanitizeHooksRegistered) return
  sanitizeHooksRegistered = true

  DOMPurify.addHook('uponSanitizeElement', (node) => {
    if (node.tagName === 'IFRAME') {
      try {
        const src = new URL(node.getAttribute('src') || '')
        if (!TRUSTED_IFRAME_HOSTS.includes(src.hostname)) node.remove()
      } catch {
        node.remove()
      }
    }

    if (node.tagName === 'VIDEO') {
      try {
        const src = new URL(node.getAttribute('src') || '')
        if (!TRUSTED_VIDEO_HOSTS.includes(src.hostname)) node.remove()
      } catch {
        node.remove()
      }
    }
  })
}

export function getCloudinaryResourceType(file) {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return 'raw'
}

export function markdownSnippetForUpload(file, url) {
  if (file.type.startsWith('image/')) {
    return `\n![${file.name}](${url})\n`
  }
  if (file.type.startsWith('video/')) {
    return `\n<video src="${url}" controls playsinline preload="metadata"></video>\n`
  }
  return `\n[📄 Descargar ${file.name}](${url})\n`
}

export function sanitizeArticleHtml(html) {
  registerSanitizeHooks()
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe', 'video'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'controls', 'playsinline', 'preload'],
  })
}
