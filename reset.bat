@echo off
echo Reinstalando dependencias...
rmdir /s /q node_modules
del package-lock.json
npm install
echo Dependencias reinstaladas!
echo.
echo Agora tente: npm run dev:react