const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Iniciando Snippets App...\n');

// Função para verificar se o servidor está rodando
function checkServer(url, timeout = 1000) {
  return new Promise((resolve) => {
    const request = http.get(url, (res) => {
      resolve(res.statusCode === 200);
    });
    
    request.on('error', () => resolve(false));
    request.setTimeout(timeout, () => {
      request.destroy();
      resolve(false);
    });
  });
}

// Função para aguardar o servidor
async function waitForServer(url, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    if (await checkServer(url)) {
      return true;
    }
    console.log(`⏳ Aguardando React... (${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

async function start() {
  // Iniciar React
  console.log('📦 Iniciando React Dev Server...');
  const vite = spawn('node', ['node_modules/vite/bin/vite.js'], {
    stdio: 'inherit',
    shell: true
  });

  // Aguardar React inicializar
  console.log('⏳ Aguardando React inicializar...');
  const reactReady = await waitForServer('http://localhost:3000');
  
  if (!reactReady) {
    console.error('❌ React não iniciou a tempo');
    process.exit(1);
  }

  console.log('✅ React pronto! Iniciando Electron...');
  
  // Iniciar Electron
  const electron = spawn('node', ['node_modules/electron/cli.js', '.'], {
    stdio: 'inherit',
    shell: true
  });

  // Cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Parando aplicação...');
    vite.kill();
    electron.kill();
    process.exit();
  });
}

start().catch(console.error);