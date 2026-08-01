import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { CLINIC, TESTIMONIALS } from '@/src/lib/constants';
import MotionProvider from '@/components/MotionProvider';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600'],
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${CLINIC.name} | Modern Dental Care in ${CLINIC.address.city}`,
    template: `%s | ${CLINIC.shortName}`,
  },
  description:
    'Comprehensive, comfortable dental care in Karachi, Pakistan. Book general checkups, teeth whitening, root canal therapy, and orthodontics online in minutes.',
  keywords: [
    'dentist',
    'dental clinic',
    'teeth whitening',
    'root canal',
    'orthodontics',
    'Karachi dentist',
    'dentist in Pakistan',
    'book dental appointment',
  ],
  authors: [{ name: CLINIC.name }],
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: siteUrl,
    siteName: CLINIC.name,
    title: `${CLINIC.name} | Modern Dental Care in ${CLINIC.address.city}`,
    description:
      'Comprehensive, comfortable dental care in Karachi, Pakistan. Book your appointment online in minutes.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: `${CLINIC.name} clinic interior`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${CLINIC.name} | Modern Dental Care`,
    description:
      'Comprehensive, comfortable dental care in Karachi, Pakistan. Book online in minutes.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e40af',
};

function buildDentistSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: CLINIC.name,
    image: `${siteUrl}/og-image.jpg`,
    url: siteUrl,
    telephone: CLINIC.phone,
    email: CLINIC.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CLINIC.address.street,
      addressLocality: CLINIC.address.city,
      addressRegion: CLINIC.address.region,
      postalCode: CLINIC.address.postalCode,
      addressCountry: CLINIC.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CLINIC.geo.latitude,
      longitude: CLINIC.geo.longitude,
    },
    openingHoursSpecification: CLINIC.hours
      .filter((h) => h.open)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${h.day}`,
        opens: h.open,
        closes: h.close,
      })),
    medicalSpecialty: [
      'Dentistry',
      'Orthodontics',
      'Endodontics',
      'Cosmetic Dentistry',
    ],
    priceRange: 'Rs. 2,500 – Rs. 120,000',
    sameAs: [CLINIC.social.instagram, CLINIC.social.facebook],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (
        TESTIMONIALS.reduce((sum, t) => sum + t.rating, 0) / TESTIMONIALS.length
      ).toFixed(1),
      reviewCount: TESTIMONIALS.length,
      bestRating: '5',
      worstRating: '1',
    },
  };
}

export default function RootLayout({ children }) {
  const jsonLd = buildDentistSchema();

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
