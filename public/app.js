let listaCompleta = [];
let orcamentoAtual = [];

// MAPA INTELIGENTE: Lê o nome do produto e classifica automaticamente
const mapaCategorias = {
    'Processador': {
        incluir: ['core i3', 'core i5', 'core i7', 'core i9', 'xeon', 'pentium', 'celeron', 'intel core', 'ryzen 3', 'ryzen 5', 'ryzen 7', 'ryzen 9', 'athlon', 'processador', 'cpu'],
        excluir: ['cooler', 'placa', 'water', 'pasta', 'dissipador', 'suporte', 'espelho']
    },
    'Placa Mãe': {
        incluir: ['h61', 'h81', 'h110', 'h310', 'h410', 'h510', 'h610', 'h710', 'b75', 'b85', 'b150', 'b250', 'b360', 'b365', 'b460', 'b560', 'b660', 'b760', 'z97', 'z170', 'z270', 'z370', 'z390', 'z490', 'z590', 'z690', 'z790', 'lga1155', 'lga1150', 'lga1151', 'lga1200', 'lga1700', 'a320', 'a520', 'b350', 'b450', 'b550', 'b650', 'x370', 'x470', 'x570', 'x670', 'am3', 'am4', 'am5', 'placa mãe', 'placa mae', 'motherboard', 'intel', 'amd'],
        excluir: ['espelho', 'processador', 'memoria', 'memória', 'cooler', 'video', 'vídeo', 'parafuso', 'cabo', 'suporte']
    },
    'Placa de Vídeo': {
        incluir: ['gt240', 'gt610', 'gt710', 'gt730', 'gt1030', 'gtx', 'rtx', 'geforce', 'rx550', 'rx580', 'rx5500', 'rx5600', 'rx5700', 'rx6600', 'rx6700', 'rx7600', 'rx7800', 'radeon', 'placa de video', 'placa de vídeo', 'gpu'],
        excluir: ['cooler', 'cabo', 'adaptador', 'suporte', 'riser', 'espelho', 'parafuso', 'pasta']
    },
    'Memória RAM': {
        incluir: ['ddr3', 'ddr4', 'ddr5', 'sodimm', 'dimm', 'memoria ram', 'memória ram', '3200mhz', '2666mhz', '2400mhz'],
        excluir: ['placa', 'cooler', 'dissipador', 'adaptador', 'hd', 'ssd', 'vídeo', 'video']
    },
    'SSD': {
        incluir: ['ssd', 'nvme', 'sata iii', 'sata3', 'm.2', 'm2 pcle', 'pci-e', 'kingfast', 'keepdata', 'hiksemi', 'crucial', 'kingston snv', 'wd green'],
        excluir: ['cabo', 'adaptador', 'case', 'gaveta', 'caddy', 'dissipador', 'parafuso', 'enclosure']
    },
    'Fonte ATX': {
        incluir: ['fonte', 'atx', '80 plus', '80plus', 'pfc ativo'],
        excluir: ['cabo', 'adaptador', 'gabinete', 'testador', 'cabo de forca', 'cabo de força']
    },
    'Refrigeração': {
        incluir: ['cooler', 'watercooler', 'water-cooler', 'fan', 'ventoinha', 'pasta termica', 'pasta térmica', 'cooling stand', 'dissipador'],
        excluir: ['gabinete', 'processador', 'placa', 'fonte']
    },
    'Gabinete': {
        incluir: ['gabinete', 'bg-', 'gb17', 'arbaton', 'dasha', 'slimdesk'],
        excluir: ['cooler', 'cabo', 'suporte', 'parafuso', 'painel', 'fita', 'led']
    }
};

function classificarProdutoAutomaticamente(produto) {
    if (!produto.nome) return produto;
    
    const nomeStr = produto.nome.toLowerCase();
    const catStr = (produto.categoria || '').toLowerCase();
    
    // Alvo restrito: Apenas produtos marcados na categoria raiz "Hardware" passam pela subdivisão
    if (catStr.includes('hardware') || ehProdutoHardware(produto)) {
        produto.categoria = 'Hardware'; 
        produto.subcategoria = 'Outros'; // Fallback padrão caso não combine
        
        // Loop de verificação nas regras do mapa de categorias
        for (const [subcat, palavras] of Object.entries(mapaCategorias)) {
            const encontrou = palavras.some(palavra => {
                const p = palavra.toLowerCase();
                
                // Validação de fronteira de string simples para evitar match incorreto (ex: 'ram' dentro de 'arbaton')
                if (p === 'ram') {
                    return nomeStr.includes('ram ') || nomeStr.endsWith('ram') || nomeStr.includes(' memoria');
                }
                return nomeStr.includes(p);
            });

            if (encontrou) {
                produto.subcategoria = subcat;
                break; // Interrompe no primeiro match de maior relevância
            }
        }
        
        // Classificação secundária exclusiva para segmentar Gabinetes Gamer de Office
        if (produto.subcategoria === 'Gabinete') {
            if (nomeStr.includes('office') || nomeStr.includes('slim') || nomeStr.includes('slimdesk')) {
                produto.tipo = 'Office';
            } else {
                produto.tipo = 'Gamer';
            }
        }
    }
    return produto;
}

// Verifica se pertence à zona futurista
function ehProdutoHardware(produto) {
    if (!produto.categoria) return false;
    const cat = produto.categoria.trim().toLowerCase();
    const palavrasHardware = ['hardware', 'gabinete', 'gabinetes', 'placa mãe', 'memória', 'cooler', 'watercooler', 'processador', 'fonte', 'placa de vídeo', 'ssd', 'armazenamento', 'refrigeração', 'energia'];
    return palavrasHardware.some(palavra => cat.includes(palavra));
}

// Gerenciamento de Abas
function mudarAba(abaId) {
    document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('ativa'));
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('ativo'));
    document.getElementById(`aba-${abaId}`).classList.add('ativa');
    document.getElementById(`link-${abaId}`).classList.add('ativo');
}

// Carregar Dados da API
async function carregarProdutos() {
    try {
        const resposta = await fetch('/api/produtos');
        const dados = await resposta.json();
        
        // Passa todos os produtos pelo leitor automático
        listaCompleta = dados.map(item => classificarProdutoAutomaticamente(item));
        
        const btnTodosClaro = document.querySelector('.btn-filtro.ativo');
        const btnTodosDark = document.querySelector('.btn-filtro-dark.ativo');
        
        if (btnTodosClaro) filtrarProdutosGerais('Todos', btnTodosClaro);
        if (btnTodosDark) filtrarHardware('Todos', btnTodosDark);
        
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

// Renderiza a Vitrine Clara (Acessórios)
function renderizarAcessorios(produtos) {
    const grid = document.getElementById('grid-acessorios');
    if (!grid) return;
    grid.innerHTML = '';
    produtos.forEach(produto => {
        if (!ehProdutoHardware(produto)) {
            grid.appendChild(criarCardProduto(produto, false));
        }
    });
}

// Renderiza a Vitrine Escura (Setup/Hardware)
function renderizarHardware(produtos) {
    const grid = document.getElementById('grid-hardware');
    if (!grid) return;
    grid.innerHTML = '';
    produtos.forEach(produto => {
        if (ehProdutoHardware(produto)) {
            grid.appendChild(criarCardProduto(produto, true));
        }
    });
}

function criarCardProduto(produto, isDark) {
    const card = document.createElement('div');
    card.className = 'apple-card';
    card.innerHTML = `
        <div>
            <p class="categoria-tag" style="${isDark ? 'color:#2997ff;' : ''}">${produto.subcategoria || produto.categoria || 'Sem categoria'}</p>
            <h3 title="${produto.nome}">${produto.nome}</h3>
            <p style="font-size: 14px; margin-bottom: 10px;">Estoque: ${produto.estoque} un</p>
        </div>
        <img src="${produto.imagem || 'https://via.placeholder.com/300'}" alt="${produto.nome}">
        <p class="preco">R$ ${produto.preco_venda.toFixed(2).replace('.', ',')}</p>
        <button class="btn-apple-primary" style="margin-top: 15px; padding: 8px; font-size: 14px;" onclick="adicionarAoOrcamento(${produto.id})">Adicionar</button>
    `;
    return card;
}

// Filtros
function filtrarProdutosGerais(categoriaPesquisa, btnElement) {
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('ativo'));
    btnElement.classList.add('ativo');

    let filtrados = listaCompleta.filter(p => !ehProdutoHardware(p));
    if (categoriaPesquisa !== 'Todos') {
        filtrados = filtrados.filter(p => p.categoria && p.categoria.toLowerCase().includes(categoriaPesquisa.toLowerCase()));
    }
    renderizarAcessorios(filtrados);
}

function filtrarHardware(subcategoriaPesquisa, btnElement) {
    document.querySelectorAll('.btn-filtro-dark').forEach(btn => btn.classList.remove('ativo'));
    btnElement.classList.add('ativo');

    const subFiltrosGabinete = document.getElementById('sub-filtros-gabinete');
    if (subFiltrosGabinete) {
        subFiltrosGabinete.style.display = (subcategoriaPesquisa === 'Gabinete') ? 'flex' : 'none';
    }

    let filtrados = listaCompleta.filter(p => ehProdutoHardware(p));

    if (subcategoriaPesquisa !== 'Todos') {
        filtrados = filtrados.filter(p => p.subcategoria && p.subcategoria.toLowerCase() === subcategoriaPesquisa.toLowerCase());
    }
    
    renderizarHardware(filtrados);
}

function filtrarTipoHardware(subcategoria, tipoPesquisa, btnElement) {
    let filtrados = listaCompleta.filter(p => 
        ehProdutoHardware(p) &&
        p.subcategoria && p.subcategoria.toLowerCase() === subcategoria.toLowerCase()
    );

    if (tipoPesquisa !== 'Todos') {
        filtrados = filtrados.filter(p => p.tipo && p.tipo.toLowerCase() === tipoPesquisa.toLowerCase());
    }
    renderizarHardware(filtrados);
}

// Lógica de Orçamento
function adicionarAoOrcamento(id) {
    const produto = listaCompleta.find(p => p.id === id);
    if (!produto) return;
    const itemExistente = orcamentoAtual.find(item => item.id === id);
    if (itemExistente) { itemExistente.quantidade += 1; } else { orcamentoAtual.push({ ...produto, quantidade: 1 }); }
    atualizarPainelInterno();
}

function removerDoOrcamento(id) {
    const index = orcamentoAtual.findIndex(item => item.id === id);
    if (index === -1) return;
    if (orcamentoAtual[index].quantidade > 1) { orcamentoAtual[index].quantidade -= 1; } else { orcamentoAtual.splice(index, 1); }
    atualizarPainelInterno();
}

function atualizarPainelInterno() {
    const container = document.getElementById('itens-orcamento');
    container.innerHTML = '';
    let totalCusto = 0; let totalVenda = 0;

    orcamentoAtual.forEach(item => {
        totalCusto += (item.preco_custo * item.quantidade);
        totalVenda += (item.preco_venda * item.quantidade);
        const linha = document.createElement('div');
        linha.className = 'item-linha';
        linha.innerHTML = `<span><b>${item.quantidade}x</b> ${item.nome.substring(0, 20)}</span>
            <div style="display:flex; align-items:center; gap:10px;">
                <span>R$ ${(item.preco_venda * item.quantidade).toFixed(2).replace('.', ',')}</span>
                <button class="btn-remove" onclick="removerDoOrcamento(${item.id})">&times;</button>
            </div>`;
        container.appendChild(linha);
    });

    document.getElementById('total-custo').innerText = totalCusto.toFixed(2).replace('.', ',');
    document.getElementById('total-venda').innerText = totalVenda.toFixed(2).replace('.', ',');
    document.getElementById('total-lucro').innerText = (totalVenda - totalCusto).toFixed(2).replace('.', ',');
}

function abrirEspelhoCliente() {
    if(orcamentoAtual.length === 0) return alert("Adicione itens ao orçamento primeiro.");
    const corpo = document.getElementById('tabela-cliente-corpo');
    corpo.innerHTML = '';
    let totalCliente = 0;
    orcamentoAtual.forEach(item => {
        const sub = item.preco_venda * item.quantidade;
        totalCliente += sub;
        corpo.innerHTML += `<tr><td>${item.nome}</td><td>${item.quantidade}</td><td>R$ ${item.preco_venda.toFixed(2).replace('.', ',')}</td><td><b>R$ ${sub.toFixed(2).replace('.', ',')}</b></td></tr>`;
    });
    document.getElementById('cliente-total-final').innerText = totalCliente.toFixed(2).replace('.', ',');
    document.getElementById('modal-cliente').style.display = 'flex';
}

function fecharEspelhoCliente() { document.getElementById('modal-cliente').style.display = 'none'; }

window.onload = carregarProdutos;