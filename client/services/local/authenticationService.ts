import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../api/firebase/config';

// ========================== SERVICE URLS ==========================

export const SERVICE_URL = {
  FIREBASE: 'http://localhost:5001/demo-project/us-central1',
  FASTAPI: 'http://127.0.0.1:8080',
  APP: 'http://localhost:3000'
};

// ========================== TYPES ==========================

export interface WorkspaceToken {
  role: string;
  token: string;
}

export type WorkspaceTokenMap = Record<string, WorkspaceToken>;

// ========================== DONNÉES FANTÔMES ==========================

const MOCK_WORKSPACE_TOKENS: WorkspaceTokenMap = {
  'demo-workspace-123': {
    role: 'admin',
    token: 'demo-token-workspace-123'
  },
  'demo-workspace-456': {
    role: 'editor',
    token: 'demo-token-workspace-456'
  }
};

// ========================== FONCTIONS FANTÔMES ==========================

/**
 * Récupère le token d'authentification Firebase
 * 🔧 VERSION DEMO - Gestion du cas où l'utilisateur n'est pas authentifié dans Firebase Auth
 */
export async function getIdToken(): Promise<string> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      // En mode demo, retourner un token mock si l'utilisateur n'est pas authentifié dans Firebase Auth
      console.warn('⚠️ Utilisateur non authentifié dans Firebase Auth, utilisation d\'un token mock');
      return 'demo-token-123456789';
    }
    return await currentUser.getIdToken();
  } catch (error: any) {
    // Si erreur Firebase (émulateurs non démarrés), retourner token mock
    console.warn('⚠️ Erreur récupération token Firebase, utilisation d\'un token mock:', error);
    return 'demo-token-123456789';
  }
}

/**
 * Stocke les tokens workspace
 */
export function storeTokens(tokens: WorkspaceTokenMap): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('workspace_tokens', JSON.stringify(tokens));
  }
}

/**
 * Récupère les tokens workspace stockés
 */
export function getStoredTokens(): WorkspaceTokenMap {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('workspace_tokens');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return MOCK_WORKSPACE_TOKENS;
      }
    }
  }
  return MOCK_WORKSPACE_TOKENS;
}

/**
 * Appelle une fonction Firebase sécurisée
 */
export async function callSecuredFunction<T>(
  functionName: string,
  workspaceId: string,
  data?: any
): Promise<T> {
  try {
    // Récupérer le token workspace
    const workspace_tokens = getStoredTokens();
    const workspaceToken = workspace_tokens[workspaceId]?.token || null;

    // Appeler la fonction Firebase
    const callable = httpsCallable(functions, functionName);
    const result = await callable({
      workspaceToken,
      ...data
    });

    const response = result.data as any;

    // ✅ Vérifier si la réponse est vide ou invalide
    if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
      // ✅ Mode silencieux pour réponses vides - retour mock automatique
      if (functionName === 'getTexts') {
        return {
          success: true,
          texts: [],
          workspace_tokens: MOCK_WORKSPACE_TOKENS
        } as T;
      }
      
      // Pour les autres fonctions, throw une erreur
      throw new Error(`Réponse vide ou invalide pour ${functionName}`);
    }

    // ✅ Vérifier si la réponse contient une erreur (success: false)
    if (response && response.success === false) {
      const error = response.error || {};
      const errorCode = error.code || 'UNKNOWN';
      const errorMessage = error.message || 'Erreur inconnue';
      
      // Créer une erreur structurée pour le throw
      const structuredError = new Error(errorMessage);
      (structuredError as any).code = errorCode;
      (structuredError as any).details = error.details;
      (structuredError as any).originalError = error;
      throw structuredError;
    }

    // ✅ Réponse valide (success: true ou pas de champ success)
    const typedResponse = response as T & { workspace_tokens?: WorkspaceTokenMap };

    // Mettre à jour les tokens si reçus
    if (typedResponse.workspace_tokens) {
      storeTokens(typedResponse.workspace_tokens);
    }

    return typedResponse as T;
  } catch (error: any) {
    // ✅ Gestion d'erreur améliorée pour extraire toutes les informations
    let errorCode = 'UNKNOWN';
    let errorMessage = 'Erreur inconnue';
    let errorDetails: any = null;

    // ✅ Vérifier d'abord si c'est une FirebaseError
    const isFirebaseError = error?.constructor?.name === 'FirebaseError' || 
                           error?.name === 'FirebaseError' ||
                           (error && typeof error === 'object' && 'code' in error);

    if (isFirebaseError) {
      // ✅ Extraction depuis FirebaseError (structure native Firebase)
      errorCode = error.code || error['code'] || 'UNKNOWN';
      errorMessage = error.message || error['message'] || error.toString?.() || 'Erreur Firebase inconnue';
      errorDetails = error.details || error['details'] || error.customData || error['customData'] || null;
    }
    // ✅ Extraction depuis structure imbriquée
    else if (error?.error) {
      errorCode = error.error.code || 'UNKNOWN';
      errorMessage = error.error.message || 'Erreur inconnue';
      errorDetails = error.error.details || null;
    }
    // ✅ Extraction depuis string
    else if (typeof error === 'string') {
      errorMessage = error;
    }
    // ✅ Extraction depuis objet (même vide)
    else if (error && typeof error === 'object') {
      // Utiliser getOwnPropertyNames pour capturer les propriétés non-enumerable
      const allPropertyNames = Object.getOwnPropertyNames(error);
      const enumerableKeys = Object.keys(error);
      
      // Essayer d'accéder directement aux propriétés connues
      if ('code' in error) {
        try {
          errorCode = error.code || error['code'] || 'UNKNOWN';
        } catch {}
      }
      if ('message' in error) {
        try {
          errorMessage = error.message || error['message'] || 'Erreur inconnue';
        } catch {}
      }
      if ('details' in error) {
        try {
          errorDetails = error.details || error['details'] || null;
        } catch {}
      }

      // Si toujours pas de message, essayer toString ou name
      if (errorMessage === 'Erreur inconnue') {
        const toStringResult = error.toString?.();
        if (toStringResult && toStringResult !== '[object Object]') {
          errorMessage = toStringResult;
        } else if (error.name) {
          errorMessage = error.name;
        } else if (allPropertyNames.length === 0 && enumerableKeys.length === 0) {
          // Objet vraiment vide - erreur de connexion Firebase
          errorCode = 'internal';
          errorMessage = 'Erreur de connexion Firebase (objet vide)';
        } else {
          // Objet avec propriétés mais code/message non accessibles - probablement erreur de connexion
          errorCode = 'internal';
          errorMessage = 'Erreur de connexion Firebase';
        }
      }
    }
    
    // ✅ Fallback final : Si code et message sont toujours à leurs valeurs par défaut, c'est une erreur de connexion
    if (errorCode === 'UNKNOWN' && errorMessage === 'Erreur inconnue') {
      errorCode = 'internal';
      errorMessage = 'Erreur de connexion Firebase';
    }

    // ✅ Détection améliorée des erreurs de connexion
    const isConnectionError = 
      errorCode === 'functions/unavailable' || 
      errorCode === 'internal' || 
      errorCode === 'unavailable' ||
      errorCode === 'functions/not-found' ||
      errorCode === 'NOT_FOUND' || // ✅ Erreur fonction non trouvée (émulateurs non redémarrés)
      errorCode === 'functions/deadline-exceeded' ||
      (errorCode === 'UNKNOWN' && errorMessage.includes('objet vide')) ||
      errorMessage.toLowerCase().includes('econnrefused') ||
      errorMessage.toLowerCase().includes('failed to fetch') ||
      errorMessage.toLowerCase().includes('networkerror') ||
      errorMessage.toLowerCase().includes('network request failed') ||
      errorMessage.toLowerCase().includes('fetch failed') ||
      errorMessage.toLowerCase().includes('connection') ||
      errorMessage.toLowerCase().includes('timeout') ||
      errorMessage.toLowerCase().includes('ressource non trouvée') || // ✅ Message français
      errorMessage.toLowerCase().includes('not found') || // ✅ Message anglais
      (errorCode === 'UNKNOWN' && errorMessage === 'Erreur inconnue');

    // ✅ Logger uniquement les erreurs non-connexion (respect règles Agentova)
    if (!isConnectionError) {
      console.error(`Erreur appel Firebase ${functionName}:`, {
        code: errorCode,
        message: errorMessage,
        details: errorDetails
      });
    }
    // ✅ Les erreurs de connexion sont gérées silencieusement avec mode mock

    if (isConnectionError) {
      // ✅ Mode silencieux pour les erreurs de connexion (mode demo)
      
      // ✅ Retourner une réponse mock adaptée selon la fonction appelée
      if (functionName === 'getTexts') {
        return {
          success: true,
          texts: [],
          workspace_tokens: MOCK_WORKSPACE_TOKENS
        } as T;
      }
      
      if (functionName === 'createText') {
        // ✅ Mode mock pour createText en cas d'erreur de connexion
        const title = data?.title || 'Sans titre';
        const content = data?.content || 'Texte créé en mode mock (émulateurs non disponibles)';
        
        return {
          success: true,
          text: {
            id: `mock-${Date.now()}`,
            workspace_id: workspaceId,
            title: title,
            content: content,
            created_by: 'demo-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          workspace_tokens: MOCK_WORKSPACE_TOKENS
        } as T;
      }
      
      if (functionName === 'updateText') {
        // ✅ Mode mock pour updateText en cas d'erreur de connexion
        const title = data?.title || 'Texte mis à jour (mode mock)';
        const content = data?.content || 'Contenu mis à jour en mode mock (émulateurs non disponibles)';
        const textId = data?.textId || `mock-update-${Date.now()}`;
        
        return {
          success: true,
          text: {
            id: textId,
            workspace_id: workspaceId,
            title: title,
            content: content,
            created_by: 'demo-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          workspace_tokens: MOCK_WORKSPACE_TOKENS
        } as T;
      }
      
      if (functionName === 'deleteText') {
        return {
          success: true,
          deleted: true,
          workspace_tokens: MOCK_WORKSPACE_TOKENS
        } as T;
      }
      
      // Pour les autres fonctions, retourner une réponse générique
      return {
        success: true,
        data: null,
        workspace_tokens: MOCK_WORKSPACE_TOKENS
      } as T;
    }

    // ✅ Re-throw avec structure améliorée
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).code = errorCode;
    (enhancedError as any).details = errorDetails;
    (enhancedError as any).originalError = error;
    (enhancedError as any).functionName = functionName;
    throw enhancedError;
  }
}

/**
 * Appelle une fonction Firebase avec SSE
 * 🔧 VERSION DEMO - SIMULATION SIMPLE
 */
export async function callSecuredSSEFunction(
  functionName: string,
  workspaceId: string,
  data?: any
): Promise<Response> {
  // 🔧 FONCTION VIDE - Simuler un appel SSE simple
  return await fetch(`${SERVICE_URL.FASTAPI}/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workspace_id: workspaceId,
      ...data
    })
  });
}


/**
 * Déconnecte l'utilisateur
 * 🔧 VERSION DEMO - FONCTION VIDE
 */
export async function logoutUser(): Promise<void> {
  // 🔧 FONCTION VIDE - Ne fait rien
}

/**
 * Nettoie tout le cache de l'application
 * 🔧 VERSION DEMO - FONCTION VIDE
 */
export function clearAllCache(): void {
  // 🔧 FONCTION VIDE - Ne fait rien
}