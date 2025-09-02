// Quick test script to validate sidebar functionality
// This script will open the app and perform basic navigation tests

const puppeteer = require('puppeteer');

(async () => {
  console.log('🎯 Iniciando validação da sidebar...\n');
  
  let browser;
  
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1200, height: 800 },
      devtools: false
    });
    
    const page = await browser.newPage();
    
    // Go to the app
    console.log('📱 Abrindo aplicação em http://localhost:3006');
    await page.goto('http://localhost:3006', { waitUntil: 'networkidle0' });
    
    // Wait for the sidebar to load
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });
    console.log('✅ Sidebar carregada');
    
    // Test 1: Check if "Todos" section exists and is clickable
    console.log('\n🧪 TESTE 1: Seção "Todos os Snippets"');
    try {
      const todosButton = await page.$('[data-testid="all-snippets"]');
      if (todosButton) {
        await todosButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Clicou em "Todos os Snippets"');
        
        const contextHeader = await page.$eval('.snippet-context-header', el => el.textContent);
        console.log(`📄 Context: ${contextHeader}`);
      } else {
        console.log('❌ Botão "Todos os Snippets" não encontrado');
      }
    } catch (error) {
      console.log(`⚠️ Erro no teste "Todos": ${error.message}`);
    }
    
    // Test 2: Check "Favoritos" section
    console.log('\n🧪 TESTE 2: Seção "Favoritos"');
    try {
      const favoritesButton = await page.$('[data-testid="favorites"]');
      if (favoritesButton) {
        await favoritesButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Clicou em "Favoritos"');
        
        const contextHeader = await page.$eval('.snippet-context-header', el => el.textContent);
        console.log(`❤️ Context: ${contextHeader}`);
      } else {
        console.log('❌ Botão "Favoritos" não encontrado');
      }
    } catch (error) {
      console.log(`⚠️ Erro no teste "Favoritos": ${error.message}`);
    }
    
    // Test 3: Check "Sem marcação" section
    console.log('\n🧪 TESTE 3: Seção "Sem marcação"');
    try {
      const unassignedButton = await page.$('[data-testid="unassigned"]');
      if (unassignedButton) {
        await unassignedButton.click();
        await page.waitForTimeout(1000);
        console.log('✅ Clicou em "Sem marcação"');
        
        const contextHeader = await page.$eval('.snippet-context-header', el => el.textContent);
        console.log(`🕳️ Context: ${contextHeader}`);
      } else {
        console.log('❌ Botão "Sem marcação" não encontrado');
      }
    } catch (error) {
      console.log(`⚠️ Erro no teste "Sem marcação": ${error.message}`);
    }
    
    // Test 4: Check if folders section exists
    console.log('\n🧪 TESTE 4: Seção "Folders"');
    try {
      const foldersSection = await page.$('[data-testid="folders-section"]');
      if (foldersSection) {
        console.log('✅ Seção "Folders" encontrada');
      } else {
        console.log('❌ Seção "Folders" não encontrada');
      }
    } catch (error) {
      console.log(`⚠️ Erro no teste "Folders": ${error.message}`);
    }
    
    // Test 5: Check if projects section exists
    console.log('\n🧪 TESTE 5: Seção "Projetos"');
    try {
      const projectsSection = await page.$('[data-testid="projects-section"]');
      if (projectsSection) {
        console.log('✅ Seção "Projetos" encontrada');
      } else {
        console.log('❌ Seção "Projetos" não encontrada');
      }
    } catch (error) {
      console.log(`⚠️ Erro no teste "Projetos": ${error.message}`);
    }
    
    console.log('\n✨ Validação concluída! Navegue manualmente para testes mais detalhados.\n');
    
    // Keep browser open for manual testing
    console.log('🖱️ O browser permanecerá aberto para testes manuais...');
    console.log('💡 Pressione Ctrl+C para encerrar quando terminar os testes.\n');
    
    // Keep the script running
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    // Don't close the browser automatically
    // if (browser) await browser.close();
  }
})();