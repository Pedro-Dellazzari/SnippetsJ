// Teste completo de todas as abas da sidebar
// Este script verificará se cada aba mostra os snippets corretos

const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testSidebarTab(page, tabSelector, tabName, expectedBehavior) {
  console.log(`\n🧪 TESTANDO: ${tabName}`);
  
  try {
    // Aguardar elemento existir
    await page.waitForSelector(tabSelector, { timeout: 5000 });
    
    // Clicar na aba
    await page.click(tabSelector);
    await delay(1000);
    
    // Verificar se o contexto mudou
    const contextHeader = await page.$eval('[data-testid="snippet-context"]', 
      el => el.textContent
    ).catch(() => 'Context not found');
    
    // Contar snippets visíveis
    const snippetCount = await page.$$eval('[data-testid="snippet-item"]', 
      items => items.length
    ).catch(() => 0);
    
    console.log(`✅ ${tabName}: Context="${contextHeader}", Snippets=${snippetCount}`);
    
    // Verificação específica
    if (expectedBehavior) {
      await expectedBehavior(page, contextHeader, snippetCount);
    }
    
    return { context: contextHeader, count: snippetCount, success: true };
    
  } catch (error) {
    console.log(`❌ ${tabName}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

(async () => {
  console.log('🎯 VALIDAÇÃO COMPLETA DAS ABAS DA SIDEBAR\n');
  
  let browser;
  
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1400, height: 900 },
      devtools: true
    });
    
    const page = await browser.newPage();
    
    console.log('📱 Abrindo aplicação em http://localhost:3007');
    await page.goto('http://localhost:3007', { waitUntil: 'networkidle0' });
    
    // Aguardar a sidebar carregar
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: 10000 });
    console.log('✅ Sidebar carregada');
    
    // Array para armazenar resultados dos testes
    const testResults = [];
    
    // 1. TESTAR SEÇÃO "TODOS"
    const todosResult = await testSidebarTab(
      page, 
      '[data-testid="all-snippets"], [id*="all-snippets"], .sidebar-item:contains("Todos")',
      'TODOS OS SNIPPETS',
      async (page, context, count) => {
        if (!context.includes('Todos') && !context.includes('Snippets')) {
          throw new Error('Context não mudou para "Todos os Snippets"');
        }
      }
    );
    testResults.push({ tab: 'Todos', ...todosResult });
    
    // 2. TESTAR SEÇÃO "FAVORITOS"
    const favoritesResult = await testSidebarTab(
      page,
      '[data-testid="favorites"], [id*="favorites"], .sidebar-item:contains("Favoritos")',
      'FAVORITOS',
      async (page, context, count) => {
        if (!context.includes('Favoritos')) {
          throw new Error('Context não mudou para "Favoritos"');
        }
      }
    );
    testResults.push({ tab: 'Favoritos', ...favoritesResult });
    
    // 3. TESTAR SEÇÃO "SEM MARCAÇÃO"
    const unassignedResult = await testSidebarTab(
      page,
      '[data-testid="unassigned"], [id*="unassigned"], .sidebar-item:contains("Sem marcação")',
      'SEM MARCAÇÃO',
      async (page, context, count) => {
        if (!context.includes('Sem marcação')) {
          throw new Error('Context não mudou para "Sem marcação"');
        }
      }
    );
    testResults.push({ tab: 'Sem marcação', ...unassignedResult });
    
    // 4. TESTAR SEÇÃO "FOLDERS" (se houver folders)
    try {
      const folders = await page.$$('[data-testid*="folder-"], .sidebar-item[id*="folder-"]');
      if (folders.length > 0) {
        console.log(`\n🗂️ Encontrados ${folders.length} folders para testar`);
        
        // Testar o primeiro folder
        const folderResult = await testSidebarTab(
          page,
          '[data-testid*="folder-"], .sidebar-item[id*="folder-"]',
          'FOLDER (primeiro encontrado)',
          async (page, context, count) => {
            // Context deveria mostrar o nome da pasta
            console.log(`📁 Folder context: ${context}`);
          }
        );
        testResults.push({ tab: 'Folders', ...folderResult });
      } else {
        console.log('\n🗂️ Nenhum folder encontrado para testar');
        testResults.push({ tab: 'Folders', success: false, error: 'No folders found' });
      }
    } catch (error) {
      console.log(`\n🗂️ Erro ao testar folders: ${error.message}`);
      testResults.push({ tab: 'Folders', success: false, error: error.message });
    }
    
    // 5. TESTAR SEÇÃO "PROJETOS" (se houver projetos)
    try {
      const projects = await page.$$('[data-testid*="project-"], .sidebar-item[id*="project-"]');
      if (projects.length > 0) {
        console.log(`\n🚀 Encontrados ${projects.length} projetos para testar`);
        
        // Testar o primeiro projeto
        const projectResult = await testSidebarTab(
          page,
          '[data-testid*="project-"], .sidebar-item[id*="project-"]',
          'PROJETO (primeiro encontrado)',
          async (page, context, count) => {
            console.log(`🚀 Project context: ${context}`);
          }
        );
        testResults.push({ tab: 'Projetos', ...projectResult });
      } else {
        console.log('\n🚀 Nenhum projeto encontrado para testar');
        testResults.push({ tab: 'Projetos', success: false, error: 'No projects found' });
      }
    } catch (error) {
      console.log(`\n🚀 Erro ao testar projetos: ${error.message}`);
      testResults.push({ tab: 'Projetos', success: false, error: error.message });
    }
    
    // 6. TESTAR SEÇÃO "LINGUAGENS" (se houver linguagens)
    try {
      const languages = await page.$$('[data-testid*="language-"], .sidebar-item[id*="language-"]');
      if (languages.length > 0) {
        console.log(`\n💻 Encontradas ${languages.length} linguagens para testar`);
        
        // Testar a primeira linguagem
        const languageResult = await testSidebarTab(
          page,
          '[data-testid*="language-"], .sidebar-item[id*="language-"]',
          'LINGUAGEM (primeira encontrada)',
          async (page, context, count) => {
            console.log(`💻 Language context: ${context}`);
          }
        );
        testResults.push({ tab: 'Linguagens', ...languageResult });
      } else {
        console.log('\n💻 Nenhuma linguagem encontrada para testar');
        testResults.push({ tab: 'Linguagens', success: false, error: 'No languages found' });
      }
    } catch (error) {
      console.log(`\n💻 Erro ao testar linguagens: ${error.message}`);
      testResults.push({ tab: 'Linguagens', success: false, error: error.message });
    }
    
    // RELATÓRIO FINAL
    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO FINAL DOS TESTES');
    console.log('='.repeat(50));
    
    const successfulTests = testResults.filter(r => r.success).length;
    const totalTests = testResults.length;
    
    testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const info = result.success 
        ? `Context: ${result.context}, Snippets: ${result.count}`
        : `Error: ${result.error}`;
      console.log(`${status} ${result.tab}: ${info}`);
    });
    
    console.log(`\n🎯 RESULTADO: ${successfulTests}/${totalTests} testes passaram`);
    
    if (successfulTests === totalTests) {
      console.log('🎉 TODAS AS ABAS DA SIDEBAR FUNCIONAM CORRETAMENTE!');
    } else {
      console.log('⚠️ Algumas abas precisam de ajustes.');
    }
    
    console.log('\n🖱️ Browser permanecerá aberto para inspeção manual...');
    console.log('💡 Pressione Ctrl+C para encerrar.\n');
    
    // Manter o browser aberto
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    // Não fechar o browser automaticamente para permitir inspeção manual
  }
})();