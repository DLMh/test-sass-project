import { onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import { validateAuth, verifyWorkspaceToken, isValidWorkspaceToken } from '../utils/authWorkspace.js';
import { validateRequiredFields, isSuccess, handleError } from '../utils/validation.js';
import { createResponseWithTokens } from '../../shared/responses.js';
import { getCommentRepository } from '../../db/repositories/index.js';
import { WORKSPACE_ROLES, CreateCommentType, CommentType } from '../../../shared/types.js';
import { ERRORS, withDetails } from '../../shared/types/errors.js';
import { databaseUrlProd, jwtWorkspaceSecret } from '../main.js';
import { validateCommentData, validateCommentUpdate } from '../utils/validation/commentValidation.js';

/**
 * Service de gestion des commentaires
 */

/**
 * Créer un nouveau commentaire
 */
export const createComment = onCall({
  secrets: [databaseUrlProd, jwtWorkspaceSecret],
  memory: '512MiB',
  timeoutSeconds: 60
}, async (request) => {
  try {
    // ✅ 1. Validation auth OBLIGATOIRE
    const authResponse = validateAuth(request.auth);
    if (!isSuccess(authResponse)) return authResponse;
    const uid = authResponse.user;

    // ✅ 2. Extraction et validation params
    const { workspaceToken, textId, content } = request.data;
    const validationResponse = validateRequiredFields(request.data, [
      'workspaceToken', 'textId', 'content'
    ]);
    if (!isSuccess(validationResponse)) return validationResponse;

    // ✅ 3. Validation workspace + rôles
    const tokenValidation = await verifyWorkspaceToken(
      workspaceToken, 
      uid, 
      WORKSPACE_ROLES.EDITOR // Rôle requis pour créer des commentaires
    );
    const validationResult = isValidWorkspaceToken(tokenValidation);
    if (!isSuccess(validationResult)) return validationResult;
    const { workspace_id, workspace_tokens } = validationResult;
    const response = createResponseWithTokens(workspace_tokens);

    // ✅ 4. Validation métier spécifique
    const commentValidation = validateCommentData({ text_id: textId, content });
    if (!commentValidation.valid) {
      return response.error(withDetails(ERRORS.INVALID_INPUT, {
        message: commentValidation.errors.join(', '),
        errors: commentValidation.errors
      }));
    }

    // ✅ 5. Logique métier via repository
    const commentData: CreateCommentType = {
      text_id: textId,
      content: content.trim(),
      created_by: uid
    };
    
    const newComment = await getCommentRepository().create(workspace_id, commentData);

    // ✅ 6. Logging succès
    logger.info(`Commentaire créé avec succès pour workspace ${workspace_id} par ${uid}`);

    // ✅ 7. Réponse standardisée
    return response.success({ comment: newComment });
    
  } catch (error) {
    logger.error(`Erreur dans createComment:`, error);
    return handleError(error);
  }
});

/**
 * Récupérer tous les commentaires d'un workspace
 */
export const listComments = onCall({
  secrets: [databaseUrlProd, jwtWorkspaceSecret],
  memory: '512MiB',
  timeoutSeconds: 60
}, async (request) => {
  try {
    // ✅ 1. Validation auth OBLIGATOIRE
    const authResponse = validateAuth(request.auth);
    if (!isSuccess(authResponse)) return authResponse;
    const uid = authResponse.user;

    // ✅ 2. Extraction et validation params
    const { workspaceToken } = request.data;
    const validationResponse = validateRequiredFields(request.data, [
      'workspaceToken'
    ]);
    if (!isSuccess(validationResponse)) return validationResponse;

    // ✅ 3. Validation workspace + rôles
    const tokenValidation = await verifyWorkspaceToken(
      workspaceToken, 
      uid, 
      WORKSPACE_ROLES.EDITOR // Rôle requis pour lire les commentaires
    );
    const validationResult = isValidWorkspaceToken(tokenValidation);
    if (!isSuccess(validationResult)) return validationResult;
    const { workspace_id, workspace_tokens } = validationResult;
    const response = createResponseWithTokens(workspace_tokens);

    // ✅ 5. Logique métier via repository
    const comments = await getCommentRepository().getByWorkspace(workspace_id);

    // ✅ 6. Logging succès avec détails
    logger.info(`Commentaires récupérés pour workspace ${workspace_id} par ${uid}`, {
      count: comments.length,
      workspace_id
    });

    // ✅ 7. Réponse standardisée
    return response.success({ comments });
    
  } catch (error) {
    logger.error(`Erreur dans listComments:`, error);
    return handleError(error);
  }
});

/**
 * Récupérer tous les commentaires d'un texte
 */
export const getCommentsByText = onCall({
  secrets: [databaseUrlProd, jwtWorkspaceSecret],
  memory: '512MiB',
  timeoutSeconds: 60
}, async (request) => {
  try {
    // ✅ 1. Validation auth OBLIGATOIRE
    const authResponse = validateAuth(request.auth);
    if (!isSuccess(authResponse)) return authResponse;
    const uid = authResponse.user;

    // ✅ 2. Extraction et validation params
    const { workspaceToken, textId } = request.data;
    const validationResponse = validateRequiredFields(request.data, [
      'workspaceToken', 'textId'
    ]);
    if (!isSuccess(validationResponse)) return validationResponse;

    // ✅ 3. Validation workspace + rôles
    const tokenValidation = await verifyWorkspaceToken(
      workspaceToken, 
      uid, 
      WORKSPACE_ROLES.EDITOR // Rôle requis pour lire les commentaires
    );
    const validationResult = isValidWorkspaceToken(tokenValidation);
    if (!isSuccess(validationResult)) return validationResult;
    const { workspace_id, workspace_tokens } = validationResult;
    const response = createResponseWithTokens(workspace_tokens);

    // ✅ 5. Logique métier via repository
    const comments = await getCommentRepository().getByText(textId, workspace_id);

    // ✅ 6. Logging succès avec détails
    logger.info(`Commentaires récupérés pour texte ${textId} dans workspace ${workspace_id} par ${uid}`, {
      count: comments.length,
      textId,
      workspace_id
    });

    // ✅ 7. Réponse standardisée
    return response.success({ comments });
    
  } catch (error) {
    logger.error(`Erreur dans getCommentsByText:`, error);
    return handleError(error);
  }
});

/**
 * Supprimer un commentaire
 */
export const deleteComment = onCall({
  secrets: [databaseUrlProd, jwtWorkspaceSecret],
  memory: '512MiB',
  timeoutSeconds: 60
}, async (request) => {
  try {
    // ✅ 1. Validation auth OBLIGATOIRE
    const authResponse = validateAuth(request.auth);
    if (!isSuccess(authResponse)) return authResponse;
    const uid = authResponse.user;

    // ✅ 2. Extraction et validation params
    const { workspaceToken, commentId } = request.data;
    const validationResponse = validateRequiredFields(request.data, [
      'workspaceToken', 'commentId'
    ]);
    if (!isSuccess(validationResponse)) return validationResponse;

    // ✅ 3. Validation workspace + rôles
    const tokenValidation = await verifyWorkspaceToken(
      workspaceToken, 
      uid, 
      WORKSPACE_ROLES.ADMIN // Rôle requis pour supprimer des commentaires
    );
    const validationResult = isValidWorkspaceToken(tokenValidation);
    if (!isSuccess(validationResult)) return validationResult;
    const { workspace_id, workspace_tokens } = validationResult;
    const response = createResponseWithTokens(workspace_tokens);

    // ✅ 5. Logique métier via repository
    const deleted = await getCommentRepository().delete(commentId, workspace_id);
    
    if (!deleted) {
      return response.error(withDetails(ERRORS.NOT_FOUND, {
        message: 'Commentaire non trouvé'
      }));
    }

    // ✅ 6. Logging succès
    logger.info(`Commentaire ${commentId} supprimé pour workspace ${workspace_id} par ${uid}`);

    // ✅ 7. Réponse standardisée
    return response.success({ deleted: true });
    
  } catch (error) {
    logger.error(`Erreur dans deleteComment:`, error);
    return handleError(error);
  }
});

/**
 * Mettre à jour un commentaire
 */
export const updateComment = onCall({
  secrets: [databaseUrlProd, jwtWorkspaceSecret],
  memory: '512MiB',
  timeoutSeconds: 60
}, async (request) => {
  try {
    // ✅ 1. Validation auth OBLIGATOIRE
    const authResponse = validateAuth(request.auth);
    if (!isSuccess(authResponse)) return authResponse;
    const uid = authResponse.user;

    // ✅ 2. Extraction et validation params
    const { workspaceToken, commentId, content } = request.data;
    const validationResponse = validateRequiredFields(request.data, [
      'workspaceToken', 'commentId'
    ]);
    if (!isSuccess(validationResponse)) return validationResponse;

    // ✅ 3. Validation workspace + rôles
    const tokenValidation = await verifyWorkspaceToken(
      workspaceToken, 
      uid, 
      WORKSPACE_ROLES.EDITOR // Rôle requis pour modifier des commentaires
    );
    const validationResult = isValidWorkspaceToken(tokenValidation);
    if (!isSuccess(validationResult)) return validationResult;
    const { workspace_id, workspace_tokens } = validationResult;
    const response = createResponseWithTokens(workspace_tokens);

    // ✅ 4. Vérifier que le commentaire existe
    const existingComment = await getCommentRepository().getById(commentId, workspace_id);
    if (!existingComment) {
      return response.error(withDetails(ERRORS.NOT_FOUND, {
        message: 'Commentaire non trouvé'
      }));
    }

    // ✅ 5. Validation métier spécifique
    const updateData: Partial<CommentType> = {};
    if (content !== undefined) updateData.content = content.trim();

    if (Object.keys(updateData).length === 0) {
      return response.error(withDetails(ERRORS.INVALID_INPUT, {
        message: 'Aucune donnée à mettre à jour'
      }));
    }

    const commentValidation = validateCommentUpdate(existingComment, updateData);
    if (!commentValidation.valid) {
      return response.error(withDetails(ERRORS.INVALID_INPUT, {
        message: commentValidation.errors.join(', '),
        errors: commentValidation.errors
      }));
    }

    // ✅ 6. Logique métier via repository
    // Extraire uniquement les champs modifiables (content) pour le repository
    const repositoryUpdateData: Partial<CreateCommentType> = {};
    if (updateData.content !== undefined) repositoryUpdateData.content = updateData.content;
    
    const updatedComment = await getCommentRepository().update(
      commentId, 
      workspace_id, 
      repositoryUpdateData
    );

    if (!updatedComment) {
      return response.error(withDetails(ERRORS.NOT_FOUND, {
        message: 'Commentaire non trouvé'
      }));
    }

    // ✅ 7. Logging succès
    logger.info(`Commentaire ${commentId} mis à jour pour workspace ${workspace_id} par ${uid}`);

    // ✅ 8. Réponse standardisée
    return response.success({ comment: updatedComment });
    
  } catch (error) {
    logger.error(`Erreur dans updateComment:`, error);
    return handleError(error);
  }
});

