let listaCompleta = [];
let orcamentoAtual = [];
let descontoPercentual = 0;
let descontoValor = 0;

// MAPA INTELIGENTE: Le o nome do produto e classifica automaticamente
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

function escapeHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function normalizarNumero(valor) {
    const texto = String(valor || '').trim();
    if (!texto) return 0;

    const limpo = texto.replace(/\s/g, '').replace(/[^\d,.-]/g, '');
    if (limpo.includes(',')) {
        return Number(limpo.replace(/\./g, '').replace(',', '.')) || 0;
    }

    return Number(limpo) || 0;
}

function gerarImagemFallback(produto) {
    const subcategoria = String(produto.subcategoria || produto.categoria || 'Hardware');
    const rotulos = {
        'Processador': 'CPU',
        'Placa Mãe': 'MB',
        'Placa de Vídeo': 'GPU',
        'Memória RAM': 'RAM',
        'SSD': 'SSD',
        'Fonte ATX': 'PSU',
        'Refrigeração': 'COOL',
        'Gabinete': 'CASE'
    };
    const rotulo = rotulos[subcategoria] || 'PC';
    const titulo = subcategoria.replace(/[<>&"']/g, '').slice(0, 18).toUpperCase();
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
            <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stop-color="#1f6feb"/>
                    <stop offset="1" stop-color="#10233f"/>
                </linearGradient>
            </defs>
            <rect width="320" height="240" rx="20" fill="#11151c"/>
            <rect x="28" y="28" width="264" height="184" rx="18" fill="url(#g)" opacity="0.28"/>
            <rect x="78" y="58" width="164" height="104" rx="16" fill="#172033" stroke="#6ab7ff" stroke-width="4"/>
            <g stroke="#6ab7ff" stroke-width="6" stroke-linecap="round" opacity="0.9">
                <path d="M72 82H48M72 116H48M72 150H48M248 82h24M248 116h24M248 150h24"/>
                <path d="M112 52V34M160 52V34M208 52V34M112 186v20M160 186v20M208 186v20"/>
            </g>
            <text x="160" y="119" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="800" fill="#f4f7fb">${rotulo}</text>
            <text x="160" y="204" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#a7b0c0">${titulo}</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function obterImagemProduto(produto) {
    const imagem = String(produto.imagem || '').trim();
    if (!imagem || imagem.includes('via.placeholder.com')) {
        return gerarImagemFallback(produto);
    }

    return imagem;
}

function classificarProdutoAutomaticamente(produto) {
    if (!produto.nome) return produto;

    const nomeStr = produto.nome.toLowerCase();
    const catStr = (produto.categoria || '').toLowerCase();

    if (catStr.includes('hardware') || ehProdutoHardware(produto)) {
        produto.categoria = 'Hardware';
        produto.subcategoria = 'Outros';

        for (const [subcat, palavras] of Object.entries(mapaCategorias)) {
            const encontrou = palavras.incluir.some(palavra => {
                const p = palavra.toLowerCase();

                if (p === 'ram') {
                    return nomeStr.includes('ram ') || nomeStr.endsWith('ram') || nomeStr.includes(' memoria');
                }

                return nomeStr.includes(p);
            });

            const bloqueado = palavras.excluir.some(palavra => nomeStr.includes(palavra.toLowerCase()));

            if (encontrou && !bloqueado) {
                produto.subcategoria = subcat;
                break;
            }
        }

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

function ehProdutoHardware(produto) {
    if (!produto.categoria) return false;

    const cat = produto.categoria.trim().toLowerCase();
    const palavrasHardware = ['hardware', 'gabinete', 'gabinetes', 'placa mãe', 'memória', 'cooler', 'watercooler', 'processador', 'fonte', 'placa de vídeo', 'ssd', 'armazenamento', 'refrigeração', 'energia'];
    return palavrasHardware.some(palavra => cat.includes(palavra));
}

function mudarAba(abaId) {
    document.querySelectorAll('.aba-conteudo').forEach(aba => aba.classList.remove('ativa'));
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('ativo'));

    document.getElementById(`aba-${abaId}`).classList.add('ativa');
    document.getElementById(`link-${abaId}`).classList.add('ativo');
}

async function carregarProdutos() {
    try {
        const resposta = await fetch('/api/produtos');
        const dados = await resposta.json();

        listaCompleta = dados.map(item => classificarProdutoAutomaticamente(item));

        const btnTodosClaro = document.querySelector('.btn-filtro.ativo');
        const btnTodosDark = document.querySelector('.btn-filtro-dark.ativo');

        if (btnTodosClaro) filtrarProdutosGerais('Todos', btnTodosClaro);
        if (btnTodosDark) filtrarHardware('Todos', btnTodosDark);
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

function renderizarAcessorios(produtos) {
    const grid = document.getElementById('grid-acessorios');
    if (!grid) return;

    grid.innerHTML = '';
    const itens = produtos.filter(produto => !ehProdutoHardware(produto));

    if (itens.length === 0) {
        grid.innerHTML = '<div class="estado-vazio">Nenhum produto encontrado nesta categoria.</div>';
        return;
    }

    itens.forEach(produto => grid.appendChild(criarCardProduto(produto, false)));
}

function renderizarHardware(produtos) {
    const grid = document.getElementById('grid-hardware');
    if (!grid) return;

    grid.innerHTML = '';
    const itens = produtos.filter(produto => ehProdutoHardware(produto));

    if (itens.length === 0) {
        grid.innerHTML = '<div class="estado-vazio">Nenhum componente encontrado neste filtro.</div>';
        return;
    }

    itens.forEach(produto => grid.appendChild(criarCardProduto(produto, true)));
}

function criarCardProduto(produto, isDark) {
    const card = document.createElement('div');
    const nome = escapeHtml(produto.nome);
    const categoria = escapeHtml(produto.subcategoria || produto.categoria || 'Sem categoria');
    const estoque = Number(produto.estoque || 0);
    const precoVenda = Number(produto.preco_venda || 0);
    const imagem = escapeHtml(obterImagemProduto(produto));
    const imagemFallback = escapeHtml(gerarImagemFallback(produto));
    const semEstoque = estoque <= 0;

    card.className = 'apple-card';
    card.innerHTML = `
        <div>
            <p class="categoria-tag" style="${isDark ? 'color:#6ab7ff;' : ''}">${categoria}</p>
            <h3 title="${nome}">${nome}</h3>
            <span class="estoque-tag">Estoque: ${estoque} un</span>
        </div>
        <img src="${imagem}" alt="${nome}" onerror="this.onerror=null;this.src='${imagemFallback}'">
        <div>
            <p class="preco">R$ ${formatarMoeda(precoVenda)}</p>
            <button class="btn-apple-primary" style="margin-top: 14px;" onclick="adicionarAoOrcamento(${produto.id})" ${semEstoque ? 'disabled' : ''}>${semEstoque ? 'Sem estoque' : 'Adicionar'}</button>
        </div>
    `;

    return card;
}

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
    document.querySelectorAll('#sub-filtros-gabinete .btn-filtro-dark').forEach(btn => btn.classList.remove('ativo'));
    btnElement.classList.add('ativo');

    let filtrados = listaCompleta.filter(p =>
        ehProdutoHardware(p) &&
        p.subcategoria &&
        p.subcategoria.toLowerCase() === subcategoria.toLowerCase()
    );

    if (tipoPesquisa !== 'Todos') {
        filtrados = filtrados.filter(p => p.tipo && p.tipo.toLowerCase() === tipoPesquisa.toLowerCase());
    }

    renderizarHardware(filtrados);
}

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

function alterarQuantidade(id, delta) {
    const item = orcamentoAtual.find(produto => produto.id === id);
    if (!item) return;

    item.quantidade += delta;
    if (item.quantidade <= 0) {
        removerItemOrcamento(id);
        return;
    }

    atualizarPainelInterno();
}

function removerDoOrcamento(id) {
    alterarQuantidade(id, -1);
}

function removerItemOrcamento(id) {
    orcamentoAtual = orcamentoAtual.filter(item => item.id !== id);
    atualizarPainelInterno();
}

function atualizarDesconto() {
    const campoPercentual = document.getElementById('desconto-percentual');
    const campoValor = document.getElementById('desconto-valor');

    descontoPercentual = Math.min(Math.max(normalizarNumero(campoPercentual?.value), 0), 100);
    descontoValor = Math.max(normalizarNumero(campoValor?.value), 0);

    atualizarPainelInterno();
}

function calcularTotais() {
    const totalCusto = orcamentoAtual.reduce((total, item) => total + (Number(item.preco_custo || 0) * item.quantidade), 0);
    const subtotalVenda = orcamentoAtual.reduce((total, item) => total + (Number(item.preco_venda || 0) * item.quantidade), 0);
    const descontoPorPercentual = subtotalVenda * (descontoPercentual / 100);
    const totalDesconto = Math.min(subtotalVenda, descontoPorPercentual + descontoValor);
    const totalFinal = Math.max(subtotalVenda - totalDesconto, 0);
    const lucro = totalFinal - totalCusto;
    const margem = totalFinal > 0 ? (lucro / totalFinal) * 100 : 0;

    return {
        totalCusto,
        subtotalVenda,
        totalDesconto,
        totalFinal,
        lucro,
        margem
    };
}

function atualizarPainelInterno() {
    const container = document.getElementById('itens-orcamento');
    if (!container) return;

    container.innerHTML = '';

    if (orcamentoAtual.length === 0) {
        container.innerHTML = '<div class="orcamento-vazio">Nenhum item adicionado ao orçamento.</div>';
    }

    orcamentoAtual.forEach(item => {
        const nome = escapeHtml(item.nome);
        const precoVenda = Number(item.preco_venda || 0);
        const precoCusto = Number(item.preco_custo || 0);
        const subtotal = precoVenda * item.quantidade;
        const imagem = escapeHtml(obterImagemProduto(item));
        const imagemFallback = escapeHtml(gerarImagemFallback(item));
        const linha = document.createElement('div');

        linha.className = 'item-linha';
        linha.innerHTML = `
            <div class="item-info">
                <img class="item-thumb" src="${imagem}" alt="${nome}" onerror="this.onerror=null;this.src='${imagemFallback}'">
                <div class="item-text">
                    <strong title="${nome}">${nome}</strong>
                    <span>Unitario R$ ${formatarMoeda(precoVenda)} | Custo R$ ${formatarMoeda(precoCusto)}</span>
                </div>
            </div>
            <div class="item-actions">
                <strong class="item-subtotal">R$ ${formatarMoeda(subtotal)}</strong>
                <div class="qtd-controle">
                    <button class="btn-qtd" onclick="alterarQuantidade(${item.id}, -1)" aria-label="Diminuir quantidade">-</button>
                    <span>${item.quantidade}</span>
                    <button class="btn-qtd" onclick="alterarQuantidade(${item.id}, 1)" aria-label="Aumentar quantidade">+</button>
                    <button class="btn-remove" onclick="removerItemOrcamento(${item.id})" aria-label="Remover item">&times;</button>
                </div>
            </div>
        `;

        container.appendChild(linha);
    });

    const totais = calcularTotais();
    const quantidadeItens = orcamentoAtual.reduce((total, item) => total + item.quantidade, 0);

    document.getElementById('contador-itens').innerText = quantidadeItens === 1 ? '1 item' : `${quantidadeItens} itens`;
    document.getElementById('subtotal-venda').innerText = formatarMoeda(totais.subtotalVenda);
    document.getElementById('total-desconto').innerText = formatarMoeda(totais.totalDesconto);
    document.getElementById('total-custo').innerText = formatarMoeda(totais.totalCusto);
    document.getElementById('total-venda').innerText = formatarMoeda(totais.totalFinal);
    document.getElementById('total-lucro').innerText = formatarMoeda(totais.lucro);
    document.getElementById('margem-lucro').innerText = totais.margem.toFixed(1).replace('.', ',');
}

function limparOrcamento() {
    if (orcamentoAtual.length === 0) return;

    const confirmar = confirm('Limpar todos os itens do orçamento?');
    if (!confirmar) return;

    orcamentoAtual = [];
    atualizarPainelInterno();
}

function abrirEspelhoCliente() {
    if (orcamentoAtual.length === 0) {
        alert('Adicione itens ao orçamento primeiro.');
        return;
    }

    const corpo = document.getElementById('tabela-cliente-corpo');
    const totais = calcularTotais();

    corpo.innerHTML = '';
    orcamentoAtual.forEach(item => {
        const nome = escapeHtml(item.nome);
        const sub = Number(item.preco_venda || 0) * item.quantidade;

        corpo.innerHTML += `
            <tr>
                <td>${nome}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${formatarMoeda(item.preco_venda)}</td>
                <td><b>R$ ${formatarMoeda(sub)}</b></td>
            </tr>
        `;
    });

    document.getElementById('cliente-subtotal').innerText = formatarMoeda(totais.subtotalVenda);
    document.getElementById('cliente-desconto').innerText = formatarMoeda(totais.totalDesconto);
    document.getElementById('cliente-total-final').innerText = formatarMoeda(totais.totalFinal);
    document.getElementById('modal-cliente').style.display = 'flex';
}

function fecharEspelhoCliente() {
    document.getElementById('modal-cliente').style.display = 'none';
}

window.onload = () => {
    carregarProdutos();
    atualizarPainelInterno();
};
