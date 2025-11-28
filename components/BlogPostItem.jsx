import React from "react";

export default function BlogPostItem({ post, onClick }) {
  return (
    <div
      className="w-full border-b border-whiteCustom/20 py-4 cursor-pointer group"
      onClick={onClick}
    >
      {post.layout === "image-left" && post.image && (
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/3 aspect-square overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="flex-1 text-whiteCustom">
            <h3 className="text-3xl font-playfair italic mb-2">{post.title}</h3>
            <div className="text-xl font-playfair mb-4">{post.date}</div>
            <p className="font-playfair text-whiteCustom/80 leading-relaxed">
              {post.content}
            </p>
          </div>
        </div>
      )}

      {post.layout === "image-right" && post.image && (
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 text-whiteCustom order-2 md:order-1">
            <h3 className="text-3xl font-playfair italic mb-2">{post.title}</h3>
            <div className="text-xl font-playfair mb-4">{post.date}</div>
            <p className="font-playfair text-whiteCustom/80 leading-relaxed">
              {post.content}
            </p>
          </div>
          <div className="w-full md:w-1/3 aspect-[4/3] overflow-hidden order-1 md:order-2">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>
      )}

      {(post.layout === "text-only" || !post.image) && (
        <div className="text-whiteCustom">
          <div className="flex flex-wrap items-baseline gap-4 mb-4">
            <h3 className="text-3xl font-playfair italic">{post.title}</h3>
            <span className="text-xl font-playfair">{post.date}</span>
          </div>
          <p className="font-playfair text-whiteCustom/80 leading-relaxed max-w-3xl">
            {post.content}
          </p>
        </div>
      )}
    </div>
  );
}
