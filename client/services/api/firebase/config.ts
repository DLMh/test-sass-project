import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

/**
 * Configuration Firebase pour le test technique
 * 🔧 VERSION DEMO - Uniquement mode développement local
 */
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// 🔧 TOUJOURS en mode développement local (émulateurs)
const functions = getFunctions(app, 'us-central1');

// ✅ Connexion aux émulateurs uniquement si disponibles (évite erreurs si non démarrés)
if (typeof window !== 'undefined') {
  // Connexion Auth Emulator avec gestion d'erreur
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  } catch (error: any) {
    // Ignorer l'erreur si l'émulateur est déjà connecté
    if (!error?.message?.includes('already been called')) {
      console.warn('⚠️ Émulateur Auth Firebase non disponible:', error);
    }
  }

  // Connexion Functions Emulator avec gestion d'erreur
  try {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  } catch (error: any) {
    // Ignorer l'erreur si l'émulateur est déjà connecté
    if (!error?.message?.includes('already been called')) {
      console.warn('⚠️ Émulateur Functions Firebase non disponible:', error);
    }
  }
}

export { app, auth, functions }; 