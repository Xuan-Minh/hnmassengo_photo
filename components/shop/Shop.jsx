'use client';

import { useTranslations } from 'next-intl';
import { useMemo, useEffect, useCallback, useReducer, useRef } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence, m } from 'framer-motion';
import ShopItem from './ShopItem';
import ShopOverlay from './ShopOverlay';
import { formatPrice } from '../../lib/utils';
import { logger } from '../../lib/logger';
import { buildSanityImageUrl } from '../../lib/imageUtils';
import { getOptimizedImageParams } from '../../lib/hooks';
import client from '../../lib/sanity.client';

// ==========================================
// 1. UTILITAIRES
// ==========================================

function getSnipcartItemUrl() {
  if (typeof window !== 'undefined')
    return `${window.location.origin}/snipcart-products`;
  return '/snipcart-products';
}

function localizeField(value, locale) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.fr || value?.en || value?.de || '';
}

// ==========================================
// 2. ÉTAT ET REDUCER
// ==========================================

const initialState = {
  cartOpen: false,
  isDesktop: false,
  selectedProduct: null,
  products: [],
  cartItems: [],
  cartTotal: 0,
  cartCount: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    case 'TOGGLE_CART':
      return { ...state, cartOpen: !state.cartOpen };
    default:
      return state;
  }
}

// ==========================================
// 3. SOUS-COMPOSANTS UI
// ==========================================

const CartItem = ({ item, productsById, locale, onRemove, t }) => {
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
            title={t('cart.removeItem')}
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

const CartSidebar = ({
  cartOpen,
  isDesktop,
  cartCount,
  cartItems,
  cartTotal,
  productsById,
  locale,
  removeFromCart,
  dispatch,
  t,
}) => (
  <aside
    className={`w-full md:w-[320px] h-auto md:h-full ${cartOpen ? 'border-b' : ''} md:border-b-0 md:border-r border-black/30 p-0 md:p-10 flex flex-col z-10 bg-background order-1 md:order-1`}
  >
    <div className="flex justify-between items-center mb-0 md:mb-8 px-6 py-4 md:px-0 md:py-0">
      <button
        type="button"
        className="text-2xl md:text-3xl cursor-pointer select-none"
        onClick={() => dispatch({ type: 'TOGGLE_CART' })}
        onKeyPress={e => {
          if (e.key === 'Escape' && cartOpen) {
            dispatch({ type: 'TOGGLE_CART' });
          }
        }}
      >
        @{t('cart.title')}
      </button>
      <span className="hidden md:block text-xs text-black/40">
        ({cartCount})
      </span>
    </div>
    <AnimatePresence>
      {(cartOpen || isDesktop) && (
        <m.div
          key="snipcart-dropdown"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden px-6 pb-6 md:px-0 md:pb-0 max-h-[60vh] md:max-h-none"
        >
          <div className="flex flex-col">
            <div className="mb-6 md:mb-8">
              {cartItems.length === 0 ? (
                <div className="text-black/40 italic">{t('cart.empty')}</div>
              ) : (
                <ul className="space-y-2 overflow-y-auto max-h-[30vh] md:max-h-[60vh]">
                  {cartItems.map(item => (
                    <CartItem
                      key={item.uniqueId || item.id}
                      item={item}
                      productsById={productsById}
                      locale={locale}
                      onRemove={removeFromCart}
                      t={t}
                    />
                  ))}
                </ul>
              )}
            </div>
            <div className="border-t border-black/30 pt-4 flex justify-between text-lg mb-4">
              <span>{t('cart.total')}</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <button
              type="button"
              className={`snipcart-checkout text-right transition-colors ${
                cartItems.length > 0
                  ? 'text-gray-300 hover:text-black'
                  : 'text-black/20 pointer-events-none'
              }`}
              disabled={cartItems.length === 0}
            >
              {t('cart.checkout')}
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  </aside>
);

const ProductGrid = ({ products, cartItemIds, locale, dispatch, t }) => {
  if (products.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center px-4 md:px-16 text-center italic">
        <h2 className="text-xl md:text-3xl font-liberation mb-4">
          {t('emptyState.title')}
        </h2>
        <p className="text-base md:text-lg text-black/60">
          {t('emptyState.message')}
        </p>
      </div>
    );
  }

  return (
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
                : () =>
                    dispatch({
                      type: 'UPDATE_STATE',
                      payload: { selectedProduct: product },
                    })
            }
            inCart={cartItemIds.has(product.id)}
            className="!h-36 md:!h-64"
          />
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 4. CUSTOM HOOK : LOGIQUE SNIPCART
// ==========================================

function useSnipcart(dispatch, cartItemIds, snipcartItemUrl) {
  const syncWithSnipcart = useCallback(() => {
    if (window.Snipcart && window.Snipcart.store) {
      try {
        const snipcartState = window.Snipcart.store.getState();
        const items = snipcartState.cart.items.items || [];
        const count = snipcartState.cart.items.count || 0;
        const calculatedTotal = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        dispatch({
          type: 'UPDATE_STATE',
          payload: {
            cartItems: items,
            cartTotal: calculatedTotal,
            cartCount: count,
          },
        });
      } catch (error) {
        logger.error('Error syncing with Snipcart:', error);
      }
    }
  }, [dispatch]);

  const removeFromCart = useCallback(
    async item => {
      if (typeof window === 'undefined' || !window.Snipcart) return;

      let uniqueId = item.uniqueId;
      if (!uniqueId && window.Snipcart.store?.getState) {
        try {
          const snipcartState = window.Snipcart.store.getState();
          const items = snipcartState?.cart?.items?.items || [];
          uniqueId = items.find(i => i.id === item.id)?.uniqueId;
        } catch {
          // ignore
        }
      }

      if (!uniqueId) {
        logger.error('Failed to remove item from Snipcart (missing uniqueId)');
        return;
      }

      try {
        if (window.Snipcart.api?.cart?.items?.remove) {
          await window.Snipcart.api.cart.items.remove(uniqueId);
        } else if (window.Snipcart.api?.items?.remove) {
          await window.Snipcart.api.items.remove(uniqueId);
        } else if (window.Snipcart.store?.dispatch) {
          try {
            window.Snipcart.store.dispatch('cart.items.remove', uniqueId);
          } catch {
            window.Snipcart.store.dispatch({
              type: 'cart.items.remove',
              payload: uniqueId,
            });
          }
        }
      } catch (e) {
        logger.error('Failed to remove item from Snipcart', e);
      } finally {
        setTimeout(syncWithSnipcart, 150);
      }
    },
    [syncWithSnipcart]
  );

  const syncWithSnipcartRef = useRef(syncWithSnipcart);
  useEffect(() => {
    syncWithSnipcartRef.current = syncWithSnipcart;
  }, [syncWithSnipcart]);

  useEffect(() => {
    const handleSync = (...args) => syncWithSnipcartRef.current?.(...args);

    const initSnipcart = () => {
      if (typeof window === 'undefined' || !window.Snipcart) return;
      try {
        handleSync();
        if (window.Snipcart.events?.on) {
          window.Snipcart.events.on('item.added', handleSync);
          window.Snipcart.events.on('item.removed', handleSync);
          window.Snipcart.events.on('item.updated', handleSync);
          window.Snipcart.events.on('cart.confirmed', handleSync);
        }
      } catch (e) {
        logger.error('Snipcart init error', e);
      }
    };

    let loadHandler;
    if (document.readyState === 'complete') {
      setTimeout(initSnipcart, 1000);
    } else {
      loadHandler = () => setTimeout(initSnipcart, 1000);
      window.addEventListener('load', loadHandler);
    }

    return () => {
      if (window.Snipcart?.events?.off) {
        try {
          window.Snipcart.events.off('item.added', handleSync);
          window.Snipcart.events.off('item.removed', handleSync);
          window.Snipcart.events.off('item.updated', handleSync);
          window.Snipcart.events.off('cart.confirmed', handleSync);
        } catch (e) {
          logger.error('Snipcart cleanup error', e);
        }
      }
      if (loadHandler) window.removeEventListener('load', loadHandler);
    };
  }, []);

  const addToCart = useCallback(
    product => {
      if (cartItemIds.has(product.id)) {
        dispatch({ type: 'UPDATE_STATE', payload: { cartOpen: true } });
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
        dispatch({ type: 'UPDATE_STATE', payload: { cartOpen: true } });
      }, 100);
    },
    [cartItemIds, snipcartItemUrl, syncWithSnipcart, dispatch]
  );

  return { removeFromCart, addToCart };
}

// ==========================================
// 5. COMPOSANT PRINCIPAL
// ==========================================

export default function Shop() {
  const t = useTranslations('shop');
  const { locale } = useParams();

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    cartOpen,
    isDesktop,
    selectedProduct,
    products,
    cartItems,
    cartTotal,
    cartCount,
  } = state;

  const snipcartItemUrl = useMemo(() => getSnipcartItemUrl(), []);

  // Nettoyer l'URL si elle contient des ancres Snipcart
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      ['#snipcart', '#cart', '#/cart', '#/checkout'].includes(
        window.location.hash
      )
    ) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  }, []);

  // Gérer le responsive
  useEffect(() => {
    const checkDesktop = () => {
      dispatch({
        type: 'UPDATE_STATE',
        payload: { isDesktop: window.innerWidth >= 768 },
      });
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Gérer le verrouillage du scroll
  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');
    if (!scrollRoot) return;
    scrollRoot.style.overflow = selectedProduct ? 'hidden' : '';
    return () => {
      scrollRoot.style.overflow = '';
    };
  }, [selectedProduct]);

  // Derived state
  const cartItemIds = useMemo(
    () => new Set((cartItems || []).map(item => item.id)),
    [cartItems]
  );
  const productsById = useMemo(
    () => new Map(products.map(p => [p.id, p])),
    [products]
  );

  // Charger les produits Sanity
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await client.fetch(
          '*[_type == "shopItem"] { ..., image{ asset->{ url } }, imgHover{ asset->{ url } } }'
        );
        const formatted = data.map(p => ({
          id: p._id,
          imgDefault: p.image?.asset?.url
            ? buildSanityImageUrl(p.image.asset.url, {
                ...getOptimizedImageParams('shop'),
                auto: 'format',
              })
            : null,
          imgHover: p.imgHover?.asset?.url
            ? buildSanityImageUrl(p.imgHover.asset.url, {
                ...getOptimizedImageParams('shop'),
                auto: 'format',
              })
            : null,
          title: p.title,
          price: p.price,
          description: p.description,
          snipcartName:
            localizeField(p.title, 'fr') || localizeField(p.title, locale),
          snipcartDescription: localizeField(p.description, 'fr') || '',
          formats: p.formats || [],
          snipcartUrl: snipcartItemUrl,
        }));
        dispatch({ type: 'UPDATE_STATE', payload: { products: formatted } });
      } catch (err) {
        logger.error('Failed to load products', err);
      }
    };
    fetchProducts();
  }, [locale, snipcartItemUrl]);

  // Initialisation du hook Snipcart
  const { removeFromCart, addToCart } = useSnipcart(
    dispatch,
    cartItemIds,
    snipcartItemUrl
  );

  return (
    <section className="flex h-screen bg-background font-liberation snap-start relative">
      <main className="flex-1 h-full flex flex-col md:flex-row items-stretch overflow-hidden">
        <CartSidebar
          cartOpen={cartOpen}
          isDesktop={isDesktop}
          cartCount={cartCount}
          cartItems={cartItems}
          cartTotal={cartTotal}
          productsById={productsById}
          locale={locale}
          removeFromCart={removeFromCart}
          dispatch={dispatch}
          t={t}
        />

        <div className="w-full md:flex-1 flex-1 md:h-full flex items-center justify-center bg-background order-2 md:order-2">
          <ProductGrid
            products={products}
            cartItemIds={cartItemIds}
            locale={locale}
            dispatch={dispatch}
            t={t}
          />
        </div>

        <div className="hidden lg:block w-[200px] shrink-0 order-3" />
      </main>

      <AnimatePresence>
        {selectedProduct && (
          <ShopOverlay
            key={`shop-overlay-${selectedProduct.id}`}
            isOpen={!!selectedProduct}
            product={selectedProduct}
            locale={locale}
            inCart={cartItemIds.has(selectedProduct.id)}
            onClose={() =>
              dispatch({
                type: 'UPDATE_STATE',
                payload: { selectedProduct: null },
              })
            }
            onAddToCart={addToCart}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
