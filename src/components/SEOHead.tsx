import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  schema?: Record<string, unknown>  // JSON-LD structured data
}

const SITE_NAME = 'Vjosa Rafting Tour'
const SITE_URL  = 'https://vjosaraftingtour.com'
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1530866495561-507c9faab9f2?auto=format&fit=crop&w=1200&q=80'

export function SEOHead({ title, description, image, url, schema }: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Europe's Last Wild River`
  const desc = description ?? 'Raft the Vjosa Wild River National Park in Përmet, Albania. Class II–III rapids, certified guides, all equipment provided. No experience needed.'
  const img  = image ?? DEFAULT_IMAGE
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={img} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:site_name"   content={SITE_NAME} />

      {/* Twitter card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={img} />

      {/* JSON-LD structured data */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  )
}

// ─── Pre-built schemas for re-use ────────────────────────────────────────────

export const SITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'TouristInformationCenter',
  name: 'Vjosa Rafting Tour',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.jpeg`,
  description: 'Professional rafting tours on the Vjosa Wild River National Park, Përmet, Albania.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Përmet',
    addressCountry: 'AL',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.2354,
    longitude: 20.3521,
  },
  openingHours: 'April–October',
  priceRange: '€€',
}

export function tourSchema(tour: { name: string; description?: string | null; price_per_person: number; duration_hours: number; images?: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.name,
    description: tour.description ?? '',
    image: tour.images ?? [],
    touristType: 'Adventure travellers',
    offers: {
      '@type': 'Offer',
      price: String(tour.price_per_person),
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    provider: {
      '@type': 'TouristInformationCenter',
      name: 'Vjosa Rafting Tour',
      url: SITE_URL,
    },
  }
}