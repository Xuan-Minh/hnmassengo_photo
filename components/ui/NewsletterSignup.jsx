'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

function getCopy(locale) {
  const l = ['fr', 'en', 'de'].includes(locale) ? locale : 'fr';
  if (l === 'en') {
    return {
      title: 'Newsletter',
      placeholder: 'Your email',
      cta: 'Subscribe',
      success: 'Thanks! You are subscribed.',
      error: 'Please enter a valid email.',
    };
  }
  if (l === 'de') {
    return {
      title: 'Newsletter',
      placeholder: 'Deine E-Mail',
      cta: 'Abonnieren',
      success: 'Danke! Du bist angemeldet.',
      error: 'Bitte eine gültige E-Mail eingeben.',
    };
  }
  return {
    title: 'Newsletter',
    placeholder: 'Votre email',
    cta: "S'inscrire",
    success: 'Merci ! Vous êtes inscrit.',
    error: 'Veuillez entrer une adresse email valide.',
  };
}

export default function NewsletterSignup({ className = '' } = {}) {
  const { locale } = useParams();
  const copy = getCopy(locale);

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
        body: JSON.stringify({ email, locale, source: 'standalone' }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.success) {
        setStatus('error');
        setMessage(json?.message || copy.error);
        return;
      }

      setStatus('success');
      setMessage(copy.success);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(copy.error);
    }
  };

  return (
    <div className={className}>
      <div className="font-playfair italic text-base md:text-lg text-whiteCustom/90 mb-2">
        {copy.title}
      </div>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={copy.placeholder}
          required
          className="flex-1 bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 text-sm font-medium font-playfair text-whiteCustom/85 hover:text-whiteCustom transition-all duration-300 border border-whiteCustom/60"
        >
          {copy.cta}
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
