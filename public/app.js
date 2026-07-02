let listaCompleta = [];
let orcamentoAtual = [];

const FATOR_AVISTA = 1.6;
const FATOR_PARCELADO = 1.7;

const estadoFiltros = {
    vitrine: { categoria: 'Todos', ordenacao: 'nome-az' },
    hardware: { categoria: 'Todos', tipo: 'Todos', ordenacao: 'nome-az', busca: '' }
};

const regrasHardware = [
    {
        nome: 'Processador',
        incluir: ['core i3', 'core i5', 'core i7', 'core i9', 'xeon', 'pentium', 'celeron', 'intel core', 'ryzen 3', 'ryzen 5', 'ryzen 7', 'ryzen 9', 'athlon', 'processador', 'cpu'],
        padroes: [
            /(^|[^a-z0-9])i[3579][-\s]?\d{3,5}[a-z]{0,3}([^a-z0-9]|$)/,
            /(^|[^a-z0-9])ryzen\s?[3579]\s?\d{3,5}[a-z]{0,3}([^a-z0-9]|$)/
        ],
        excluir: ['cooler', 'placa', 'water', 'pasta', 'dissipador', 'suporte', 'espelho']
    },
    {
        nome: 'Placa M\u00e3e',
        incluir: ['h61', 'h81', 'h110', 'h310', 'h410', 'h510', 'h610', 'h710', 'b75', 'b85', 'b150', 'b250', 'b360', 'b365', 'b460', 'b560', 'b660', 'b760', 'z97', 'z170', 'z270', 'z370', 'z390', 'z490', 'z590', 'z690', 'z790', 'lga1155', 'lga1150', 'lga1151', 'lga1200', 'lga1700', 'a320', 'a520', 'b350', 'b450', 'b550', 'b650', 'x370', 'x470', 'x570', 'x670', 'am3', 'am4', 'am5', 'placa mae', 'motherboard', 'mainboard'],
        padroes: [
            /(^|[^a-z0-9])(h|b|z|a|x)\d{2,3}[a-z0-9-]*([^a-z0-9]|$)/
        ],
        excluir: ['espelho', 'processador', 'memoria', 'cooler', 'video', 'parafuso', 'cabo', 'suporte']
    },
    {
        nome: 'Placa de V\u00eddeo',
        incluir: ['gt240', 'gt610', 'gt710', 'gt730', 'gt1030', 'gtx', 'rtx', 'geforce', 'nvidia', 'rx550', 'rx580', 'rx5500', 'rx5600', 'rx5700', 'rx6600', 'rx6700', 'rx7600', 'rx7800', 'radeon', 'placa de video', 'gpu', 'gddr', 'vga pci'],
        padroes: [
            /(^|[^a-z0-9])(gt|gtx|rtx)\s?\d{3,4}[a-z0-9]*([^a-z0-9]|$)/,
            /(^|[^a-z0-9])rx\s?\d{3,4}[a-z0-9]*([^a-z0-9]|$)/,
            /(^|[^a-z0-9])r[579]\s?\d{3}([^a-z0-9]|$)/
        ],
        excluir: ['cooler', 'cabo', 'adaptador', 'suporte', 'riser', 'espelho', 'parafuso', 'pasta']
    },
    {
        nome: 'Mem\u00f3ria RAM',
        incluir: ['memoria ram', 'memoria ddr', 'ram ddr', 'sodimm', 'so-dimm', 'memoria notebook', 'memoria desktop', 'notebook ddr', 'desktop ddr', 'pc3', 'pc4', 'pc5', '3200mhz', '2666mhz', '2400mhz'],
        padroes: [
            /(^|[^a-z0-9])(ddr3|ddr4|ddr5)([^a-z0-9]|$)/,
            /(^|[^a-z0-9])([248]|16|32|64)gb\s*(ddr3|ddr4|ddr5)([^a-z0-9]|$)/,
            /(^|[^a-z0-9])(ddr3|ddr4|ddr5)\s*([248]|16|32|64)gb([^a-z0-9]|$)/,
            /(^|[^a-z0-9])ram\s*([248]|16|32|64)gb([^a-z0-9]|$)/
        ],
        excluir: ['placa mae', 'placa de video', 'cooler', 'dissipador', 'adaptador', 'hd', 'ssd', 'video', 'fonte', 'gabinete']
    },
    {
        nome: 'SSD',
        incluir: ['ssd', 'nvme', 'sata iii', 'sata3', 'm.2', 'm2 pcle', 'pci-e', 'kingfast', 'keepdata', 'hiksemi', 'crucial', 'kingston snv', 'wd green'],
        excluir: ['cabo', 'adaptador', 'case', 'gaveta', 'caddy', 'dissipador', 'parafuso', 'enclosure']
    },
    {
        nome: 'Fonte ATX',
        incluir: ['fonte', 'atx', '80 plus', '80plus', 'pfc ativo'],
        excluir: ['cabo', 'adaptador', 'gabinete', 'testador', 'cabo de forca']
    },
    {
        nome: 'Refrigera\u00e7\u00e3o',
        incluir: ['cooler', 'watercooler', 'water-cooler', 'fan', 'ventoinha', 'pasta termica', 'cooling stand', 'dissipador'],
        excluir: ['gabinete', 'processador', 'placa', 'fonte']
    },
    {
        nome: 'Gabinete',
        incluir: ['gabinete', 'bg-', 'gb17', 'arbaton', 'dasha', 'slimdesk'],
        excluir: ['cooler', 'cabo', 'suporte', 'parafuso', 'painel', 'fita', 'led']
    }
];

const categoriasHardwareFixas = [
    'Todos',
    'Processador',
    'Placa M\u00e3e',
    'Mem\u00f3ria RAM',
    'Placa de V\u00eddeo',
    'SSD',
    'Fonte ATX',
    'Refrigera\u00e7\u00e3o',
    'Gabinete',
    'Outros'
];

function corrigirTexto(texto) {
    if (typeof texto !== 'string') return texto;
    try {
        return decodeURIComponent(escape(texto));
    } catch {
        return texto;
    }
}

function normalizar(texto) {
    return String(corrigirTexto(texto) || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function escaparHtml(texto) {
    return String(texto || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function textoClassificacaoProduto(produto) {
    return [
        produto.nome,
        produto.categoria,
        produto.subcategoria,
        produto.grupo_hse
    ].map(normalizar).filter(Boolean).join(' ');
}

function regraCombinaProduto(regra, produto) {
    const texto = textoClassificacaoProduto(produto);
    const encontrouTexto = regra.incluir.some(palavra => texto.includes(normalizar(palavra)));
    const encontrouPadrao = (regra.padroes || []).some(padrao => padrao.test(texto));
    const bloqueado = regra.excluir.some(palavra => texto.includes(normalizar(palavra)));
    return (encontrouTexto || encontrouPadrao) && !bloqueado;
}

function detectarSubcategoriaHardware(produto) {
    const regraEncontrada = regrasHardware.find(regra => regraCombinaProduto(regra, produto));
    return regraEncontrada ? regraEncontrada.nome : null;
}

function ehCategoriaHardware(produto) {
    const categoria = normalizar(produto.categoria);
    const subcategoria = normalizar(produto.subcategoria);
    const grupo = normalizar(produto.grupo_hse);
    const termos = ['hardware', 'gabinete', 'placa mae', 'memoria', 'cooler', 'watercooler', 'processador', 'fonte', 'placa de video', 'ssd', 'armazenamento', 'refrigeracao', 'energia'];
    return termos.some(termo => categoria.includes(termo) || subcategoria.includes(termo) || grupo.includes(termo));
}

function classificarProdutoAutomaticamente(produto) {
    const subcategoriaDetectada = detectarSubcategoriaHardware(produto);
    if (!ehCategoriaHardware(produto) && !subcategoriaDetectada) return produto;

    const nome = normalizar(produto.nome);
    const subcategoria = subcategoriaDetectada || produto.subcategoria || 'Outros';

    produto.categoria = 'Hardware';
    produto.subcategoria = subcategoria;

    if (subcategoria === 'Gabinete') {
        produto.tipo = (nome.includes('office') || nome.includes('slim') || nome.includes('slimdesk')) ? 'Office' : 'Gamer';
    }

    return produto;
}

function ehProdutoHardware(produto) {
    return ehCategoriaHardware(produto) || Boolean(detectarSubcategoriaHardware(produto));
}

function mudarAba(abaId) {
    document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('ativa'));
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('ativo'));

    const aba = document.getElementById(`aba-${abaId}`);
    const link = document.getElementById(`link-${abaId}`);
    if (aba) aba.classList.add('ativa');
    if (link) link.classList.add('ativo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function carregarProdutos() {
    try {
        const resposta = await fetch('/api/produtos');
        const dados = await resposta.json();

        listaCompleta = dados.map(item => classificarProdutoAutomaticamente({
            ...item,
            nome: corrigirTexto(item.nome),
            categoria: corrigirTexto(item.categoria),
            preco_custo: Number(item.preco_custo) || 0,
            preco_venda: Number(item.preco_venda) || 0,
            estoque: Number(item.estoque) || 0
        }));

        montarFiltros();
        aplicarFiltros('vitrine');
        aplicarFiltros('hardware');
        atualizarPainelInterno();
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

function montarFiltros() {
    const categoriasVitrine = [...new Set(
        listaCompleta
            .filter(produto => !ehProdutoHardware(produto))
            .map(produto => produto.categoria || 'Sem categoria')
    )].sort((a, b) => normalizar(a).localeCompare(normalizar(b)));

    renderizarBotoesFiltro('vitrine', ['Todos', ...categoriasVitrine]);
    renderizarBotoesFiltro('hardware', categoriasHardwareFixas);
    renderizarSubFiltrosGabinete();
}

function renderizarBotoesFiltro(area, categorias) {
    const container = document.getElementById(area === 'vitrine' ? 'filtros-vitrine' : 'filtros-hardware');
    if (!container) return;

    container.innerHTML = '';
    categorias.forEach(categoria => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = area === 'vitrine' ? 'btn-filtro' : 'btn-filtro-dark';
        botao.textContent = categoria;
        if (normalizar(estadoFiltros[area].categoria) === normalizar(categoria)) {
            botao.classList.add('ativo');
        }
        botao.addEventListener('click', () => selecionarCategoria(area, categoria));
        container.appendChild(botao);
    });
}

function renderizarSubFiltrosGabinete() {
    const container = document.getElementById('sub-filtros-gabinete');
    if (!container) return;

    container.innerHTML = '';
    ['Todos', 'Gamer', 'Office'].forEach(tipo => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'btn-filtro-dark';
        botao.textContent = tipo;
        if (normalizar(estadoFiltros.hardware.tipo) === normalizar(tipo)) {
            botao.classList.add('ativo');
        }
        botao.addEventListener('click', () => {
            estadoFiltros.hardware.tipo = tipo;
            renderizarSubFiltrosGabinete();
            aplicarFiltros('hardware');
        });
        container.appendChild(botao);
    });

    container.style.display = normalizar(estadoFiltros.hardware.categoria) === 'gabinete' ? 'flex' : 'none';
}

function selecionarCategoria(area, categoria) {
    estadoFiltros[area].categoria = categoria;

    if (area === 'hardware') {
        estadoFiltros.hardware.tipo = 'Todos';
        renderizarBotoesFiltro('hardware', categoriasHardwareFixas);
        renderizarSubFiltrosGabinete();
    } else {
        montarFiltros();
    }

    aplicarFiltros(area);
}

function alterarOrdenacao(area, ordenacao) {
    estadoFiltros[area].ordenacao = ordenacao;
    aplicarFiltros(area);
}

function buscarHardware(event) {
    if (event) event.preventDefault();
    const campo = document.getElementById('busca-hardware');
    estadoFiltros.hardware.busca = campo ? campo.value.trim() : '';
    aplicarFiltros('hardware');
}

function limparBuscaHardware() {
    const campo = document.getElementById('busca-hardware');
    if (campo) campo.value = '';
    estadoFiltros.hardware.busca = '';
    aplicarFiltros('hardware');
}

function aplicarFiltros(area) {
    if (area === 'vitrine') {
        let produtos = listaCompleta.filter(produto => !ehProdutoHardware(produto));
        if (estadoFiltros.vitrine.categoria !== 'Todos') {
            produtos = produtos.filter(produto => normalizar(produto.categoria) === normalizar(estadoFiltros.vitrine.categoria));
        }
        renderizarAcessorios(ordenarProdutos(produtos, 'vitrine'));
        return;
    }

    let produtos = listaCompleta.filter(produto => ehProdutoHardware(produto));
    if (estadoFiltros.hardware.categoria !== 'Todos') {
        produtos = produtos.filter(produto => normalizar(produto.subcategoria || 'Outros') === normalizar(estadoFiltros.hardware.categoria));
    }
    if (normalizar(estadoFiltros.hardware.categoria) === 'gabinete' && estadoFiltros.hardware.tipo !== 'Todos') {
        produtos = produtos.filter(produto => normalizar(produto.tipo) === normalizar(estadoFiltros.hardware.tipo));
    }
    if (estadoFiltros.hardware.busca) {
        const termosBusca = normalizar(estadoFiltros.hardware.busca).split(/\s+/).filter(Boolean);
        produtos = produtos.filter(produto => {
            const textoProduto = textoClassificacaoProduto(produto);
            return termosBusca.every(termo => textoProduto.includes(termo));
        });
    }
    renderizarHardware(ordenarProdutos(produtos, 'hardware'));
}

function ordenarProdutos(produtos, area) {
    const ordenacao = estadoFiltros[area].ordenacao;
    return [...produtos].sort((a, b) => {
        if (ordenacao === 'preco-asc') return precoOrdenacao(a, area) - precoOrdenacao(b, area);
        if (ordenacao === 'preco-desc') return precoOrdenacao(b, area) - precoOrdenacao(a, area);
        return normalizar(a.nome).localeCompare(normalizar(b.nome));
    });
}

function precoOrdenacao(produto, area) {
    return Number(produto.preco_venda) || 0;
}

function renderizarAcessorios(produtos) {
    const grid = document.getElementById('grid-acessorios');
    if (!grid) return;
    grid.innerHTML = '';
    if (produtos.length === 0) {
        renderizarMensagemVazia(grid, 'Nenhum produto encontrado nesta categoria.');
        return;
    }
    produtos.forEach(produto => grid.appendChild(criarCardProduto(produto, false)));
}

function renderizarHardware(produtos) {
    const grid = document.getElementById('grid-hardware');
    if (!grid) return;
    grid.innerHTML = '';
    if (produtos.length === 0) {
        renderizarMensagemVazia(grid, 'Nenhuma peca encontrada nesta categoria.');
        return;
    }
    produtos.forEach(produto => grid.appendChild(criarCardProduto(produto, true)));
}

function renderizarMensagemVazia(grid, mensagem) {
    const aviso = document.createElement('p');
    aviso.className = 'empty-state';
    aviso.textContent = mensagem;
    grid.appendChild(aviso);
}

function criarCardProduto(produto, isHardware) {
    const card = document.createElement('article');
    card.className = 'apple-card';

    const categoria = isHardware ? (produto.subcategoria || 'Outros') : (produto.categoria || 'Sem categoria');
    const precoPrincipal = produto.preco_venda;

    card.innerHTML = `
        <div>
            <div class="produto-iniciais" aria-hidden="true">${iniciaisProduto(produto.nome)}</div>
            <p class="categoria-tag">${escaparHtml(categoria)}</p>
            <h3 title="${escaparHtml(produto.nome)}">${escaparHtml(produto.nome)}</h3>
            <p class="estoque">Estoque: ${produto.estoque} un</p>
        </div>
        <div>
            <p class="preco">${formatarMoeda(precoPrincipal)}</p>
            <button class="card-add" type="button" onclick="adicionarAoOrcamento(${produto.id})">Adicionar</button>
        </div>
    `;
    return card;
}

function iniciaisProduto(nome) {
    const palavras = normalizar(nome)
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

    if (palavras.length === 0) return 'GM';
    const primeira = palavras[0][0] || 'G';
    const segunda = palavras.length > 1 ? palavras[1][0] : (palavras[0][1] || 'M');
    return `${primeira}${segunda}`.toUpperCase();
}

function precoBaseItem(item) {
    return Number(item.preco_custo) || Number(item.preco_venda) || 0;
}

function precoVistaItem(item) {
    return precoBaseItem(item) * FATOR_AVISTA;
}

function precoParceladoItem(item) {
    return precoBaseItem(item) * FATOR_PARCELADO;
}

function adicionarAoOrcamento(id) {
    const produto = listaCompleta.find(item => Number(item.id) === Number(id));
    if (!produto) return;

    const itemExistente = orcamentoAtual.find(item => Number(item.id) === Number(id));
    if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        orcamentoAtual.push({ ...produto, quantidade: 1 });
    }

    atualizarPainelInterno();
}

function removerDoOrcamento(id) {
    const index = orcamentoAtual.findIndex(item => Number(item.id) === Number(id));
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
    const totalVistaEl = document.getElementById('total-vista');
    const totalParceladoEl = document.getElementById('total-parcelado');
    const resumoQuantidadeEl = document.getElementById('resumo-quantidade');
    if (!container) return;

    container.innerHTML = '';

    if (orcamentoAtual.length === 0) {
        container.innerHTML = '<p class="orcamento-vazio">Nenhum item adicionado.</p>';
    }

    let totalVista = 0;
    let totalParcelado = 0;
    let quantidadeTotal = 0;

    orcamentoAtual.forEach(item => {
        const subtotalProduto = item.preco_venda * item.quantidade;
        const subtotalVista = precoVistaItem(item) * item.quantidade;
        const subtotalParcelado = precoParceladoItem(item) * item.quantidade;
        totalVista += subtotalVista;
        totalParcelado += subtotalParcelado;
        quantidadeTotal += item.quantidade;

        const linha = document.createElement('div');
        linha.className = 'item-linha';
        linha.innerHTML = `
            <span class="item-sigla" aria-hidden="true">${iniciaisProduto(item.nome)}</span>
            <span class="item-info">
                <strong title="${escaparHtml(item.nome)}">${escaparHtml(item.nome)}</strong>
                <small>${item.quantidade} un - Produto ${formatarMoeda(item.preco_venda)}</small>
            </span>
            <span class="item-acoes">
                <span>${formatarMoeda(subtotalProduto)}</span>
                <button class="btn-remove" type="button" onclick="removerDoOrcamento(${item.id})" aria-label="Remover ${escaparHtml(item.nome)}">&times;</button>
            </span>
        `;
        container.appendChild(linha);
    });

    if (totalVistaEl) totalVistaEl.textContent = formatarMoeda(totalVista);
    if (totalParceladoEl) totalParceladoEl.textContent = formatarMoeda(totalParcelado);
    if (resumoQuantidadeEl) resumoQuantidadeEl.textContent = quantidadeTotal === 1 ? '1 item' : `${quantidadeTotal} itens`;
}

function abrirEspelhoCliente() {
    if (orcamentoAtual.length === 0) {
        alert('Adicione itens ao orcamento primeiro.');
        return;
    }

    const corpo = document.getElementById('tabela-cliente-corpo');
    corpo.innerHTML = '';

    let totalVista = 0;
    let totalParcelado = 0;

    orcamentoAtual.forEach(item => {
        const subtotalProduto = item.preco_venda * item.quantidade;
        const subtotalVista = precoVistaItem(item) * item.quantidade;
        const subtotalParcelado = precoParceladoItem(item) * item.quantidade;
        totalVista += subtotalVista;
        totalParcelado += subtotalParcelado;

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${escaparHtml(item.nome)}</td>
            <td>${item.quantidade}</td>
            <td>${formatarMoeda(item.preco_venda)}</td>
            <td><strong>${formatarMoeda(subtotalProduto)}</strong></td>
        `;
        corpo.appendChild(linha);
    });

    document.getElementById('cliente-total-vista').textContent = formatarMoeda(totalVista);
    document.getElementById('cliente-total-parcelado').textContent = formatarMoeda(totalParcelado);
    document.getElementById('modal-cliente').style.display = 'flex';
}

function fecharEspelhoCliente() {
    document.getElementById('modal-cliente').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', carregarProdutos);
