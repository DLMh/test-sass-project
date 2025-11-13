/**
 * Configuration de la base de données
 * 
 * MODE TEST : Stockage en mémoire (simulé)
 * Conforme à l'architecture du test : db/repositories/ = "Accès données (simulé en mémoire)"
 */

// Interface mock pour simuler le comportement PostgreSQL
export interface MockPool {
  query<T = any>(text: string, params?: any[]): Promise<MockQueryResult<T>>;
}

export interface MockQueryResult<T = any> {
  rows: T[];
  rowCount: number | null;
}

// Stockage en mémoire global (simule une base de données)
const inMemoryStorage: Map<string, any[]> = new Map();

/**
 * Obtient le stockage en mémoire pour une table donnée
 */
function getTableStorage(tableName: string): any[] {
  if (!inMemoryStorage.has(tableName)) {
    inMemoryStorage.set(tableName, []);
  }
  return inMemoryStorage.get(tableName)!;
}

/**
 * Mock Pool qui simule PostgreSQL avec stockage en mémoire
 */
class InMemoryPool implements MockPool {
  async query<T = any>(text: string, params?: any[]): Promise<MockQueryResult<T>> {
    // Parser SQL simple pour le mode test
    const sql = text.trim().toUpperCase();
    
    // SELECT queries
    if (sql.startsWith('SELECT')) {
      return this.handleSelect<T>(text, params || []);
    }
    
    // INSERT queries
    if (sql.startsWith('INSERT')) {
      return this.handleInsert<T>(text, params || []);
    }
    
    // UPDATE queries
    if (sql.startsWith('UPDATE')) {
      return this.handleUpdate<T>(text, params || []);
    }
    
    // DELETE queries
    if (sql.startsWith('DELETE')) {
      return this.handleDelete(text, params || []);
    }
    
    // COUNT queries
    if (sql.includes('COUNT(*)')) {
      return this.handleCount(text, params || []);
    }
    
    // Par défaut, retourner un résultat vide
    return { rows: [], rowCount: 0 };
  }
  
  private handleSelect<T>(sql: string, params: any[]): MockQueryResult<T> {
    // Parser simple pour SELECT ... FROM texts WHERE workspace_id = $1
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) {
      return { rows: [], rowCount: 0 };
    }
    
    const tableName = tableMatch[1].toLowerCase();
    const storage = getTableStorage(tableName);
    
    let filtered = [...storage];
    
    // Filtrage WHERE workspace_id = $1
    if (sql.includes('workspace_id = $1') && params[0]) {
      filtered = filtered.filter((item: any) => item.workspace_id === params[0]);
    }
    
    // Filtrage WHERE id = $1 AND workspace_id = $2
    if (sql.includes('id = $1') && sql.includes('workspace_id = $2') && params[0] && params[1]) {
      filtered = filtered.filter((item: any) => 
        item.id === params[0] && item.workspace_id === params[1]
      );
    }
    
    // Tri ORDER BY created_at DESC
    if (sql.includes('ORDER BY created_at DESC')) {
      filtered.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
    }
    
    return {
      rows: filtered as T[],
      rowCount: filtered.length
    };
  }
  
  private handleInsert<T>(sql: string, params: any[]): MockQueryResult<T> {
    // Parser simple pour INSERT INTO texts (...) VALUES (...) RETURNING *
    const tableMatch = sql.match(/INTO\s+(\w+)/i);
    if (!tableMatch) {
      return { rows: [], rowCount: 0 };
    }
    
    const tableName = tableMatch[1].toLowerCase();
    const storage = getTableStorage(tableName);
    
    // Générer un ID unique
    const id = `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    // Créer l'objet selon l'ordre des paramètres
    // INSERT INTO texts (workspace_id, title, content, created_by, created_at, updated_at)
    // VALUES ($1, $2, $3, $4, NOW(), NOW())
    const newItem: any = {
      id,
      workspace_id: params[0],
      title: params[1] || null,
      content: params[2] || null,
      created_by: params[3] || null,
      created_at: now,
      updated_at: now
    };
    
    storage.push(newItem);
    
    return {
      rows: [newItem as T],
      rowCount: 1
    };
  }
  
  private handleUpdate<T>(sql: string, params: any[]): MockQueryResult<T> {
    // Parser simple pour UPDATE texts SET ... WHERE id = $X AND workspace_id = $Y
    const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch) {
      return { rows: [], rowCount: 0 };
    }
    
    const tableName = tableMatch[1].toLowerCase();
    const storage = getTableStorage(tableName);
    
    // Extraire WHERE id = $X AND workspace_id = $Y
    // Les deux derniers paramètres sont toujours id et workspace_id
    const id = params[params.length - 2];
    const workspaceId = params[params.length - 1];
    
    const itemIndex = storage.findIndex((item: any) => 
      item.id === id && item.workspace_id === workspaceId
    );
    
    if (itemIndex === -1) {
      return { rows: [], rowCount: 0 };
    }
    
    // Mettre à jour les champs dynamiquement
    // Les paramètres avant les 2 derniers sont les valeurs à mettre à jour
    const item = storage[itemIndex];
    
    // Parser les champs SET dynamiquement
    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
    if (setMatch) {
      const setClause = setMatch[1];
      const fieldMatches = setClause.matchAll(/(\w+)\s*=\s*\$(\d+)/g);
      
      for (const match of fieldMatches) {
        const fieldName = match[1];
        const paramNum = parseInt(match[2], 10);
        
        // Ignorer updated_at (géré séparément) et les paramètres id/workspace_id
        if (fieldName !== 'updated_at' && paramNum <= params.length - 2) {
          item[fieldName] = params[paramNum - 1]; // Les paramètres sont 1-indexed dans SQL
        }
      }
    } else {
      // Fallback : parser simple si le regex ne fonctionne pas
      if (sql.includes('title = $')) {
        // Trouver le numéro du paramètre pour title
        const titleMatch = sql.match(/title\s*=\s*\$(\d+)/);
        if (titleMatch) {
          const paramNum = parseInt(titleMatch[1], 10);
          if (paramNum <= params.length - 2) {
            item.title = params[paramNum - 1];
          }
        }
      }
      if (sql.includes('content = $')) {
        const contentMatch = sql.match(/content\s*=\s*\$(\d+)/);
        if (contentMatch) {
          const paramNum = parseInt(contentMatch[1], 10);
          if (paramNum <= params.length - 2) {
            item.content = params[paramNum - 1];
          }
        }
      }
    }
    
    // Toujours mettre à jour updated_at
    item.updated_at = new Date();
    
    return {
      rows: [item as T],
      rowCount: 1
    };
  }
  
  private handleDelete(sql: string, params: any[]): MockQueryResult {
    // Parser simple pour DELETE FROM texts WHERE id = $1 AND workspace_id = $2
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) {
      return { rows: [], rowCount: 0 };
    }
    
    const tableName = tableMatch[1].toLowerCase();
    const storage = getTableStorage(tableName);
    
    const id = params[0];
    const workspaceId = params[1];
    
    const itemIndex = storage.findIndex((item: any) => 
      item.id === id && item.workspace_id === workspaceId
    );
    
    if (itemIndex === -1) {
      return { rows: [], rowCount: 0 };
    }
    
    storage.splice(itemIndex, 1);
    
    return {
      rows: [],
      rowCount: 1
    };
  }
  
  private handleCount<T>(sql: string, params: any[]): MockQueryResult<T> {
    // Parser simple pour SELECT COUNT(*) as count FROM texts WHERE workspace_id = $1
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) {
      return { rows: [{ count: '0' }] as any, rowCount: 1 };
    }
    
    const tableName = tableMatch[1].toLowerCase();
    const storage = getTableStorage(tableName);
    
    let filtered = [...storage];
    
    if (sql.includes('workspace_id = $1') && params[0]) {
      filtered = filtered.filter((item: any) => item.workspace_id === params[0]);
    }
    
    return {
      rows: [{ count: filtered.length.toString() }] as any,
      rowCount: 1
    };
  }
}

// Instance singleton du pool en mémoire
let pool: MockPool | undefined;

/**
 * Obtient le pool de connexion (mock en mémoire pour le test)
 * Conforme à l'architecture : "Accès données (simulé en mémoire)"
 */
export function getPool(): MockPool {
  if (!pool) {
    pool = new InMemoryPool();
  }
  return pool;
}

/**
 * Fonction utilitaire pour réinitialiser le stockage (utile pour les tests)
 */
export function clearInMemoryStorage(): void {
  inMemoryStorage.clear();
}

// Export par défaut pour la compatibilité
export default {
  getPool
}; 