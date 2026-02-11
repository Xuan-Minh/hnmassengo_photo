'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

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
              Éditeur du site
            </h2>
            <p>
              Han-Noah MASSENGO
              <br />
              Photographe professionnel
              <br />
              Email : contact@hnmassengo.com
              <br />
              Site web : hnmassengo.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              Hébergement
            </h2>
            <p>
              Ce site est hébergé par Netlify Inc.
              <br />
              610 22nd Street, Suite 315
              <br />
              San Francisco, CA 94107
              <br />
              États-Unis
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              Propriété intellectuelle
            </h2>
            <p>
              Toutes les images présentes sur ce site sont la propriété
              exclusive de Studio42. Toute reproduction, distribution ou
              publication, même partielle, est interdite sans autorisation
              écrite préalable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              Données personnelles
            </h2>
            <p>
              Les informations recueillies via le formulaire de contact sont
              destinées uniquement à Studio42 pour répondre à vos demandes.
              Elles ne sont ni vendues, ni cédées à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              Cookies
            </h2>
            <p>
              Ce site n'utilise pas de cookies de suivi. Seuls les cookies
              techniques nécessaires au fonctionnement du site et du panier
              d'achat sont utilisés.
            </p>
          </section>

          <section>
            <h2 className="text-2xl md:text-3xl font-playfair italic mb-4">
              Droit applicable
            </h2>
            <p>
              Le présent site est soumis au droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
