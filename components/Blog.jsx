'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import BlogArchives from './BlogArchives';
import BlogPostItem from './BlogPostItem';
import dynamic from 'next/dynamic';
import client from '../lib/sanity.client';
import { CONTENT } from '../lib/constants';

const BlogPostOverlay = dynamic(() => import('./BlogPostOverlay'), {
  loading: () => <div>Loading…</div>,
});

export default function Blog() {
  const { locale } = useParams();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [requestedPostId, setRequestedPostId] = useState(null);

  const readRequestedPostId = () => {
    try {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('post');
    } catch {
      return null;
    }
  };

  const replacePostParam = postId => {
    const pathname = `/${locale}`;
    const sp = new URLSearchParams(window.location.search);

    if (postId) sp.set('post', postId);
    else sp.delete('post');

    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}#blog` : `${pathname}#blog`);
  };

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Lire ?post=<id> côté client sans useSearchParams (évite l'erreur suspense en build)
  useEffect(() => {
    const update = () => setRequestedPostId(readRequestedPostId());
    update();
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await client.fetch(
        '*[_type == "blogPost"] | order(date desc) { ..., image{ asset->{ url } } }'
      );
      const mapped = data.map(p => ({
        id: p._id,
        title:
          p.title?.[locale] ||
          p.title?.fr ||
          p[`title_${locale}`] ||
          p.title_fr,
        date: new Date(p.date).toLocaleDateString(
          locale === 'fr' ? 'fr-FR' : locale === 'de' ? 'de-DE' : 'en-US',
          { year: 'numeric', month: 'short', day: 'numeric' }
        ),
        text:
          p.texte?.[locale] ||
          p.texte?.fr ||
          // Compat ancien schéma (avant "texte")
          p.fullContent?.[locale] ||
          p.fullContent?.fr ||
          p.excerpt?.[locale] ||
          p.excerpt?.fr ||
          p.content?.[locale] ||
          p.content?.fr ||
          '',
        image: p.image?.asset?.url,
        layout: p.layout,
      }));
      setPosts(mapped);
    };
    fetchPosts();
  }, [locale]);

  // Ouvrir un post directement via ?post=<id> (utile pour les liens newsletter)
  useEffect(() => {
    if (!requestedPostId || posts.length === 0) return;
    const match = posts.find(p => p.id === requestedPostId);
    if (match) setSelectedPost(match);
  }, [requestedPostId, posts]);

  const latestPosts = posts.slice(0, isMobile ? 1 : CONTENT.BLOG_PREVIEW_COUNT);

  return (
    <>
      <section
        id="blog"
        className="h-screen snap-start flex items-center justify-center lg:justify-start  2xl:items-center 2xl:justify-center bg-blackCustom relative py-10 px-6 sm:px-10 lg:pl-20 lg:pr-16"
        aria-label="Section blog"
      >
        <div
          style={{ width: 'min(1000px, 85vw)' }}
          className="flex flex-col h-full max-h-full 2xl:max-w-5xl"
        >
          {/* Posts List */}
          <div className="flex-1 flex flex-col justify-center min-h-0">
            {latestPosts.map(post => (
              <BlogPostItem
                key={post.id}
                post={post}
                onClick={() => {
                  replacePostParam(post.id);
                  setSelectedPost(post);
                }}
              />
            ))}
            <div className="w-full xl:justify-end 2xl:justify-center mt-4 shrink-0 hidden lg:flex">
              <button
                onClick={() => setArchiveOpen(true)}
                className="text-lg font-playfair italic text-whiteCustom/60 hover:text-whiteCustom transition-colors"
              >
                More posts
              </button>
            </div>
          </div>

          {/* Footer / More Posts - caché sur mobile */}
        </div>
      </section>

      <AnimatePresence>
        {archiveOpen && (
          <BlogArchives
            posts={posts}
            onClose={() => setArchiveOpen(false)}
            onPostClick={post => setSelectedPost(post)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <BlogPostOverlay
            post={selectedPost}
            onClose={() => {
              setSelectedPost(null);
              replacePostParam(null);
            }}
            onPrevious={() => {
              const currentIndex = posts.findIndex(
                p => p.id === selectedPost.id
              );
              if (currentIndex > 0) {
                const prev = posts[currentIndex - 1];
                replacePostParam(prev.id);
                setSelectedPost(prev);
              }
            }}
            onNext={() => {
              const currentIndex = posts.findIndex(
                p => p.id === selectedPost.id
              );
              if (currentIndex < posts.length - 1) {
                const next = posts[currentIndex + 1];
                replacePostParam(next.id);
                setSelectedPost(next);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
