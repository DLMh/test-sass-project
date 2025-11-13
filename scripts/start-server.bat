@echo off
echo 🔧 Démarrage du serveur Firebase Functions

REM Aller dans le dossier server
if exist "server" (
    echo 📂 Navigation vers le dossier server...
    cd server
) else if exist "package.json" (
    echo ✅ Déjà dans le dossier server
) else (
    echo ❌ Ce script doit être exécuté depuis la racine du projet
    pause
    exit /b 1
)

REM Configuration de l'environnement
set FASTAPI_ENV=local
set NODE_ENV=development

echo 🔨 Installation des dépendances...
call npm install

echo 🔨 Build du projet TypeScript...
call npm run build

REM Retourner à la racine
cd ..

echo 🚀 Démarrage des émulateurs Firebase...
echo 📡 FastAPI configuré en mode local (http://127.0.0.1:8080)

REM Utiliser npx pour éviter les problèmes de politique PowerShell
npx firebase-tools emulators:start --import=./emulator-data --export-on-exit=./emulator-data

pause

