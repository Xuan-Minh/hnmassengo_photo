'use client';

export default function GlobalNotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-serif italic mb-6">
          404 - Page Not Found
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-80">
          The page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="inline-block bg-white text-black px-8 py-3 transition-colors duration-300 font-serif hover:bg-gray-200"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}
