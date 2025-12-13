import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Recette introuvable</h1>
        <p className="text-gray-600 text-lg mb-8">Désolé, la recette que vous recherchez n&apos;existe pas ou a été supprimée.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Retour aux recettes</span>
        </Link>
      </div>
    </main>
  );
}
