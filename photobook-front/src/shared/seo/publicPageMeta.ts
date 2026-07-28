import type { MetaDescriptor } from 'react-router'

interface PublicPageMetaInput {
  readonly title: string
  readonly description: string
  readonly path: `/${string}` | '/'
  readonly structuredData?: Record<string, unknown>
}

const SITE_NAME = 'Photobook'
const SITE_LOCALE = 'ru_KG'

const getSiteOrigin = () => {
  const candidate = import.meta.env.VITE_SITE_URL?.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : null
  } catch {
    return null
  }
}

const getCanonicalUrl = (path: PublicPageMetaInput['path']) => {
  const origin = getSiteOrigin()
  return origin ? new URL(path, `${origin}/`).toString() : null
}

export const createPublicPageMeta = ({
  title,
  description,
  path,
  structuredData,
}: PublicPageMetaInput): MetaDescriptor[] => {
  const canonicalUrl = getCanonicalUrl(path)
  const descriptors: MetaDescriptor[] = [
    { title },
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: SITE_LOCALE },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
  ]

  if (canonicalUrl) {
    descriptors.push(
      { tagName: 'link', rel: 'canonical', href: canonicalUrl },
      { property: 'og:url', content: canonicalUrl },
    )
  }
  if (structuredData) {
    descriptors.push({
      'script:ld+json': canonicalUrl
        ? { ...structuredData, url: canonicalUrl }
        : structuredData,
    })
  }

  return descriptors
}
