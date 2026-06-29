'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from '../../src/i18n/navigation';
import { AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import BlogArchives from './BlogArchives';
import BlogPostItem from './BlogPostItem';
import BlogPostOverlay from './BlogPostOverlay';
import client from '../../lib/sanity.client';
import { buildSanityImageUrl } from '../../lib/imageUtils';
import { CONTENT } from '../../lib/constants';
import { getOptimizedImageParams } from '../../lib/hooks';
import { useIsMobile } from '../../lib/hooks';

const readRequestedPostId = () => {
  try {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('post');
  } catch {
    return null;
  }
};

const isReloadNavigation = () => {
  try {
    const [entry] = window.performance.getEntriesByType('navigation');
    return entry?.type === 'reload';
  } catch {
    return false;
  }
};

export default function Blog() {
  const t = useTranslations('blog');
  const { locale } = useParams();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const isMobile = useIsMobile();

  const selectedPost = useMemo(() => {
    if (!selectedPostId || posts.length === 0) return null;
    return posts.find(p => p.id === selectedPostId) || null;
  }, [posts, selectedPostId]);

  const initialCheckDone = useRef(false);

  const replacePostParam = postId => {
    const sp = new URLSearchParams(window.location.search);

    if (postId) sp.set('post', postId);
    else sp.delete('post');

    const qs = sp.toString();
    router.replace(qs ? `/?${qs}#blog` : `/#blog`);
  };

  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');
    if (!scrollRoot) return;

    if (archiveOpen || selectedPostId) {
      scrollRoot.style.overflow = 'hidden';
    } else {
      scrollRoot.style.overflow = '';
    }

    return () => {
      scrollRoot.style.overflow = '';
    };
  }, [archiveOpen, selectedPostId]);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await client.fetch(
        '*[_type == "blogPost"] | order(date desc) { ..., image{ asset->{ url } }, extras[]{ ..., audio{ asset->{ url } }, file{ asset->{ url } } } }'
      );
      const mapped = data.map(p => ({
        id: p._id,
        title: p.title || null,
        date: new Date(p.date).toLocaleDateString(
          locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US',
          { year: 'numeric', month: 'short', day: 'numeric' }
        ),
        text:
          p.texte?.[locale] ||
          p.texte?.fr ||
          p.fullContent?.[locale] ||
          p.fullContent?.fr ||
          p.excerpt?.[locale] ||
          p.excerpt?.fr ||
          p.content?.[locale] ||
          p.content?.fr ||
          '',
        image: p.image?.asset?.url
          ? buildSanityImageUrl(p.image.asset.url, {
              ...getOptimizedImageParams('secondary'),
              auto: 'format',
            })
          : null,
        layout: p.layout,
        imagePosition: p.imagePosition || 'image-top',
        extras: p.extras || [],
        extrasPosition: p.extrasPosition || 'end',
      }));
      setPosts(mapped);

      if (!initialCheckDone.current && typeof window !== 'undefined') {
        initialCheckDone.current = true;
        const isReload = isReloadNavigation();
        if (isReload) {
          const url = new URL(window.location.href);
          if (url.searchParams.has('post')) {
            url.searchParams.delete('post');
            window.history.replaceState(
              null,
              '',
              `${url.pathname}${url.search}${url.hash}`
            );
          }
        } else {
          const initialId = readRequestedPostId();
          if (initialId) {
            setSelectedPostId(initialId);
          }
        }
      }
    };
    fetchPosts();
  }, [locale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const currentId = readRequestedPostId();
      setSelectedPostId(currentId || null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const latestPosts = posts.slice(0, isMobile ? 1 : CONTENT.BLOG_PREVIEW_COUNT);

  const handleOpenPost = () => {
    if (latestPosts.length > 0) {
      const currentPost = latestPosts[0];
      replacePostParam(currentPost.id);
      setSelectedPostId(currentPost.id);
    }
  };
  return (
    <>
      <section
        id="blog"
        className="h-[80dvh] md:h-screen snap-start flex items-center justify-center lg:justify-start  2xl:items-center 2xl:justify-center bg-blackCustom relative py-10 px-6 sm:px-10 lg:pl-20 lg:pr-16"
        aria-label={t('ariaLabel')}
      >
        <div
          style={{ width: 'min(1000px, 85vw)' }}
          className="flex flex-col justify-around h-full max-h-full 2xl:max-w-5xl"
        >
          {latestPosts.map(post => (
            <BlogPostItem
              key={post.id}
              post={post}
              postCount={latestPosts.length}
              isMobile={isMobile}
              onClick={() => {
                replacePostParam(post.id);
                setSelectedPostId(post.id);
              }}
            />
          ))}
          <div className="w-full xl:justify-end 2xl:justify-center shrink-0 hidden lg:flex">
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              className="text-lg font-liberation italic text-whiteCustom/60 hover:text-whiteCustom transition-colors hover:[--bg-size:100%_1px]"
            >
              <span
                className={`inline box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] transition-[background-size,color] duration-300 ease-in-out`}
                style={{ backgroundSize: 'var(--bg-size, 0% 1px)' }}
              >
                {t('morePosts')}
              </span>
            </button>
          </div>
          {isMobile && (
            <div className="w-full flex justify-center mt-6 lg:hidden">
              <button
                type="button"
                // 2. THIS NOW CALLS THE CORRECT FUNCTION
                onClick={handleOpenPost}
                className="text-lg font-liberation italic text-whiteCustom/60 hover:text-whiteCustom transition-colors hover:[--bg-size:100%_1px]"
              >
                <span
                  className={`inline box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] transition-[background-size,color] duration-300 ease-in-out`}
                  style={{ backgroundSize: 'var(--bg-size, 0% 1px)' }}
                >
                  {t('suite')}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {archiveOpen && (
          <BlogArchives
            key="blog-archives-modal"
            posts={posts}
            onClose={() => setArchiveOpen(false)}
            onPostClick={post => setSelectedPostId(post.id)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <BlogPostOverlay
            key={`blog-post-${selectedPost.id}`}
            post={selectedPost}
            onClose={() => {
              setSelectedPostId(null);
              replacePostParam(null);
            }}
            onPrevious={() => {
              const currentIndex = posts.findIndex(
                p => p.id === selectedPostId
              );
              if (currentIndex > 0) {
                const prev = posts[currentIndex - 1];
                replacePostParam(prev.id);
                setSelectedPostId(prev.id);
              }
            }}
            onNext={() => {
              const currentIndex = posts.findIndex(
                p => p.id === selectedPostId
              );
              if (currentIndex < posts.length - 1) {
                const next = posts[currentIndex + 1];
                replacePostParam(next.id);
                setSelectedPostId(next.id);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
