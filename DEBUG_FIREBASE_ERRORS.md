# 🔍 Guide de Débogage des Erreurs Firebase

## 📋 Problème : Erreur Firebase avec objet vide `{}`

Si vous voyez `❌ Erreur appel Firebase getTexts: {}`, cela signifie que l'erreur Firebase n'a pas pu être correctement extraite.

## ✅ Solutions Appliquées

### 1. Logging Détaillé Immédiat

Le code logue maintenant **immédiatement** l'erreur brute avant toute extraction :

```typescript
console.log(`🔍 [DEBUG] Erreur brute Firebase ${functionName}:`, {
  error,
  errorType: typeof error,
  errorConstructor: error?.constructor?.name,
  hasCode: 'code' in error,
  hasMessage: 'message' in error,
  enumerableKeys: Object.keys(error || {}),
  allPropertyNames: Object.getOwnPropertyNames(error),
  // ... et plus
});
```

### 2. Extraction Améliorée

- Utilise `Object.getOwnPropertyNames()` pour capturer les propriétés non-enumerable
- Accède directement aux propriétés avec `'code' in error` et `error['code']`
- Gère les objets vides et les erreurs circulaires

### 3. Sérialisation Complète

Tente de sérialiser l'erreur complète avec gestion des références circulaires.

## 🧪 Tester avec Firebase Emulator

### Étape 1 : Démarrer les Émulateurs

```bash
# Depuis la racine du projet
scripts\start-server.bat
```

Ou manuellement :

```bash
cd server
npm install
npm run build
cd ..
npx firebase-tools emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

### Étape 2 : Vérifier que les Émulateurs sont Démarrés

Ouvrez dans votre navigateur :
- **UI Emulator** : http://localhost:4000
- **Functions** : http://127.0.0.1:5001
- **Auth** : http://127.0.0.1:9099

### Étape 3 : Vérifier la Configuration Client

Le fichier `client/services/api/firebase/config.ts` doit être configuré pour utiliser les émulateurs :

```typescript
// Connexion Functions Emulator
connectFunctionsEmulator(functions, '127.0.0.1', 5001);
```

### Étape 4 : Tester l'Appel

1. Ouvrez la console du navigateur (F12)
2. Appelez `TextService.getTexts(workspaceId)`
3. Regardez les logs `🔍 [DEBUG]` pour voir l'erreur brute

## 🔍 Analyser les Logs

### Logs à Vérifier

1. **`🔍 [DEBUG] Erreur brute Firebase`** : Erreur brute avant extraction
2. **`❌ Erreur appel Firebase`** : Erreur extraite avec tous les détails
3. **`📦 Réponse brute Firebase`** : Réponse reçue (si succès)

### Informations Clés

- `errorConstructor` : Type de l'erreur (FirebaseError, Error, etc.)
- `hasCode` / `hasMessage` : Si les propriétés existent
- `allPropertyNames` : Toutes les propriétés (même non-enumerable)
- `errorSerialized` : Tentative de sérialisation complète

## 🐛 Causes Possibles

### 1. Émulateurs Non Démarrés

**Symptôme** : `errorCode: 'internal'` ou `ECONNREFUSED`

**Solution** : Démarrer les émulateurs avec `scripts\start-server.bat`

### 2. Port Occupé

**Symptôme** : Erreur au démarrage des émulateurs

**Solution** :
```bash
# Vérifier les ports
netstat -an | findstr "5001"
netstat -an | findstr "9099"

# Tuer le processus si nécessaire
taskkill /F /PID <PID>
```

### 3. Configuration Incorrecte

**Symptôme** : Erreur `functions/not-found`

**Solution** : Vérifier que la fonction est bien exportée dans `server/src/index.ts`

### 4. Erreur Serveur

**Symptôme** : Erreur dans les logs serveur

**Solution** : Vérifier les logs des émulateurs dans le terminal

## 📊 Structure des Erreurs Firebase

### FirebaseError Standard

```typescript
{
  code: 'functions/internal' | 'functions/unavailable' | etc.,
  message: 'Message d\'erreur',
  details: { ... },
  customData: { ... },
  stack: '...'
}
```

### Erreur Interne (objet vide possible)

Parfois, Firebase retourne une erreur avec des propriétés non-enumerable. Le code amélioré les capture maintenant.

## ✅ Vérifications

### Checklist

- [ ] Émulateurs démarrés (`scripts\start-server.bat`)
- [ ] Ports 5001 et 9099 disponibles
- [ ] Configuration Firebase correcte dans `config.ts`
- [ ] Fonction exportée dans `server/src/index.ts`
- [ ] Logs `🔍 [DEBUG]` visibles dans la console
- [ ] Pas d'erreurs dans les logs serveur

### Commandes Utiles

```bash
# Vérifier les ports
netstat -an | findstr "5001"
netstat -an | findstr "9099"

# Vérifier les processus Node
tasklist | findstr "node"

# Nettoyer et redémarrer
cd server
npm run build
cd ..
scripts\start-server.bat
```

## 🎯 Résultat Attendu

Après les améliorations, vous devriez voir :

1. **Log détaillé** de l'erreur brute avec toutes les propriétés
2. **Extraction complète** même pour les objets vides
3. **Sérialisation** de l'erreur complète pour debug
4. **Gestion gracieuse** des erreurs de connexion (mode mock)

Si l'erreur persiste, les logs `🔍 [DEBUG]` vous donneront toutes les informations nécessaires pour identifier le problème exact.

