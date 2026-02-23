'use client';
import { useTranslations } from 'next-intl';
import { Link } from '../../../src/i18n/navigation';

export default function LegalPage() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-blackCustom text-whiteCustom p-8 md:p-12 lg:p-16">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-8 text-whiteCustom/70 hover:text-whiteCustom transition-colors font-playfair"
        >
          ← back
        </Link>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair italic mb-12 leading-tight">
          {t('legal.title')}
        </h1>

        <div className="space-y-8 font-playfair text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              {t('legalPage.editor.title')}
            </h2>
            <p>
              {t('legalPage.editor.name')}
              <br />
              {t('legalPage.editor.profession')}
              <br />
              {t('legalPage.editor.email')}
              <br />
              {t('legalPage.editor.website')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              {t('legalPage.hosting.title')}
            </h2>
            <p>
              {t('legalPage.hosting.line1')}
              <br />
              {t('legalPage.hosting.line2')}
              <br />
              {t('legalPage.hosting.line3')}
              <br />
              {t('legalPage.hosting.line4')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              {t('legalPage.ip.title')}
            </h2>
            <p>{t('legalPage.ip.text')}</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              {t('legalPage.data.title')}
            </h2>
            <p>{t('legalPage.data.text')}</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              {t('legalPage.cookies.title')}
            </h2>
            <p>{t('legalPage.cookies.text')}</p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              {t('legalPage.law.title')}
            </h2>
            <p>{t('legalPage.law.text')}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
