import '../globals.css';
import { Lexend, Playfair_Display } from 'next/font/google';
import GlobalErrorBoundary from '../components/layout/GlobalErrorBoundary';
import StructuredData from '../lib/metadata';
import React from 'react';

export const metadata = {
  metadataBase: new URL('https://hnmassengo.com'),
  title: 'Han-Noah MASSENGO | Photographer & Visual Artist',
  description:
    'Explore the artistic portfolio of Han-Noah MASSENGO, a photographer capturing moments through light, shadow, and emotion. Discover commissioned works, fine art prints, and visual stories.',
  keywords: [
    'photography',
    'visual art',
    'Han-Noah MASSENGO',
    'fine art',
    'portrait',
    'commissioned work',
    'art prints',
  ],
  authors: [{ name: 'Han-Noah MASSENGO' }],
  creator: 'Han-Noah MASSENGO',
  openGraph: {
    title: 'Han-Noah MASSENGO | Photographer & Visual Artist',
    description:
      'Explore the artistic portfolio of Han-Noah MASSENGO, a photographer capturing moments through light, shadow, and emotion.',
    url: 'https://hnmassengo.com',
    siteName: 'Han-Noah MASSENGO Portfolio',
    locale: 'fr_FR',
    type: 'website',
    images: [
      {
        url: '/ogimage.webp',
        width: 1200,
        height: 630,
        alt: 'Han-Noah MASSENGO Photography Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Han-Noah MASSENGO | Photographer & Visual Artist',
    description: 'Explore the artistic portfolio of Han-Noah MASSENGO.',
    images: ['/ogimage.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  viewportFit: 'cover',
};

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-lexend',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-playfair',
});

export default function RootLayout({ children }) {
  return children;
}
