'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import ShopItem from './ShopItem';
import ShopOverlay from './ShopOverlay';
import { formatPrice } from '../lib/utils';
import { logger } from '../lib/logger';
import client from '../lib/sanity.client';

function getSnipcartItemUrl() {
  if (typeof window !== 'undefined')
    return `${window.location.origin}/snipcart-products`;
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  if (fromEnv) return `${fromEnv}/snipcart-products`;
  return '/snipcart-products';
}

function localizeField(value, locale) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.fr || value?.en || value?.de || '';
}

// Composant CartItem - Affichage simple des articles Snipcart
const CartItem = ({ item, productsById, locale, onRemove }) => {
  const matchingProduct = productsById.get(item.id);
  const displayName = matchingProduct
    ? localizeField(matchingProduct.title, locale)
    : item.name;

  return (
    <li className="py-2 border-b border-gray-200/20">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <button
            type="button"
            className="text-left text-sm text-gray-800 hover:text-red-600 hover:underline underline-offset-4 transition-colors"
            title="Remove from cart"
            onClick={() => onRemove?.(item)}
          >
            {displayName}
          </button>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-600">
              {item.quantity} × {item.price?.toFixed(2)}€
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">
            {(item.price * item.quantity)?.toFixed(2)}€
          </p>
        </div>
      </div>
    </li>
  );
};

export default function Shop() {
  const { locale } = useParams();
  const [cartOpen, setCartOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const snipcartItemUrl = useMemo(() => getSnipcartItemUrl(), []);

  // Nettoyer l'URL si elle contient des ancres Snipcart (après refresh)
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      (window.location.hash === '#snipcart' ||
        window.location.hash === '#cart' ||
        window.location.hash === '#/cart' ||
        window.location.hash === '#/checkout')
    ) {
      // Remplacer l'URL sans l'ancre
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  }, []);

  // Détecter desktop/mobile côté client
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const cartItemIds = useMemo(() => {
    return new Set((cartItems || []).map(item => item.id));
  }, [cartItems]);

  const productsById = useMemo(() => {
    return new Map(products.map(p => [p.id, p]));
  }, [products]);

  // Charger les produits depuis Sanity
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await client.fetch(
          '*[_type == "shopItem"] { ..., image{ asset->{ url } }, imgHover{ asset->{ url } } }'
        );
        logger.debug('Fetched products:', data);
        const formatted = data.map(p => ({
          id: p._id,
          imgDefault: p.image?.asset?.url,
          imgHover: p.imgHover?.asset?.url,
          title: p.title,
          price: p.price,
          description: p.description,
          // ⚠️ Ne pas varier ces valeurs selon la langue, sinon Snipcart peut créer des doublons
          // pour le même produit lors d'un switch FR/EN/DE.
          snipcartName:
            localizeField(p.title, 'fr') || localizeField(p.title, locale),
          snipcartDescription: localizeField(p.description, 'fr') || '',
          formats: p.formats || [],
          snipcartUrl: snipcartItemUrl,
        }));
        logger.debug('Formatted products:', formatted);
        setProducts(formatted);
      } catch (err) {
        logger.error('Failed to load products', err);
      }
    };
    fetchProducts();
  }, [locale, snipcartItemUrl]);

  // Synchroniser avec Snipcart - lire l'état du panier
  const syncWithSnipcart = useCallback(() => {
    if (window.Snipcart && window.Snipcart.store) {
      try {
        const state = window.Snipcart.store.getState();
        const items = state.cart.items.items || [];
        const count = state.cart.items.count || 0;

        // Calculer le total manuellement à partir des items pour garantir la précision
        const calculatedTotal = items.reduce((sum, item) => {
          return sum + item.price * item.quantity;
        }, 0);

        setCartItems(items);
        setCartTotal(calculatedTotal);
        setCartCount(count);
      } catch (error) {
        logger.error('Error syncing with Snipcart:', error);
      }
    }
  }, []);

  const removeFromCart = useCallback(
    async item => {
      if (typeof window === 'undefined' || !window.Snipcart) return;

      // Snipcart supprime via `uniqueId` (pas le product id)
      let uniqueId = item.uniqueId;
      if (!uniqueId && window.Snipcart.store?.getState) {
        try {
          const state = window.Snipcart.store.getState();
          const items = state?.cart?.items?.items || [];
          uniqueId = items.find(i => i.id === item.id)?.uniqueId;
        } catch {
          // ignore
        }
      }

      if (!uniqueId) {
        logger.error('Failed to remove item from Snipcart (missing uniqueId)', {
          id: item.id,
          name: item.name,
          uniqueId: item.uniqueId,
        });
        return;
      }

      try {
        if (window.Snipcart.api?.cart?.items?.remove) {
          await window.Snipcart.api.cart.items.remove(uniqueId);
        } else if (window.Snipcart.api?.items?.remove) {
          await window.Snipcart.api.items.remove(uniqueId);
        } else if (window.Snipcart.store?.dispatch) {
          // Certaines versions exposent un dispatch « shortcut » (type, payload)
          try {
            window.Snipcart.store.dispatch('cart.items.remove', uniqueId);
          } catch {
            // ...d'autres demandent une action redux complète
            window.Snipcart.store.dispatch({
              type: 'cart.items.remove',
              payload: uniqueId,
            });
          }
        } else {
          logger.error(
            'Failed to remove item from Snipcart (no API available)',
            {
              hasApi: !!window.Snipcart.api,
              hasStore: !!window.Snipcart.store,
            }
          );
        }
      } catch (e) {
        logger.error('Failed to remove item from Snipcart', {
          error: e,
          uniqueId,
          id: item.id,
          name: item.name,
          hasApi: !!window.Snipcart.api,
          hasStore: !!window.Snipcart.store,
        });
      } finally {
        // resync, même si l'appel API est asynchrone côté Snipcart
        setTimeout(syncWithSnipcart, 150);
      }
    },
    [syncWithSnipcart]
  );

  // Initialiser Snipcart et écouter les événements
  useEffect(() => {
    const initSnipcart = () => {
      if (typeof window === 'undefined' || !window.Snipcart) return;
      try {
        syncWithSnipcart();
        if (
          window.Snipcart.events &&
          typeof window.Snipcart.events.on === 'function'
        ) {
          window.Snipcart.events.on('item.added', syncWithSnipcart);
          window.Snipcart.events.on('item.removed', syncWithSnipcart);
          window.Snipcart.events.on('item.updated', syncWithSnipcart);
          window.Snipcart.events.on('cart.confirmed', syncWithSnipcart);
        }
      } catch (e) {
        if (logger && typeof logger.error === 'function')
          logger.error('Snipcart init error', e);
      }
    };

    // Attendre que Snipcart soit prêt
    let loadHandler;
    if (document.readyState === 'complete') {
      setTimeout(initSnipcart, 1000);
    } else {
      loadHandler = () => setTimeout(initSnipcart, 1000);
      window.addEventListener('load', loadHandler);
    }

    return () => {
      // Nettoyage défensif des écouteurs Snipcart
      if (
        typeof window !== 'undefined' &&
        window.Snipcart &&
        window.Snipcart.events &&
        typeof window.Snipcart.events.off === 'function'
      ) {
        try {
          window.Snipcart.events.off('item.added', syncWithSnipcart);
          window.Snipcart.events.off('item.removed', syncWithSnipcart);
          window.Snipcart.events.off('item.updated', syncWithSnipcart);
          window.Snipcart.events.off('cart.confirmed', syncWithSnipcart);
        } catch (e) {
          if (logger && typeof logger.error === 'function')
            logger.error('Snipcart cleanup error', e);
        }
      }
      if (loadHandler) {
        window.removeEventListener('load', loadHandler);
      }
    };
  }, [syncWithSnipcart]);

  // Fonction pour ajouter directement à Snipcart
  const addToCart = useCallback(
    product => {
      if (cartItemIds.has(product.id)) {
        setCartOpen(true);
        return;
      }

      const tempBtn = document.createElement('button');
      tempBtn.className = 'snipcart-add-item';
      tempBtn.setAttribute('data-item-id', product.id);
      tempBtn.setAttribute(
        'data-item-name',
        product.snipcartName || product.title
      );
      tempBtn.setAttribute('data-item-price', product.price.toString());
      tempBtn.setAttribute(
        'data-item-url',
        product.snipcartUrl || snipcartItemUrl
      );
      tempBtn.setAttribute(
        'data-item-description',
        product.snipcartDescription || ''
      );
      tempBtn.style.display = 'none';

      document.body.appendChild(tempBtn);
      tempBtn.click();

      setTimeout(() => {
        document.body.removeChild(tempBtn);
        syncWithSnipcart();
        setCartOpen(true); // Ouvre le cart sur ajout
      }, 100);
    },
    [cartItemIds, snipcartItemUrl, syncWithSnipcart]
  );

  return (
    <section
      id="shop"
      className="flex h-screen bg-whiteCustom font-playfair snap-start relative"
    >
      {/* Produits - Layout vertical mobile, colonne centrale desktop */}
      <main className="flex-1 h-full flex flex-col md:flex-row items-stretch overflow-hidden">
        {/* Panier mobile (en haut, hauteur auto), desktop (gauche, 320px) */}
        <aside
          className={`w-full md:w-[320px] h-auto md:h-full ${cartOpen ? 'border-b' : ''} md:border-b-0 md:border-r border-black/30 p-0 md:p-10 flex flex-col z-10 bg-whiteCustom order-1 md:order-1`}
        >
          {/* Header du cart, clickable sur mobile */}
          <div className="flex justify-between items-center mb-0 md:mb-8 px-6 py-4 md:px-0 md:py-0">
            <h2
              className="text-2xl md:text-3xl cursor-pointer select-none"
              onClick={() => setCartOpen(open => !open)}
            >
              cart
            </h2>
            <span className="text-xs text-black/40">({cartCount})</span>
          </div>
          {/* Contenu du panier, déroulant sur mobile */}
          <AnimatePresence>
            {(cartOpen || isDesktop) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden px-6 pb-6 md:px-0 md:pb-0"
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 mb-6 md:mb-8">
                    {cartItems.length === 0 ? (
                      <div className="text-black/40 italic">empty</div>
                    ) : (
                      <ul className="space-y-2 overflow-y-auto max-h-[30vh] md:max-h-[60vh]">
                        {cartItems.map(item => (
                          <CartItem
                            key={item.uniqueId || item.id}
                            item={item}
                            productsById={productsById}
                            locale={locale}
                            onRemove={removeFromCart}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="border-t border-black/30 pt-4 flex justify-between text-lg mb-4">
                    <span>total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  {/* Bouton checkout Snipcart */}
                  <button
                    className={`snipcart-checkout text-right transition-colors ${
                      cartItems.length > 0
                        ? 'text-gray-300 hover:text-black'
                        : 'text-black/20 pointer-events-none'
                    }`}
                    disabled={cartItems.length === 0}
                  >
                    → checkout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
        {/* Liste produits (mobile: prend le reste, desktop: colonne centrale) */}
        <div className="w-full md:flex-1 flex-1 md:h-full flex items-center justify-center bg-whiteCustom order-2 md:order-2">
          <div className="w-full max-w-3xl xl:max-w-3xl 2xl:max-w-4xl p-4 md:p-16">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-12 w-full pt-2 md:pt-10">
              {products.map(product => (
                <ShopItem
                  key={product.id}
                  imgDefault={product.imgDefault}
                  imgHover={product.imgHover}
                  title={localizeField(product.title, locale)}
                  price={product.price + '€'}
                  onClick={
                    cartItemIds.has(product.id)
                      ? undefined
                      : () => setSelectedProduct(product)
                  }
                  inCart={cartItemIds.has(product.id)}
                  className="!h-36 md:!h-64" // hauteur réduite sur mobile
                />
              ))}
            </div>
          </div>
        </div>
        {/* Spacer desktop pour décaler le contenu vers la gauche */}
        <div className="hidden lg:block w-[200px] shrink-0 order-3" />
      </main>

      {/* Overlay produit */}
      <AnimatePresence>
        {selectedProduct && (
          <ShopOverlay
            isOpen={!!selectedProduct}
            product={selectedProduct}
            locale={locale}
            inCart={cartItemIds.has(selectedProduct.id)}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
