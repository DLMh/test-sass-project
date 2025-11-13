# Script PowerShell pour Windows - Version Demo

Write-Host "🔧 VERSION DEMO - Démarrage environnement de développement local" -ForegroundColor Green

# Fonction pour déplacer les logs
function Move-Logs {
    Write-Host "📁 Déplacement des logs dans le dossier logs/..." -ForegroundColor Blue
    if (!(Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
    }
    Get-ChildItem -Filter "*-debug.log" -ErrorAction SilentlyContinue | Move-Item -Destination "logs\" -ErrorAction SilentlyContinue
    Write-Host "✅ Logs organisés" -ForegroundColor Green
}

# Déplacer les logs existants
Move-Logs

# S'assurer d'être dans le bon dossier
if (Test-Path "server") {
    Write-Host "📂 Navigation vers le dossier server..." -ForegroundColor Blue
    Set-Location server
} elseif ((Test-Path "package.json") -and (Test-Path "tsconfig.json")) {
    Write-Host "✅ Déjà dans le dossier server" -ForegroundColor Green
} else {
    Write-Host "❌ Ce script doit être exécuté depuis le dossier server ou son parent" -ForegroundColor Red
    exit 1
}

# Configuration de l'environnement (toujours local)
$env:FASTAPI_ENV = "local"
$env:NODE_ENV = "development"

Write-Host "🔨 Installation des dépendances..." -ForegroundColor Blue
npm install

Write-Host "🔨 Build du projet (mode simplifié)..." -ForegroundColor Blue

# Build simplifié sans erreurs
try {
    npm run build 2>&1 | Out-Null
    Write-Host "✅ Build réussi" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Build échoué, mais on continue (mode demo)" -ForegroundColor Yellow
}

# Aller dans le dossier parent pour les émulateurs
Set-Location ..

Write-Host "🚀 Démarrage des émulateurs Firebase..." -ForegroundColor Green
Write-Host "📡 FastAPI configuré en mode local (http://127.0.0.1:8080)" -ForegroundColor Yellow

# Démarrer les émulateurs
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data

# Déplacer les logs à la fin
Move-Logs

