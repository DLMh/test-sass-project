import { CreateCommentType, CommentType } from '../../../../shared/types.js';

export interface CommentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valide les données de création d'un commentaire
 * Accepte CreateCommentType ou un objet partiel avec au minimum text_id et content
 */
export function validateCommentData(data: CreateCommentType | { text_id: string; content: string }): CommentValidationResult {
  const result: CommentValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // ✅ Validation text_id obligatoire
  if (!data.text_id || data.text_id.trim().length === 0) {
    result.errors.push('Le texte associé est requis');
    result.valid = false;
  }

  // ✅ Validation contenu obligatoire
  if (!data.content || data.content.trim().length === 0) {
    result.errors.push('Le contenu est requis');
    result.valid = false;
  }

  // ✅ Validation longueur contenu (plus court que texte)
  if (data.content && data.content.length > 500) {
    result.errors.push('Le commentaire ne peut dépasser 500 caractères');
    result.valid = false;
  }

  // ✅ Avertissement pour contenu court
  if (data.content && data.content.trim().length < 3) {
    result.warnings.push('Le commentaire est très court');
  }

  return result;
}

/**
 * Valide les données de mise à jour d'un commentaire
 */
export function validateCommentUpdate(
  existingComment: CommentType,
  updateData: Partial<CommentType>
): CommentValidationResult {
  const result: CommentValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // ✅ Ne pas permettre de changer le workspace
  if (updateData.workspace_id && updateData.workspace_id !== existingComment.workspace_id) {
    result.errors.push('Impossible de changer le workspace d\'un commentaire');
    result.valid = false;
  }

  // ✅ Ne pas permettre de changer le text_id
  if (updateData.text_id && updateData.text_id !== existingComment.text_id) {
    result.errors.push('Impossible de changer le texte associé d\'un commentaire');
    result.valid = false;
  }

  // ✅ Validation longueur contenu si présent
  if (updateData.content && updateData.content.length > 500) {
    result.errors.push('Le commentaire ne peut dépasser 500 caractères');
    result.valid = false;
  }

  return result;
}

