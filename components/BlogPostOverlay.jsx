"use client";
import React from "react";
import { motion } from "framer-motion";

export default function BlogPostOverlay({ post, onClose }) {
  if (!post) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-blackCustom text-whiteCustom font-playfair flex flex-col"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header / Back Button */}
      <div className="absolute top-8 left-8 md:left-16 z-50">
        <button
          onClick={onClose}
          className="text-lg text-whiteCustom/60 hover:text-whiteCustom transition-colors"
        >
          back
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center w-full h-full p-8 md:p-16 gap-12 md:gap-24 overflow-y-auto">
        {/* Left: Image */}
        {post.image && (
          <div className="w-full md:w-1/2 max-w-xl relative shadow-2xl shrink-0">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Right: Info */}
        <div className="w-full md:w-1/3 flex flex-col items-start text-left h-full justify-center">
          <h2 className="text-5xl md:text-6xl italic mb-8">{post.title}</h2>

          <div className="text-lg md:text-xl leading-relaxed text-whiteCustom/80 mb-12 max-w-md overflow-y-auto max-h-[40vh] pr-4">
            {post.fullContent.split("\n").map((paragraph, idx) => (
              <p key={idx} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-auto">
            <div className="text-xl font-playfair text-whiteCustom/60">
              {post.date}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full border-t border-whiteCustom/20 p-8 text-center relative shrink-0">
        <span className="text-xl italic">
          {post.title.toLowerCase()} - {post.date.split(" ").pop()}
        </span>
      </div>
    </motion.div>
  );
}
