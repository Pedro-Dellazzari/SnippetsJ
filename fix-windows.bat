@echo off
echo 🔧 Corrigindo dependencias para Windows...
echo.

echo ❌ Removendo node_modules antigo...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo ⬇️ Instalando dependencias para Windows...
npm install

echo ✅ Instalação completa!
echo.
echo 🚀 Testando aplicativo...
npm run dev:react