import { headers } from 'next/headers';
import client from '../../lib/sanity.client';

function getOriginFromHeaders() {
  const hdrs = headers();
  const forwardedProto = hdrs.get('x-forwarded-proto');
  const forwardedHost = hdrs.get('x-forwarded-host');
  const host = forwardedHost || hdrs.get('host');

  if (!host) return '';
  return `${forwardedProto || 'https'}://${host}`;
}

export const dynamic = 'force-dynamic';

export default async function SnipcartProductsPage() {
  const origin =
    (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '') ||
    getOriginFromHeaders();

  const validationUrl = origin ? `${origin}/snipcart-products` : '/snipcart-products';

  const products = await client.fetch(
    '*[_type == "shopItem" && available == true] { _id, title, price, description, image{ asset->{ url } } }'
  );

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
      <h1>Snipcart product validation</h1>
      <p>
        Cette page sert uniquement à la validation/crawl Snipcart (test/prod). Elle expose les
        produits sous forme de boutons <code>snipcart-add-item</code>.
      </p>

      <div style={{ display: 'none' }}>
        {products.map((p) => (
          <button
            key={p._id}
            className="snipcart-add-item"
            data-item-id={p._id}
            data-item-name={p.title?.fr || p.title?.en || 'Product'}
            data-item-price={String(p.price ?? 0)}
            data-item-url={validationUrl}
            data-item-description={p.description?.fr || p.description?.en || ''}
            data-item-image={p.image?.asset?.url || ''}
            type="button"
          >
            Add
          </button>
        ))}
      </div>

      <p>
        OK ({products?.length || 0} produit(s)).
      </p>
    </main>
  );
}
