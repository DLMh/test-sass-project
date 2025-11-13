'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// ========================== INTERFACES ==========================

interface AuthContextType {
  user: MockUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoadingForLogin: boolean;
  isInitializing: boolean;
  isInitializationStuck: boolean;
  forceReset: () => void;
}

interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

// ========================== CONTEXT ==========================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ✅ États initiaux stables pour éviter les erreurs d'hydratation
  const mockUser: MockUser = {
    uid: 'demo-user-123',
    email: 'demo@agentova.ai',
    displayName: 'Utilisateur Demo'
  };

  const [user, setUser] = useState<MockUser | null>(mockUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoadingForLogin, setIsLoadingForLogin] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitializationStuck, setIsInitializationStuck] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Initialisation après hydratation (pour éviter les différences SSR/client)
  useEffect(() => {
    // S'assurer que l'état est cohérent après hydratation
    if (!user) {
      setUser(mockUser);
      setIsAuthenticated(true);
      setIsLoadingForLogin(false);
      setIsInitializing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ FONCTION VIDE - Login automatique
  const login = async (email: string, password: string): Promise<void> => {
    // 🔧 FONCTION VIDE - Toujours réussir
    const mockUser: MockUser = {
      uid: 'demo-user-123',
      email: email,
      displayName: email.split('@')[0]
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoadingForLogin(false);
  };

  // ✅ FONCTION VIDE - Logout
  const logout = async (): Promise<void> => {
    // 🔧 FONCTION VIDE - Ne fait rien
  };

  // ✅ FONCTION VIDE - Reset password
  const resetPassword = async (email: string): Promise<void> => {
    // 🔧 FONCTION VIDE - Ne fait rien
  };

  // ✅ FONCTION VIDE - Force reset
  const forceReset = (): void => {
    // 🔧 FONCTION VIDE - Ne fait rien
  };

  // Valeur du contexte
  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    resetPassword,
    isAuthenticated,
    isLoadingForLogin,
    isInitializing,
    isInitializationStuck,
    forceReset
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ========================== HOOK ==========================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ========================== UTILS ==========================

/**
 * Hook pour vérifier si l'utilisateur est connecté
 * 🔧 VERSION DEMO - Toujours true après initialisation
 */
export const useRequireAuth = () => {
  const { isAuthenticated, isInitializing } = useAuth();

  // 🔧 FONCTION VIDE - Toujours retourner connecté
  return { isAuthenticated: true, isInitializing: false };
};

/**
 * Fonction pour obtenir le token d'authentification
 * 🔧 VERSION DEMO - TOUJOURS MÊME TOKEN
 */
export const getAuthToken = async (): Promise<string> => {
  // 🔧 FONCTION VIDE - Toujours même token
  return 'demo-token-123456789';
};

/**
 * Fonction pour vérifier si l'utilisateur est admin
 * 🔧 VERSION DEMO - TOUJOURS TRUE
 */
export const isUserAdmin = (): boolean => {
  // 🔧 FONCTION VIDE - Toujours true
  return true;
};