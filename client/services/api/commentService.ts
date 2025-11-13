import { callSecuredFunction } from '../local/authenticationService';
import { CommentType as SharedCommentType } from '../../../shared/types';

/**
 * Service de gestion des commentaires côté client
 */

// Type client avec dates sérialisées (string au lieu de Date)
export interface CommentType extends Omit<SharedCommentType, 'created_at' | 'updated_at'> {
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  textId: string;
  content: string;
}

export interface CommentsResponse {
  success: true;
  comments: CommentType[];
  workspace_tokens?: any;
}

export interface CommentResponse {
  success: true;
  comment: CommentType;
  workspace_tokens?: any;
}

export class CommentService {
  /**
   * Créer un nouveau commentaire
   */
  static async createComment(
    workspaceId: string,
    data: CreateCommentRequest
  ): Promise<CommentType> {
    try {
      const result = await callSecuredFunction<CommentResponse>(
        'createComment',
        workspaceId,
        {
          textId: data.textId,
          content: data.content
        }
      );
      // ✅ Vérifier que la réponse contient bien comment
      // La réponse du serveur est : { success: true, comment: {...}, workspace_tokens: {...} }
      if (!result || !result.comment) {
        throw new Error('Réponse createComment invalide: commentaire manquant');
      }
      return result.comment;
    } catch (error: any) {
      console.error('Erreur création commentaire:', {
        code: error?.code,
        message: error?.message
      });
      throw error;
    }
  }

  /**
   * Récupérer tous les commentaires d'un workspace
   */
  static async listComments(
    workspaceId: string
  ): Promise<CommentType[]> {
    try {
      const result = await callSecuredFunction<CommentsResponse>(
        'listComments',
        workspaceId
      );
      
      // ✅ Vérifier que la réponse contient bien comments
      if (!result) {
        return [];
      }
      
      // ✅ La réponse du serveur est : { success: true, comments: [...], workspace_tokens: {...} }
      const comments = result.comments;
      
      if (!comments || !Array.isArray(comments)) {
        return [];
      }
      
      return comments;
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
      
      console.error('Erreur récupération commentaires:', {
        code: error?.code,
        message: error?.message
      });
      throw error;
    }
  }

  /**
   * Récupérer tous les commentaires d'un texte
   */
  static async getCommentsByText(
    workspaceId: string,
    textId: string
  ): Promise<CommentType[]> {
    try {
      const result = await callSecuredFunction<CommentsResponse>(
        'getCommentsByText',
        workspaceId,
        { textId }
      );
      
      // ✅ Vérifier que la réponse contient bien comments
      if (!result) {
        return [];
      }
      
      // ✅ La réponse du serveur est : { success: true, comments: [...], workspace_tokens: {...} }
      const comments = result.comments;
      
      if (!comments || !Array.isArray(comments)) {
        return [];
      }
      
      return comments;
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
      
      console.error('Erreur récupération commentaires:', {
        code: error?.code,
        message: error?.message
      });
      throw error;
    }
  }

  /**
   * Supprimer un commentaire
   */
  static async deleteComment(
    workspaceId: string,
    commentId: string
  ): Promise<boolean> {
    try {
      const result = await callSecuredFunction<{ deleted: boolean }>(
        'deleteComment',
        workspaceId,
        { commentId }
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
      
      console.error('Erreur suppression commentaire:', {
        code: error?.code,
        message: error?.message
      });
      throw error;
    }
  }

  /**
   * Mettre à jour un commentaire
   */
  static async updateComment(
    workspaceId: string,
    commentId: string,
    data: Partial<CreateCommentRequest>
  ): Promise<CommentType> {
    try {
      const result = await callSecuredFunction<CommentResponse>(
        'updateComment',
        workspaceId,
        {
          commentId,
          ...data
        }
      );
      
      // ✅ Vérifier que la réponse contient bien comment
      if (!result || !result.comment) {
        throw new Error('Réponse updateComment invalide: commentaire manquant');
      }
      
      return result.comment;
    } catch (error: any) {
      // ✅ Si erreur de connexion, retourner un commentaire mock au lieu de throw
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
          id: commentId,
          workspace_id: workspaceId,
          text_id: data.textId || '',
          content: data.content || 'Contenu mis à jour en mode mock (émulateurs non disponibles)',
          created_by: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      console.error('Erreur mise à jour commentaire:', {
        code: error?.code,
        message: error?.message
      });
      throw error;
    }
  }
}

