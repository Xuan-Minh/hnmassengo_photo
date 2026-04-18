'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function NewsletterSignup({ className = '' } = {}) {
  const t = useTranslations('newsletter');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => setStatus('idle'), 6000);
      return () => clearTimeout(t);
    }
  }, [status]);

  const onSubmit = async e => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'standalone', locale }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.success) {
        setStatus('error');
        setMessage(json?.message || t('error'));
        return;
      }

      setStatus('success');
      setMessage(t('success'));
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(t('error'));
    }
  };

  return (
    <div className={className}>
      <div className="font-playfair italic text-lg md:text-xl lg:text-2 xl  text-whiteCustom/90 mb-2">
        {t('title')}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('placeholder')}
          required
          className="flex-1 bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 text-sm font-medium font-playfair text-whiteCustom/85 hover:text-whiteCustom transition-all duration-300 border border-whiteCustom/60"
        >
          {t('cta')}
        </button>
      </form>
      {status === 'success' && (
        <div className="mt-4 bg-green-600/20 border border-green-500/40 text-green-100 px-4 py-3 text-sm rounded">
          ✅ {message}
        </div>
      )}
      {status === 'error' && (
        <div className="mt-4 bg-red-600/20 border border-red-500/40 text-red-100 px-4 py-3 text-sm rounded">
          ⚠️ {message}
        </div>
      )}
    </div>
  );
}
