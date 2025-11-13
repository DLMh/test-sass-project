import { QueryClient } from '@tanstack/react-query';

/**
 * Configuration du QueryClient pour React Query
 * Conforme aux règles Agentova : staleTime: 0, refetchOnMount: true, placeholderData
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                    // ✅ Toujours refetch
      refetchOnMount: true,           // ✅ Refetch au montage
      placeholderData: (previousData) => previousData, // ✅ Garde données pendant refetch
      retry: 1,                        // Retry une fois en cas d'erreur
      refetchOnWindowFocus: false,     // Pas de refetch au focus (évite trop de requêtes)
    },
    mutations: {
      retry: 1,                        // Retry une fois pour les mutations
    },
  },
});

