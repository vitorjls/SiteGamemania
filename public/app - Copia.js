let listaCompleta = [];
let orcamentoAtual = [];

// Palavras-chave exatas que definem o que vai para a tela PRETA
const palavrasHardware = [
    'hardware', 'placa mãe', 'memória', 'gabinetes', 'cooler', 'watercooler', 
    'processador', 'fonte', 'placa de vídeo', 'ssd', 'armazenamento', 'refrigeração', 'energia'
];

function mudarAba(abaId) {
    document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('ativa'));
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('ativo'));
    
    document.getElementById(`aba-${abaId}`).classList.add('ativa');
    document.getElementById(`link-${abaId}`).classList.add('ativo');
}

async function carregarProdutos() {
    try {
        const resposta = await fetch('/api/produtos');
        listaCompleta = await resposta.json();
        
        // Renderiza tudo na inicialização
        filtrarProdutosGerais('Todos', document.querySelector('.btn-filtro.ativo'));
        filtrarHardware('Todos', document.querySelector('.btn-filtro-dark.ativo'));
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

// Verifica se um produto pertence ao grupo de Hardware
function ehProdutoHardware(categoria) {
    if (!categoria) return false;
    const cat = categoria.toLowerCase();
    return palavrasHardware.some(palavra => cat.includes(palavra));
}

// Renderiza aba clara (Acessórios)
function renderizarAcessorios(produtos) {
    const grid = document.getElementById('grid-acessorios');
    grid.innerHTML = '';
    
    produtos.forEach(produto => {
        if (!ehProdutoHardware(produto.categoria)) {
            grid.appendChild(criarCardProduto(produto, false));
        }
    });
}

// Renderiza aba escura (Monte seu Setup)
function renderizarHardware(produtos) {
    const grid = document.getElementById('grid-hardware');
    grid.innerHTML = '';
    
    produtos.forEach(produto => {
        if (ehProdutoHardware(produto.categoria)) {
            grid.appendChild(criarCardProduto(produto, true));
        }
    });
}

// Função base para gerar o HTML do card
function criarCardProduto(produto, isDark) {
    const card = document.createElement('div');
    card.className = 'apple-card';
    card.innerHTML = `
        <div>
            <p class="categoria-tag" style="${isDark ? 'color:#2997ff;' : ''}">${produto.categoria || 'Sem categoria'}</p>
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

    if (categoriaPesquisa === 'Todos') {
        renderizarAcessorios(listaCompleta);
    } else {
        const filtrados = listaCompleta.filter(p => p.categoria && p.categoria.toLowerCase().includes(categoriaPesquisa.toLowerCase()));
        renderizarAcessorios(filtrados);
    }
}

function filtrarHardware(categoriaPesquisa, btnElement) {
    document.querySelectorAll('.btn-filtro-dark').forEach(btn => btn.classList.remove('ativo'));
    btnElement.classList.add('ativo');

    if (categoriaPesquisa === 'Todos') {
        renderizarHardware(listaCompleta);
    } else {
        const filtrados = listaCompleta.filter(p => p.categoria && p.categoria.toLowerCase().includes(categoriaPesquisa.toLowerCase()));
        renderizarHardware(filtrados);
    }
}

// Lógica de Orçamento
function adicionarAoOrcamento(id) {
    const produto = listaCompleta.find(p => p.id === id);
    if (!produto) return;

    const itemExistente = orcamentoAtual.find(item => item.id === id);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        orcamentoAtual.push({ ...produto, quantidade: 1 });
    }
    atualizarPainelInterno();
}

function removerDoOrcamento(id) {
    const index = orcamentoAtual.findIndex(item => item.id === id);
    if (index === -1) return;

    if (orcamentoAtual[index].quantidade > 1) {
        orcamentoAtual[index].quantidade -= 1;
    } else {
        orcamentoAtual.splice(index, 1);
    }
    atualizarPainelInterno();
}

function atualizarPainelInterno() {
    const container = document.getElementById('itens-orcamento');
    container.innerHTML = '';

    let totalCusto = 0;
    let totalVenda = 0;

    orcamentoAtual.forEach(item => {
        totalCusto += (item.preco_custo * item.quantidade);
        totalVenda += (item.preco_venda * item.quantidade);

        const linha = document.createElement('div');
        linha.className = 'item-linha';
        linha.innerHTML = `
            <span><b>${item.quantidade}x</b> ${item.nome.substring(0, 25)}</span>
            <div style="display:flex; align-items:center; gap:10px;">
                <span>R$ ${(item.preco_venda * item.quantidade).toFixed(2).replace('.', ',')}</span>
                <button class="btn-remove" onclick="removerDoOrcamento(${item.id})">&times;</button>
            </div>
        `;
        container.appendChild(linha);
    });

    const totalLucro = totalVenda - totalCusto;

    document.getElementById('total-custo').innerText = totalCusto.toFixed(2).replace('.', ',');
    document.getElementById('total-venda').innerText = totalVenda.toFixed(2).replace('.', ',');
    document.getElementById('total-lucro').innerText = totalLucro.toFixed(2).replace('.', ',');
}

// Modal
function abrirEspelhoCliente() {
    if(orcamentoAtual.length === 0) return alert("Adicione itens ao orçamento primeiro.");
    
    const corpoTabela = document.getElementById('tabela-cliente-corpo');
    corpoTabela.innerHTML = '';
    let totalCliente = 0;

    orcamentoAtual.forEach(item => {
        const subtotal = item.preco_venda * item.quantidade;
        totalCliente += subtotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>R$ ${item.preco_venda.toFixed(2).replace('.', ',')}</td>
            <td><b>R$ ${subtotal.toFixed(2).replace('.', ',')}</b></td>
        `;
        corpoTabela.appendChild(tr);
    });

    document.getElementById('cliente-total-final').innerText = totalCliente.toFixed(2).replace('.', ',');
    document.getElementById('modal-cliente').style.display = 'flex';
}

function fecharEspelhoCliente() {
    document.getElementById('modal-cliente').style.display = 'none';
}

window.onload = carregarProdutos;