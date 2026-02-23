import { useTranslations } from 'next-intl';
import { Link } from '../../src/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('notFound');
  return (
    <main className="min-h-screen bg-blackCustom text-whiteCustom flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-playfair italic mb-6">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-80">{t('message')}</p>
        <Link
          href="/"
          className="inline-block bg-accent hover:bg-accentHover text-white px-8 py-3 rounded transition-colors duration-300 font-playfair"
        >
          {t('homeLink')}
        </Link>
      </div>
    </main>
  );
}
