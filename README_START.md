# 🚀 Guide de Démarrage du Serveur

## ⚠️ Problème PowerShell sur Windows

Si vous rencontrez l'erreur de politique d'exécution PowerShell, utilisez une des solutions ci-dessous.

## ✅ Solution 1 : Script Batch (Recommandé pour Windows)

Double-cliquez sur :
```
scripts/start-server.bat
```

Ou depuis le terminal :
```cmd
scripts\start-server.bat
```

## ✅ Solution 2 : Utiliser npx directement

Depuis la racine du projet :

```cmd
cd server
npm install
npm run build
cd ..
npx firebase-tools emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

## ✅ Solution 3 : Modifier la politique PowerShell (Optionnel)

Si vous préférez utiliser PowerShell, exécutez cette commande **une seule fois** dans PowerShell en tant qu'administrateur :

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Puis utilisez :
```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-server.ps1
```

## 📋 Commandes Manuelles

### 1. Installer les dépendances
```cmd
cd server
npm install
```

### 2. Build TypeScript
```cmd
npm run build
```

### 3. Démarrer les émulateurs
```cmd
cd ..
npx firebase-tools emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

## 🌐 URLs des Émulateurs

Une fois démarré, les services seront disponibles sur :
- **Functions** : `http://127.0.0.1:5001`
- **Firestore** : `http://127.0.0.1:8081`
- **Auth** : `http://127.0.0.1:9099`
- **UI** : `http://localhost:4000` (Interface de gestion)

## 🔧 Configuration Requise

Créez un fichier `.env.local` dans le dossier `server/` :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
NODE_ENV=development
```

## 🛑 Arrêter le Serveur

Appuyez sur `Ctrl + C` dans le terminal où les émulateurs tournent.

