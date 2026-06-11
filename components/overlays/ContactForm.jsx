'use client';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function ContactForm({
  idSuffix = '',
  onSubmitSuccess,
  defaultSubject = '',
}) {
  const t = useTranslations('contact');
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);
  const { locale } = useParams();

  const handleSubmit = async e => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      newsletterOptIn: formData.get('newsletterOptIn') === 'on',
      locale,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const encodedBody = new URLSearchParams(formData);
        encodedBody.set('form-name', 'contact');

        await fetch('/contact.html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encodedBody.toString(),
        });
        setShowSuccess(true);
        form.reset();
        if (onSubmitSuccess) onSubmitSuccess();
        setTimeout(() => {
          window.location.href = '/success.html';
        }, 2000);
      } else {
        const details = Array.isArray(result?.errors)
          ? `\n\n${result.errors.join('\n')}`
          : '';
        alert((result?.message || t('form.validationError')) + details);
      }
    } catch {
      alert(t('form.submissionError'));
    }
  };

  return (
    <form
      ref={formRef}
      className="space-y-4 md:space-y-6"
      name="contact"
      aria-label="Contact form"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
    >
      <input
        type="hidden"
        aria-label="form name"
        name="form-name"
        value="contact"
      />
      <input
        type="hidden"
        aria-label="bot field"
        name="bot-field"
        style={{ display: 'none' }}
      />
      <input
        type="hidden"
        aria-label="locale"
        name="locale"
        value={locale || ''}
      />

      {showSuccess && (
        <div className="bg-green-600/20 border border-green-500 text-green-300 p-3 md:p-4 rounded mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <span className="text-lg md:text-xl">✅</span>
            <div>
              <h3 className="font-semibold text-sm md:text-base">
                {t('form.success.title')}
              </h3>
              <p className="text-xs md:text-sm opacity-90">
                {t('form.success.message')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor={`fullName${idSuffix}`}
          className="block text-whiteCustom/90 font-liberation text-sm mb-2"
        >
          {t('form.fullName')} *
        </label>
        <input
          aria-label={`fullName${idSuffix}`}
          id={`fullName${idSuffix}`}
          name="fullName"
          type="text"
          required
          minLength={2}
          className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 text-sm md:text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label
            htmlFor={`email${idSuffix}`}
            className="block text-whiteCustom/90 font-liberation text-sm mb-2"
          >
            {t('form.email')} *
          </label>
          <input
            aria-label={`email${idSuffix}`}
            id={`email${idSuffix}`}
            name="email"
            type="email"
            required
            className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 text-sm md:text-base"
          />
        </div>
        <div>
          <label
            htmlFor={`subject${idSuffix}`}
            className="block text-whiteCustom/90 font-liberation text-sm mb-2"
          >
            {t('form.subject')} *
          </label>
          <input
            aria-label={`subject${idSuffix}`}
            id={`subject${idSuffix}`}
            name="subject"
            type="text"
            required
            maxLength={100}
            defaultValue={defaultSubject}
            className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 text-sm md:text-base"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`message${idSuffix}`}
          className="block text-whiteCustom/90 font-liberation text-sm mb-2"
        >
          {t('form.message')} *
        </label>
        <textarea
          aria-label={`message${idSuffix}`}
          id={`message${idSuffix}`}
          name="message"
          rows={5}
          required
          minLength={10}
          className="w-full bg-formBG text-whiteCustom placeholder-whiteCustom/40 border border-whiteCustom/60 focus:border-whiteCustom outline-none px-3 py-2 resize-y text-sm md:text-base"
        />
      </div>

      <div className="flex items-center justify-between gap-4 w-full">
        <label className="inline-flex items-center gap-2 text-whiteCustom/80 font-liberation text-sm select-none">
          <input
            type="checkbox"
            aria-label="newsletter opt-in"
            name="newsletterOptIn"
            className="accent-whiteCustom"
          />
          <span>{t('form.newsletterOptIn')}</span>
        </label>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium font-liberation text-whiteCustom/85 hover:text-whiteCustom transition-all duration-300 border border-whiteCustom/60"
        >
          <span>{t('form.send')}</span>
        </button>
      </div>
    </form>
  );
}
