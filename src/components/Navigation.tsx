'use client';

import Image from 'next/image';
import Link from 'next/link';
import { startTransition, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export default function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  return (
    <nav className="relative bg-white shadow-md mb-8 border-b-2 border-orange-200 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image src="/bar.jpeg" alt="Navigation Banner" fill className="object-cover opacity-20" priority />
      </div>
      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative w-[60px] h-[60px] flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Pi Food Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Pi Food</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-700 hover:text-orange-600 transition-colors font-medium">
              Recettes
            </Link>

            {!mounted ? (
              <Link
                href="/login"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-md"
              >
                Connexion
              </Link>
            ) : isAuthenticated ? (
              <>
                <Link href="/favorites" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                  Mes Favoris
                </Link>
                <button
                  onClick={logout}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-md"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-md"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
