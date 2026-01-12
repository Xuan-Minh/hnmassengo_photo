export default function NotFound() {
  return (
    <main className="min-h-screen bg-blackCustom text-whiteCustom flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-playfair italic mb-6">
          404 - Page non trouvée
        </h1>
        <p className="text-lg md:text-xl mb-8 opacity-80">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <a
          href="/"
          className="inline-block bg-accent hover:bg-accentHover text-white px-8 py-3 rounded transition-colors duration-300 font-playfair"
        >
          Retour à l'accueil
        </a>
      </div>
    </main>
  );
}
