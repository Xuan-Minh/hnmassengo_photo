'use client';
import React from 'react';
import { motion } from 'framer-motion';
import BlogPostItem from './BlogPostItem';

export default function BlogArchives({ posts, onClose, onPostClick }) {
  return (
    <motion.div
      className="fixed inset-0 bg-blackCustom z-[60] flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="relative w-full h-24 flex items-center justify-center px-8 md:px-16 shrink-0">
        <button
          onClick={onClose}
          className="absolute left-8 md:left-16 text-lg font-playfair text-whiteCustom/60 hover:text-whiteCustom transition-colors"
        >
          back
        </button>
        <h2 className="text-4xl font-playfair italic text-whiteCustom">
          Archives
        </h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-8 md:px-16 pb-16">
        <div className="max-w-5xl mx-auto">
          {posts.map((post, index) => (
            <React.Fragment key={post.id}>
              {index === 0 && (
                <div className="w-full h-[1px] bg-background/20" />
              )}
              <BlogPostItem
                post={post}
                onClick={() => {
                  onPostClick(post);
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
