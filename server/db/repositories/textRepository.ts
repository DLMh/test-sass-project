import { getPool, MockPool } from '../config.js';
import { TextType, CreateTextType } from '../../../shared/types.js';

/**
 * Repository pour la gestion des textes
 * Mode test : Utilise un stockage en mémoire (simulé)
 */

export class TextRepository {
  private pool: MockPool;

  constructor() {
    this.pool = getPool(); // ✅ Pool en mémoire (simulé)
  }

  // ✅ Méthodes avec isolation workspace
  async getByWorkspace(workspaceId: string): Promise<TextType[]> {
    const result = await this.pool.query<TextType>(
      `SELECT id, workspace_id, title, content, created_by, created_at, updated_at 
       FROM texts 
       WHERE workspace_id = $1 
       ORDER BY created_at DESC`,
      [workspaceId] // ✅ Paramètres préparés
    );
    return result.rows;
  }

  // ✅ TOUJOURS récupérer avec workspace pour sécurité
  async getById(id: string, workspaceId: string): Promise<TextType | null> {
    const result = await this.pool.query<TextType>(
      `SELECT id, workspace_id, title, content, created_by, created_at, updated_at 
       FROM texts 
       WHERE id = $1 AND workspace_id = $2`,
      [id, workspaceId]
    );
    return result.rows[0] || null;
  }

  async create(workspaceId: string, data: CreateTextType): Promise<TextType> {
    const result = await this.pool.query<TextType>(
      `INSERT INTO texts (workspace_id, title, content, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, workspace_id, title, content, created_by, created_at, updated_at`,
      [workspaceId, data.title, data.content, data.created_by]
    );
    return result.rows[0];
  }

  async update(id: string, workspaceId: string, data: Partial<CreateTextType>): Promise<TextType | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.content !== undefined) {
      fields.push(`content = $${paramIndex++}`);
      values.push(data.content);
    }

    if (fields.length === 0) {
      return this.getById(id, workspaceId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id, workspaceId);

    const result = await this.pool.query<TextType>(
      `UPDATE texts 
       SET ${fields.join(', ')} 
       WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex++}
       RETURNING id, workspace_id, title, content, created_by, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: string, workspaceId: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM texts WHERE id = $1 AND workspace_id = $2',
      [id, workspaceId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  async count(workspaceId: string): Promise<number> {
    const result = await this.pool.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM texts WHERE workspace_id = $1',
      [workspaceId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}

// ✅ Singleton avec lazy initialization
let textRepo: TextRepository | undefined;

export function getTextRepository(): TextRepository {
  if (!textRepo) {
    textRepo = new TextRepository();
  }
  return textRepo;
}
