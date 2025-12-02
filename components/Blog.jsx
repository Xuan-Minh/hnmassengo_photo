"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import BlogArchives from "./BlogArchives";
import BlogPostItem from "./BlogPostItem";
import BlogPostOverlay from "./BlogPostOverlay";
import { BLOG_POSTS } from "../lib/data";

// Utiliser les données centralisées
const POSTS =
  BLOG_POSTS.length > 0
    ? BLOG_POSTS
    : [
        {
          id: 1,
          title: "Some randoms thoughts",
          date: "12 oct. 2025",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna. Phasellus vel rhoncus nisl [...]",
          fullContent:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna. Phasellus vel rhoncus nisl. Vestibulum congue lacinia mi volutpat bibendum. Proin vitae odio est. Vivamus tempus pretium commodo. Nulla facilisi.\n\nNam dui metus, interdum vitae lobortis vel, viverra consequat neque. Praesent sagittis aliquet posuere. Aenean suscipit, mi quis viverra pulvinar, purus nulla placerat mi, quis mollis lectus ipsum vitae velit.",
          image: "/home/home1.jpg", // Placeholder
          layout: "image-left",
        },
        {
          id: 2,
          title: "Some randoms thoughts",
          date: "12 oct. 2025",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna. Phasellus vel rhoncus nisl [...]",
          fullContent:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna. Phasellus vel rhoncus nisl.",
          image: "/home/home2.jpg", // Placeholder
          layout: "image-right",
        },
        {
          id: 3,
          title: "Some randoms thoughts",
          date: "12 oct. 2025",
          content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna. Phasellus vel rhoncus nisl [...]",
          fullContent:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur posuere tincidunt lacus sit amet porttitor. Aliquam pharetra ante vel nibh accumsan, a bibendum lorem egestas. Sed ac accumsan metus, vitae finibus urna. Phasellus vel rhoncus nisl.",
          image: null,
          layout: "text-only",
        },
        {
          id: 4,
          title: "Older post",
          date: "10 oct. 2025",
          content: "Lorem ipsum dolor sit amet...",
          fullContent: "Full content of older post...",
          image: "/home/home3.jpg",
          layout: "image-left",
        },
      ];

export default function Blog() {
  const t = useTranslations();
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const latestPosts = POSTS.slice(0, 3);

  return (
    <>
      <section
        id="blog"
        className="h-screen snap-start flex items-center justify-center bg-blackCustom relative"
        aria-label="Section blog"
      >
        <div
          style={{ width: "min(1100px, 90vw)" }}
          className="flex flex-col h-full"
        >
          {/* Posts List */}
          <div className="flex-1 flex flex-col">
            {latestPosts.map((post, index) => (
              <React.Fragment key={post.id}>
                {index === 0 && (
                  <div className="w-full h-[1px] bg-whiteCustom/20" />
                )}
                <BlogPostItem
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              </React.Fragment>
            ))}
          </div>

          {/* Footer / More Posts */}
          <div className="w-full flex justify-end mt-8">
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
            posts={POSTS}
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
          />
        )}
      </AnimatePresence>
    </>
  );
}
