import Link from 'next/link';

export default function AnimatedUnderlineLink({
  href,
  onClick,
  children,
  className = '',
  ...props
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group hover:[--bg-size:100%_1px] inline-block text-whiteCustom transition-colors ${className}`.trim()}
      {...props}
    >
      <span
        className={`font-liberation text-sm md:text-[16px] leading-relaxed inline box-decoration-clone bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat [background-position:0_100%] transition-[background-size,color] duration-300 ease-in-out`}
        style={{ backgroundSize: 'var(--bg-size, 0% 1px)' }}
      >
        {children}
      </span>
    </Link>
  );
}
