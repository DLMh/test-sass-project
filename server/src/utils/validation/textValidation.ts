import { CreateTextType, TextType } from '../../../../shared/types.js';

export interface TextValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valide les données de création d'un texte
 * Accepte CreateTextType ou un objet partiel avec au minimum content
 */
export function validateTextData(data: CreateTextType | { title?: string | null; content: string }): TextValidationResult {
  const result: TextValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Validation contenu obligatoire
  if (!data.content || data.content.trim().length === 0) {
    result.errors.push('Le contenu est requis');
    result.valid = false;
  }

  // Validation longueur contenu
  if (data.content && data.content.length > 1000) {
    result.errors.push('Le contenu ne peut dépasser 1000 caractères');
    result.valid = false;
  }

  // Validation titre optionnel
  if (data.title && data.title.length > 200) {
    result.errors.push('Le titre ne peut dépasser 200 caractères');
    result.valid = false;
  }

  // Avertissement pour contenu court
  if (data.content && data.content.trim().length < 10) {
    result.warnings.push('Le contenu est très court');
  }

  return result;
}

/**
 * Valide les données de mise à jour d'un texte
 */
export function validateTextUpdate(
  existingText: TextType,
  updateData: Partial<TextType>
): TextValidationResult {
  const result: TextValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Ne pas permettre de changer le workspace
  if (updateData.workspace_id && updateData.workspace_id !== existingText.workspace_id) {
    result.errors.push('Impossible de changer le workspace d\'un texte');
    result.valid = false;
  }

  // Validation longueur contenu si présent
  if (updateData.content && updateData.content.length > 1000) {
    result.errors.push('Le contenu ne peut dépasser 1000 caractères');
    result.valid = false;
  }

  // Validation titre si présent
  if (updateData.title && updateData.title.length > 200) {
    result.errors.push('Le titre ne peut dépasser 200 caractères');
    result.valid = false;
  }

  return result;
}

