"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import BlogArchives from "./BlogArchives";
import BlogPostItem from "./BlogPostItem";
import dynamic from "next/dynamic";
import client from "../lib/sanity.client";
import { CONTENT } from "../lib/constants";

// Lazy load BlogPostOverlay
const BlogPostOverlay = dynamic(() => import("./BlogPostOverlay"), {
  loading: () => <div>Loading…</div>,
});

export default function Blog() {
  const t = useTranslations();
  const { locale } = useParams();
  const [posts, setPosts] = useState([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Charger les posts depuis Sanity
  useEffect(() => {
    const fetchPosts = async () => {
      const data = await client.fetch(
        '*[_type == "blogPost"] | order(date desc) { ..., image{ asset->{ url } } }'
      );
      console.log("Fetched posts:", data); // Debug
      const mapped = data.map((p) => ({
        id: p._id,
        title:
          p.title?.[locale] ||
          p.title?.fr ||
          p[`title_${locale}`] ||
          p.title_fr,
        date: new Date(p.date).toLocaleDateString(
          locale === "fr" ? "fr-FR" : locale === "de" ? "de-DE" : "en-US",
          { year: "numeric", month: "short", day: "numeric" }
        ),
        content:
          p.content?.[locale] ||
          p.content?.fr ||
          p[`content_${locale}`] ||
          p.content_fr,
        fullContent:
          p.fullContent?.[locale] ||
          p.fullContent?.fr ||
          p[`fullContent_${locale}`] ||
          p.fullContent_fr,
        image: p.image?.asset?.url,
        layout: p.layout,
      }));
      console.log("Mapped posts:", mapped); // Debug
      setPosts(mapped);
    };
    fetchPosts();
  }, [locale]);

  const latestPosts = posts.slice(0, isMobile ? 1 : CONTENT.BLOG_PREVIEW_COUNT);

  return (
    <>
      <section
        id="blog"
        className="h-screen snap-start flex items-center justify-center lg:justify-start  2xl:items-center 2xl:justify-center bg-blackCustom relative py-10 px-6 sm:px-10 lg:pl-20 lg:pr-16"
        aria-label="Section blog"
      >
        <div
          style={{ width: "min(1000px, 85vw)" }}
          className="flex flex-col h-full max-h-full 2xl:max-w-5xl"
        >
          {/* Posts List */}
          <div className="flex-1 flex flex-col justify-center lg:justify-start min-h-0">
            {latestPosts.map((post, index) => (
              <BlogPostItem
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>

          {/* Footer / More Posts - caché sur mobile */}
          <div className="w-full justify-end mt-4 shrink-0 hidden lg:flex">
            <button
              onClick={() => setArchiveOpen(true)}
              className="text-lg font-playfair italic text-whiteCustom/60 hover:text-whiteCustom transition-colors"
            >
              more posts ↗
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {archiveOpen && (
          <BlogArchives
            posts={posts}
            onClose={() => setArchiveOpen(false)}
            onPostClick={(post) => setSelectedPost(post)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <BlogPostOverlay
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onPrevious={() => {
              const currentIndex = posts.findIndex(
                (p) => p.id === selectedPost.id
              );
              if (currentIndex > 0) {
                setSelectedPost(posts[currentIndex - 1]);
              }
            }}
            onNext={() => {
              const currentIndex = posts.findIndex(
                (p) => p.id === selectedPost.id
              );
              if (currentIndex < posts.length - 1) {
                setSelectedPost(posts[currentIndex + 1]);
              }
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
