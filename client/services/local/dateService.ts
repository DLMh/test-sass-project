/**
 * Service de gestion des dates
 * Conforme aux règles Agentova : centralisation du formatage des dates
 */

export class DateService {
  /**
   * Formate une date pour l'affichage dans le chat
   */
  static formatChatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diff / 60000);
    const diffInHours = Math.floor(diff / 3600000);
    const diffInDays = Math.floor(diff / 86400000);

    // Aujourd'hui : afficher l'heure
    if (diffInDays === 0) {
      if (diffInMinutes < 1) {
        return 'À l\'instant';
      } else if (diffInMinutes < 60) {
        return `Il y a ${diffInMinutes} min`;
      } else {
        return `Il y a ${diffInHours}h`;
      }
    }

    // Hier
    if (diffInDays === 1) {
      return 'Hier';
    }

    // Cette semaine
    if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    }

    // Format complet
    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  /**
   * Formate une date pour l'affichage de session
   */
  static formatSessionDate(date: Date | string, showTime: boolean = false): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    };

    if (showTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return dateObj.toLocaleDateString('fr-FR', options);
  }

  /**
   * Formate une date pour l'affichage simple (date + heure)
   */
  static formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Formate "Il y a X temps"
   */
  static formatTimeSince(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const diffInSeconds = Math.floor(diff / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else {
      return this.formatChatDate(dateObj);
    }
  }

  /**
   * Convertit GMT vers local
   */
  static convertGMTToLocal(gmtTime: string): Date {
    return new Date(gmtTime);
  }

  /**
   * Convertit local vers GMT
   */
  static convertLocalToGMT(localTime: Date): string {
    return localTime.toISOString();
  }

  /**
   * Normalise une date à minuit GMT pour le cache
   */
  static normalizeToMidnightGMT(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const normalized = new Date(Date.UTC(
      dateObj.getUTCFullYear(),
      dateObj.getUTCMonth(),
      dateObj.getUTCDate(),
      0, 0, 0, 0
    ));
    return normalized.toISOString();
  }
}

