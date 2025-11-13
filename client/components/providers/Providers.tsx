'use client';

import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '../../contexts/AuthContext';
import { queryClient } from '../../lib/queryClient';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Composant client pour les providers
 * Permet de garder le layout racine comme Server Component
 */
export function Providers({ children }: ProvidersProps) {
  // ✅ Éviter les différences d'hydratation en vérifiant après le montage
  const [isMounted, setIsMounted] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      {/* ✅ Afficher ReactQueryDevtools uniquement après hydratation */}
      {isMounted && isDevelopment && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

