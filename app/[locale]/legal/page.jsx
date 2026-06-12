'use client';
import { useTranslations } from 'next-intl';
import { Link } from '../../../src/i18n/navigation';
import { LegalContent } from '../../../components/overlays/LegalOverlay';
import { SITE_CONFIG } from '../../../lib/constants';
import metadata from '../../../lib/metadata';

export default function LegalPage() {
  const t = useTranslations('legal');

  return (
    <main className="relative min-h-screen bg-blackCustom text-whiteCustom p-8 md:p-16">
      {/* Bouton Back */}
      <div className="absolute top-8 left-8 md:top-16 md:left-16 z-50">
        <Link
          href="/"
          className="text-lg font-liberation text-whiteCustom hover:text-whiteCustom/90 transition-colors"
        >
          back
        </Link>
      </div>

      <div className="max-w-4xl mx-auto pt-10 md:pt-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-liberation italic mb-12 leading-tight">
          {t('title')}
        </h1>

        <LegalContent />

        <footer className="mt-12 pt-6 border-t border-whiteCustom/20">
          <p className="font-liberation text-sm text-whiteCustom/70">
            {SITE_CONFIG.copyright}
          </p>
        </footer>
      </div>
    </main>
  );
}
