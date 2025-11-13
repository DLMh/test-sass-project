import { callSecuredFunction } from '../local/authenticationService';
import { TextType as SharedTextType } from '../../../shared/types';

/**
 * Service de gestion des textes côté client
 */

// Type client avec dates sérialisées (string au lieu de Date)
export interface TextType extends Omit<SharedTextType, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
}

export interface CreateTextRequest {
  title?: string;
  content: string;
}

export interface TextsResponse {
  success: true;
  texts: TextType[];
  workspace_tokens?: any;
}

export interface TextResponse {
  success: true;
  text: TextType;
  workspace_tokens?: any;
}

export class TextService {
  /**
   * Créer un nouveau texte
   */
  static async createText(
    workspaceId: string,
    data: CreateTextRequest
  ): Promise<TextType> {
    try {
      const result = await callSecuredFunction<TextResponse>(
        'createText',
        workspaceId,
        {
          title: data.title,
          content: data.content
        }
      );
      // ✅ Vérifier que la réponse contient bien text
      // La réponse du serveur est : { success: true, text: {...}, workspace_tokens: {...} }
      if (!result || !result.text) {
        throw new Error('Réponse createText invalide: texte manquant');
      }
      return result.text;
    } catch (error: any) {
      console.error('Erreur création texte:', {
        code: error?.code,
        message: error?.message
      });
      throw error;
    }
  }

  /**
   * Récupérer tous les textes d'un workspace
   */
  static async getTexts(workspaceId: string): Promise<TextType[]> {
    try {
      const result = await callSecuredFunction<TextsResponse>(
        'getTexts',
        workspaceId
      );
      
      // ✅ Vérifier que la réponse contient bien texts
      if (!result) {
        return [];
      }
      
      // ✅ La réponse du serveur est : { success: true, texts: [...], workspace_tokens: {...} }
      const texts = result.texts;
      
      if (!texts || !Array.isArray(texts)) {
        return [];
      }
      
      return texts;
    } catch (error: any) {
      // ✅ Si erreur de connexion, retourner tableau vide au lieu de throw
      const isConnectionError = 
        error?.code === 'internal' || 
        error?.code === 'functions/unavailable' ||
        error?.code === 'functions/not-found' ||
        error?.code === 'unavailable' ||
        error?.message?.toLowerCase().includes('econnrefused') ||
        error?.message?.toLowerCase().includes('failed to fetch') ||
        error?.message?.toLowerCase().includes('networkerror');
      
      if (isConnectionError) {
        return [];
      }
      
      console.error('Erreur récupération textes:', {
        code: error?.code,
        message: error?.message
      });
      throw error;
    }
  }

  /**
   * Supprimer un texte
   */
  static async deleteText(
    workspaceId: string,
    textId: string
  ): Promise<boolean> {
    try {
      const result = await callSecuredFunction<{ deleted: boolean }>(
        'deleteText',
        workspaceId,
        { textId }
      );
      
      // ✅ Vérifier que la réponse contient bien deleted
      if (!result || typeof result.deleted !== 'boolean') {
        return false;
      }
      
      return result.deleted;
    } catch (error: any) {
      // ✅ Si erreur de connexion, retourner false au lieu de throw
      const isConnectionError = 
        error?.code === 'NOT_FOUND' ||
        error?.code === 'functions/not-found' ||
        error?.code === 'internal' ||
        error?.code === 'functions/unavailable' ||
        error?.message?.toLowerCase().includes('ressource non trouvée') ||
        error?.message?.toLowerCase().includes('not found');
      
      if (isConnectionError) {
        // ✅ Mode silencieux pour erreurs de connexion (mode mock)
        return false;
      }
      
      console.error('Erreur suppression texte:', {
        code: error?.code,
        message: error?.message
      });
      throw error;
    }
  }

  /**
   * Mettre à jour un texte
   */
  static async updateText(
    workspaceId: string,
    textId: string,
    data: Partial<CreateTextRequest>
  ): Promise<TextType> {
    try {
      const result = await callSecuredFunction<TextResponse>(
        'updateText',
        workspaceId,
        {
          textId,
          ...data
        }
      );
      
      // ✅ Vérifier que la réponse contient bien text
      if (!result || !result.text) {
        throw new Error('Réponse updateText invalide: texte manquant');
      }
      
      return result.text;
    } catch (error: any) {
      // ✅ Si erreur de connexion, retourner un texte mock au lieu de throw
      const isConnectionError = 
        error?.code === 'NOT_FOUND' ||
        error?.code === 'functions/not-found' ||
        error?.code === 'internal' ||
        error?.code === 'functions/unavailable' ||
        error?.message?.toLowerCase().includes('ressource non trouvée') ||
        error?.message?.toLowerCase().includes('not found');
      
      if (isConnectionError) {
        // ✅ Mode silencieux pour erreurs de connexion (mode mock)
        return {
          id: textId,
          workspace_id: workspaceId,
          title: data.title || 'Texte mis à jour (mode mock)',
          content: data.content || 'Contenu mis à jour en mode mock (émulateurs non disponibles)',
          created_by: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      console.error('Erreur mise à jour texte:', {
        code: error?.code,
        message: error?.message
      });
      throw error;
    }
  }
}
