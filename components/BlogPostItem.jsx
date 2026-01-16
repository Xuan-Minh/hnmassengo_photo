import Image from 'next/image';
import PropTypes from 'prop-types';

export default function BlogPostItem({ post, onClick }) {
  return (
    <div
      className="w-full lg:border-b lg:border-whiteCustom/20 py-2  lg:py-12 cursor-pointer group lg:hover:border-l-4 lg:hover:border-l-white lg:pl-8 transition-all duration-300"
      onClick={onClick}
    >
      {post.layout === 'image-left' && post.image && (
        <div className="flex flex-col lg:flex-row gap-8 sm:items-start lg:items-center ">
          <div className="w-full lg:w-1/3 flex items-center justify-center">
            <Image
              src={post.image}
              alt={post.title}
              width={400}
              height={300}
              className="w-full h-auto xl:max-h-[150px] 2xl:max-h[300px] object-contain lg:grayscale group-hover:grayscale-0 transition-all duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={false}
            />
          </div>
          <div className="flex-1 text-whiteCustom flex flex-col justify-start">
            <h3 className="text-4xl lg:text-3xl font-playfair italic mb-2">
              {post.title}
            </h3>
            <div className="text-xl lg:text-xl font-playfair mb-4">
              {post.date}
            </div>
            <p className="sm:text-xl lg:text-base font-playfair text-whiteCustom/80 leading-loose">
              {post.content}
            </p>
          </div>
        </div>
      )}

      {post.layout === 'image-right' && post.image && (
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1 text-whiteCustom order-2 lg:order-1 flex flex-col justify-start">
            <h3 className="text-2xl lg:text-3xl font-playfair italic mb-2">
              {post.title}
            </h3>
            <div className="text-lg lg:text-xl font-playfair mb-4">
              {post.date}
            </div>
            <p className="text-xl lg:text-base font-playfair text-whiteCustom/80 leading-loose">
              {post.content}
            </p>
          </div>
          <div className="w-full lg:w-1/3 flex items-center justify-center order-1 lg:order-2">
            <Image
              src={post.image}
              alt={post.title}
              width={400}
              height={300}
              className="w-full h-auto max-h-[300px] lg:max-h-[150px] object-contain lg:grayscale group-hover:grayscale-0 transition-all duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
              priority={false}
            />
          </div>
        </div>
      )}

      {(post.layout === 'text-only' || !post.image) && (
        <div className="text-whiteCustom">
          <div className="flex flex-wrap items-baseline gap-4 mb-4">
            <h3 className="text-2xl lg:text-3xl font-playfair italic">
              {post.title}
            </h3>
            <span className="text-lg lg:text-xl font-playfair">
              {post.date}
            </span>
          </div>
          <p className="text-xl lg:text-base font-playfair text-whiteCustom/80 leading-loose max-w-3xl">
            {post.content}
          </p>
        </div>
      )}
    </div>
  );
}

BlogPostItem.propTypes = {
  post: PropTypes.shape({
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    image: PropTypes.string,
    layout: PropTypes.oneOf(['image-left', 'image-right', 'text-only'])
      .isRequired,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};
