import { NextResponse } from 'next/server';
import client from '../../../lib/sanity.client';

export async function GET(request) {
  try {
    const origin =
      (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '') ||
      new URL(request.url).origin;

    const products = await client.fetch(
      '*[_type == "shopItem" && available == true] { _id, title, price, description, image{ asset->{ url } }, slug }'
    );

    const formatted = products.map(p => ({
      id: p._id,
      price: p.price,
      url: `${origin}/api/products`,
      name: p.title?.fr || p.title?.en || 'Product',
      description: p.description?.fr || p.description?.en || '',
      image: p.image?.asset?.url || '',
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
