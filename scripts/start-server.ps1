# Script PowerShell pour démarrer le serveur Firebase Functions
# Pour exécuter ce script, utilisez : powershell -ExecutionPolicy Bypass -File scripts/start-server.ps1

Write-Host "🔧 Démarrage du serveur Firebase Functions" -ForegroundColor Green

# Aller dans le dossier server
if (Test-Path "server") {
    Write-Host "📂 Navigation vers le dossier server..." -ForegroundColor Blue
    Set-Location server
} elseif (Test-Path "package.json") {
    Write-Host "✅ Déjà dans le dossier server" -ForegroundColor Green
} else {
    Write-Host "❌ Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Configuration de l'environnement
$env:FASTAPI_ENV = "local"
$env:NODE_ENV = "development"

Write-Host "🔨 Installation des dépendances..." -ForegroundColor Blue
npm install

Write-Host "🔨 Build du projet TypeScript..." -ForegroundColor Blue
npm run build

# Retourner à la racine
Set-Location ..

Write-Host "🚀 Démarrage des émulateurs Firebase..." -ForegroundColor Green
Write-Host "📡 FastAPI configuré en mode local (http://127.0.0.1:8080)" -ForegroundColor Yellow

# Utiliser npx pour éviter les problèmes de politique PowerShell
npx firebase-tools emulators:start --import=./emulator-data --export-on-exit=./emulator-data

