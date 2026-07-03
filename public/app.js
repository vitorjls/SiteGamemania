let listaCompleta = [];
let orcamentoAtual = [];

const FATOR_AVISTA = 1.6;
const FATOR_PARCELADO = 1.7;

const estadoFiltros = {
    vitrine: { categoria: 'Todos', ordenacao: 'nome-az' },
    hardware: { categoria: 'Todos', tipo: 'Todos', ordenacao: 'estoque-custo', busca: '' }
};

const wizardState = {
    ativo: false,
    etapa: 0,
    plataforma: null
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

const presetsGamemania = [
    {
        id: 'base-5500',
        nome: '5500 sem GPU',
        subtitulo: 'BASE GAMER MELHOR CUSTO',
        itens: [
            { termos: ['processador', 'ryzen 5 5500'], quantidade: 1 },
            { termos: ['memoria', 'ddr4', 'goldkey'], quantidade: 2 },
            { termos: ['ssd', 'hawking', '480gb'], quantidade: 1 },
            { termos: ['gabinete', 'bg-064', 'pure', 'preto'], quantidade: 1 },
            { termos: ['kit', '3 fans', 'preto', 'k06argb'], quantidade: 1 },
            { termos: ['fonte', 'dn700', '700w'], quantidade: 1 },
            { termos: ['asus', 'prime', 'a520m'], quantidade: 1 }
        ]
    },
    {
        id: 'base-5700',
        nome: '5700 Base Alto Padr\u00e3o',
        subtitulo: 'Ryzen 7 sem GPU',
        itens: [
            { termos: ['processador', 'ryzen 7 5700x'], quantidade: 1 },
            { termos: ['memoria', 'ddr4', 'goldkey'], quantidade: 2 },
            { termos: ['ssd', 'hawking', '480gb'], quantidade: 1 },
            { termos: ['gabinete', 'bg-064', 'pure', 'preto'], quantidade: 1 },
            { termos: ['kit', '3 fans', 'preto', 'k06argb'], quantidade: 1 },
            { termos: ['fonte', 'dn700', '700w'], quantidade: 1 },
            { termos: ['asus', 'prime', 'a520m'], quantidade: 1 }
        ]
    },
    {
        id: 'vega-5600gt',
        nome: 'Ryzen com VEGA 5600GT',
        subtitulo: 'APU com Radeon integrada',
        itens: [
            { termos: ['memoria', 'ddr4', 'goldkey'], quantidade: 2 },
            { termos: ['ssd', 'hawking', '480gb'], quantidade: 1 },
            { termos: ['gabinete', 'bg-064', 'pure', 'preto'], quantidade: 1 },
            { termos: ['kit', '3 fans', 'preto', 'k06argb'], quantidade: 1 },
            { termos: ['processador', 'ryzen 5 5600gt'], quantidade: 1 },
            { termos: ['asus', 'prime', 'a520m'], quantidade: 1 },
            { termos: ['fonte', 'blu600-atps2'], quantidade: 1 }
        ]
    }
];

const etapasAssistente = [
    {
        id: 'gabinete',
        titulo: 'Escolha o gabinete',
        ajuda: 'Comece pela apar\u00eancia e espa\u00e7o interno. Estes s\u00e3o modelos comuns da loja.',
        categoriaLivre: 'Gabinete',
        tipo: 'termos',
        opcoes: [
            ['gabinete', 'bg-064', 'pure', 'branco'],
            ['gabinete', 'bg-064', 'pure', 'preto'],
            ['gabinete', 'bg-050', 'x-frame', 'preto'],
            ['gabinete', 'bg-050', 'x-frame', 'branco'],
            ['gabinete', 'arbaton', 'draxen']
        ]
    },
    {
        id: 'processador',
        titulo: 'Escolha o processador',
        ajuda: 'A escolha do processador define quais placas-m\u00e3e ser\u00e3o sugeridas na pr\u00f3xima etapa.',
        categoriaLivre: 'Processador',
        tipo: 'processador',
        opcoes: [
            { label: 'Ryzen 5 5500', termos: ['processador', 'ryzen 5 5500'], plataforma: 'ryzen' },
            { label: 'Ryzen 7 5700X', termos: ['processador', 'ryzen 7 5700x'], plataforma: 'ryzen' },
            { label: 'Ryzen 5 5600GT', termos: ['processador', 'ryzen 5 5600gt'], plataforma: 'ryzen' },
            { label: 'Ryzen 5 4600G', termos: ['processador', 'ryzen 5 4600g'], plataforma: 'ryzen' },
            { label: 'Intel Core i5 12600K', termos: ['processador', 'i5', '12600'], plataforma: 'intel' }
        ]
    },
    {
        id: 'placa-mae',
        titulo: 'Escolha a placa-m\u00e3e',
        ajuda: 'As op\u00e7\u00f5es mudam conforme o processador escolhido.',
        categoriaLivre: 'Placa M\u00e3e',
        tipo: 'placa-mae'
    },
    {
        id: 'cooler',
        titulo: 'Cooler',
        ajuda: 'Escolha um cooler quando o processador ou o gabinete pedir uma refrigera\u00e7\u00e3o melhor.',
        categoriaLivre: 'Refrigera\u00e7\u00e3o',
        tipo: 'categoria',
        subcategoria: 'Refrigera\u00e7\u00e3o',
        limite: 5
    },
    {
        id: 'memoria',
        titulo: 'Mem\u00f3ria RAM',
        ajuda: 'Para setups gamer, 2 pentes costumam ser uma boa base. Voc\u00ea pode adicionar mais de uma unidade.',
        categoriaLivre: 'Mem\u00f3ria RAM',
        tipo: 'categoria',
        subcategoria: 'Mem\u00f3ria RAM',
        limite: 5
    },
    {
        id: 'ssd',
        titulo: 'SSD',
        ajuda: 'Priorize SSDs com bom estoque e custo equilibrado.',
        categoriaLivre: 'SSD',
        tipo: 'categoria',
        subcategoria: 'SSD',
        limite: 5
    },
    {
        id: 'fonte',
        titulo: 'Fonte',
        ajuda: 'A fonte precisa acompanhar a configura\u00e7\u00e3o, principalmente se houver placa de v\u00eddeo dedicada.',
        categoriaLivre: 'Fonte ATX',
        tipo: 'categoria',
        subcategoria: 'Fonte ATX',
        limite: 5
    },
    {
        id: 'fans',
        titulo: 'Fans adicionais',
        ajuda: 'Fans ajudam na temperatura e tamb\u00e9m no visual do gabinete.',
        categoriaLivre: 'Refrigera\u00e7\u00e3o',
        tipo: 'busca',
        busca: ['fan'],
        limite: 5
    },
    {
        id: 'wifi',
        titulo: 'Placa Wi-Fi',
        ajuda: 'Adicione Wi-Fi quando a placa-m\u00e3e n\u00e3o tiver rede sem fio integrada.',
        categoriaLivre: 'Todos',
        tipo: 'busca',
        busca: ['wifi'],
        limite: 5
    }
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

function arredondarParaFinal999(valor) {
    const numero = Number(valor) || 0;
    if (numero <= 0) return 0;
    return Number((Math.ceil((numero + 0.01) / 10) * 10 - 0.01).toFixed(2));
}

const slotsComputadorVirtual = [
    { id: 'gabinete', label: 'Gabinete', match: produto => normalizar(produto.subcategoria) === 'gabinete' },
    { id: 'placa-mae', label: 'Placa-mae', match: produto => normalizar(produto.subcategoria) === 'placa mae' },
    { id: 'processador', label: 'Processador', match: produto => normalizar(produto.subcategoria) === 'processador' },
    { id: 'memoria', label: 'Memoria RAM', match: produto => normalizar(produto.subcategoria) === 'memoria ram' },
    { id: 'ssd', label: 'SSD', match: produto => normalizar(produto.subcategoria) === 'ssd' },
    { id: 'fonte', label: 'Fonte', match: produto => normalizar(produto.subcategoria) === 'fonte atx' },
    {
        id: 'cooler',
        label: 'Cooler',
        match: produto => {
            const texto = textoClassificacaoProduto(produto);
            return normalizar(produto.subcategoria) === 'refrigeracao' && (texto.includes('cooler') || texto.includes('water'));
        }
    },
    {
        id: 'fans',
        label: 'Fans',
        match: produto => {
            const texto = textoClassificacaoProduto(produto);
            return texto.includes('fan') || texto.includes('ventoinha');
        }
    },
    {
        id: 'wifi',
        label: 'Wi-Fi',
        match: produto => {
            const texto = textoClassificacaoProduto(produto);
            return texto.includes('wifi') || texto.includes('wi-fi') || texto.includes('wireless');
        }
    },
    { id: 'gpu', label: 'GPU', match: produto => normalizar(produto.subcategoria) === 'placa de video' }
];

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
        montarPresetsGamemania();
        aplicarFiltros('vitrine');
        aplicarFiltros('hardware');
        atualizarPainelInterno();
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

function montarPresetsGamemania() {
    const container = document.getElementById('presets-gamemania');
    if (!container) return;

    container.innerHTML = '';
    presetsGamemania.forEach(preset => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'preset-button';
        botao.innerHTML = `
            <strong>${escaparHtml(preset.nome)}</strong>
            <span>${escaparHtml(preset.subtitulo)}</span>
        `;
        botao.addEventListener('click', () => carregarPresetGamemania(preset.id));
        container.appendChild(botao);
    });
}

function carregarPresetGamemania(presetId) {
    const preset = presetsGamemania.find(item => item.id === presetId);
    if (!preset) return;

    orcamentoAtual = [];
    const faltantes = [];

    preset.itens.forEach(config => {
        const produto = buscarProdutoPorTermos(config.termos);
        if (!produto) {
            faltantes.push(config.termos.join(' '));
            return;
        }
        adicionarProdutoAoOrcamento(produto, config.quantidade || 1);
    });

    atualizarPainelInterno();
    const status = document.getElementById('preset-status');
    if (status) {
        status.textContent = faltantes.length
            ? `Configura\u00e7\u00e3o carregada, mas n\u00e3o encontrei: ${faltantes.join(', ')}.`
            : `${preset.nome} carregado no or\u00e7amento.`;
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

function iniciarAssistente() {
    wizardState.ativo = true;
    wizardState.etapa = 0;
    wizardState.plataforma = null;
    const box = document.getElementById('wizard-box');
    if (box) box.style.display = 'block';
    renderizarEtapaAssistente();
}

function fecharAssistente() {
    wizardState.ativo = false;
    const box = document.getElementById('wizard-box');
    if (box) box.style.display = 'none';
}

function voltarEtapaAssistente() {
    if (!wizardState.ativo || wizardState.etapa === 0) return;
    wizardState.etapa -= 1;
    renderizarEtapaAssistente();
}

function pularEtapaAssistente() {
    if (!wizardState.ativo) return;
    wizardState.etapa += 1;
    renderizarEtapaAssistente();
}

function abrirListaLivreAssistente() {
    const etapa = etapasAssistente[wizardState.etapa];
    if (!etapa) return;

    estadoFiltros.hardware.categoria = etapa.categoriaLivre || 'Todos';
    estadoFiltros.hardware.tipo = 'Todos';
    estadoFiltros.hardware.busca = etapa.tipo === 'busca' ? (etapa.busca || []).join(' ') : '';
    const campo = document.getElementById('busca-hardware');
    if (campo) campo.value = estadoFiltros.hardware.busca;
    renderizarBotoesFiltro('hardware', categoriasHardwareFixas);
    renderizarSubFiltrosGabinete();
    aplicarFiltros('hardware');
    document.getElementById('grid-hardware')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderizarEtapaAssistente() {
    const progress = document.getElementById('wizard-progress');
    const titulo = document.getElementById('wizard-title');
    const ajuda = document.getElementById('wizard-help');
    const options = document.getElementById('wizard-options');
    if (!progress || !titulo || !ajuda || !options) return;

    if (wizardState.etapa >= etapasAssistente.length) {
        progress.textContent = 'Montagem conclu\u00edda';
        titulo.textContent = 'Base montada';
        ajuda.textContent = 'Revise o or\u00e7amento ao lado e continue personalizando pela lista de produtos quando quiser.';
        options.innerHTML = '<button class="wizard-option primary" type="button" onclick="fecharAssistente()">Finalizar</button>';
        return;
    }

    const etapa = etapasAssistente[wizardState.etapa];
    const produtos = obterProdutosEtapaAssistente(etapa);

    progress.textContent = `Etapa ${wizardState.etapa + 1} de ${etapasAssistente.length}`;
    titulo.textContent = etapa.titulo;
    ajuda.textContent = etapa.ajuda;
    options.innerHTML = '';

    if (produtos.length === 0) {
        options.innerHTML = '<p class="wizard-empty">N\u00e3o encontrei sugest\u00f5es autom\u00e1ticas para esta etapa. Use selecionar outros ou pule.</p>';
        return;
    }

    produtos.forEach(item => {
        const produto = item.produto || item;
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'wizard-option';
        botao.innerHTML = `
            <strong>${escaparHtml(item.label || produto.nome)}</strong>
            <span>Estoque ${produto.estoque} un - ${formatarMoeda(produto.preco_venda)}</span>
        `;
        botao.addEventListener('click', () => selecionarProdutoAssistente(etapa, item));
        options.appendChild(botao);
    });
}

function obterProdutosEtapaAssistente(etapa) {
    if (etapa.tipo === 'termos') {
        return etapa.opcoes
            .map(termos => buscarProdutoPorTermos(termos))
            .filter(Boolean);
    }

    if (etapa.tipo === 'processador') {
        return etapa.opcoes
            .map(opcao => {
                const produto = buscarProdutoPorTermos(opcao.termos);
                return produto ? { ...opcao, produto } : null;
            })
            .filter(Boolean);
    }

    if (etapa.tipo === 'placa-mae') {
        const termos = wizardState.plataforma === 'intel'
            ? [['h610'], ['lga1700'], ['intel 1700']]
            : [['a520']];
        const encontrados = termos.flatMap(grupo => buscarProdutosPorTermos(grupo, 20))
            .filter(produto => normalizar(produto.subcategoria) === normalizar('Placa M\u00e3e'));
        return removerDuplicadosPorId(ordenarPorEstoqueECusto(encontrados));
    }

    if (etapa.tipo === 'categoria') {
        return ordenarPorEstoqueECusto(listaCompleta.filter(produto =>
            ehProdutoHardware(produto) &&
            normalizar(produto.subcategoria || 'Outros') === normalizar(etapa.subcategoria)
        )).slice(0, etapa.limite || 5);
    }

    if (etapa.tipo === 'busca') {
        return buscarProdutosPorTermos(etapa.busca, etapa.limite || 5);
    }

    return [];
}

function removerDuplicadosPorId(produtos) {
    const vistos = new Set();
    return produtos.filter(produto => {
        if (vistos.has(produto.id)) return false;
        vistos.add(produto.id);
        return true;
    });
}

function obterQuantidadeAssistente(etapa) {
    if (etapa.id !== 'memoria') return 1;

    const resposta = window.prompt('Quantas unidades de memoria RAM deseja adicionar?', '2');
    if (resposta === null) return null;

    const quantidade = Number.parseInt(resposta, 10);
    if (!Number.isFinite(quantidade) || quantidade < 1) return 1;
    return Math.min(quantidade, 8);
}

function selecionarProdutoAssistente(etapa, item) {
    const produto = item.produto || item;
    if (!produto) return;
    const quantidade = obterQuantidadeAssistente(etapa);
    if (!quantidade) return;

    adicionarProdutoAoOrcamento(produto, quantidade);
    atualizarPainelInterno();

    if (etapa.id === 'processador') {
        wizardState.plataforma = item.plataforma || (normalizar(produto.nome).includes('intel') ? 'intel' : 'ryzen');
    }
    wizardState.etapa += 1;
    renderizarEtapaAssistente();
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

function ordenarPorEstoqueECusto(produtos) {
    return [...produtos].sort((a, b) => {
        const estoqueDiff = (Number(b.estoque) || 0) - (Number(a.estoque) || 0);
        if (estoqueDiff !== 0) return estoqueDiff;
        const custoDiff = precoBaseItem(a) - precoBaseItem(b);
        if (custoDiff !== 0) return custoDiff;
        return normalizar(a.nome).localeCompare(normalizar(b.nome));
    });
}

function produtoContemTermos(produto, termos) {
    const texto = textoClassificacaoProduto(produto);
    return termos.map(normalizar).every(termo => texto.includes(termo));
}

function buscarProdutoPorTermos(termos) {
    return ordenarPorEstoqueECusto(listaCompleta.filter(produto => produtoContemTermos(produto, termos)))[0] || null;
}

function buscarProdutosPorTermos(termos, limite = 5) {
    return ordenarPorEstoqueECusto(listaCompleta.filter(produto => produtoContemTermos(produto, termos))).slice(0, limite);
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
        if (ordenacao === 'estoque-custo') {
            const estoqueDiff = (Number(b.estoque) || 0) - (Number(a.estoque) || 0);
            if (estoqueDiff !== 0) return estoqueDiff;
            const custoDiff = precoBaseItem(a) - precoBaseItem(b);
            if (custoDiff !== 0) return custoDiff;
            return normalizar(a.nome).localeCompare(normalizar(b.nome));
        }
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
            ${criarVisualProduto(produto)}
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

function criarVisualProduto(produto) {
    const marca = identificarVisualProduto(produto);
    if (!marca) {
        return `<div class="produto-iniciais" aria-hidden="true">${iniciaisProduto(produto.nome)}</div>`;
    }

    return `
        <div class="produto-visual ${marca.classe}" aria-label="${escaparHtml(marca.rotulo)}">
            <span>${escaparHtml(marca.linha1)}</span>
            <strong>${escaparHtml(marca.linha2)}</strong>
        </div>
    `;
}

function identificarVisualProduto(produto) {
    const texto = textoClassificacaoProduto(produto);

    if (texto.includes('ryzen 7')) {
        return { classe: 'brand-ryzen', rotulo: 'AMD Ryzen 7', linha1: 'AMD', linha2: 'RYZEN 7' };
    }
    if (texto.includes('ryzen 5')) {
        return { classe: 'brand-ryzen', rotulo: 'AMD Ryzen 5', linha1: 'AMD', linha2: 'RYZEN 5' };
    }
    if (texto.includes('rtx') || texto.includes('geforce') || texto.includes('nvidia')) {
        return { classe: 'brand-nvidia', rotulo: 'Nvidia GeForce RTX', linha1: 'GEFORCE', linha2: 'RTX' };
    }
    if (texto.includes('radeon') || /(^|[^a-z0-9])rx\s?\d{3,4}/.test(texto)) {
        return { classe: 'brand-radeon', rotulo: 'AMD Radeon', linha1: 'AMD', linha2: 'RADEON' };
    }
    if (texto.includes('nvme') || texto.includes('m.2') || texto.includes('m2 pcle') || texto.includes('pcie')) {
        return { classe: 'brand-nvme', rotulo: 'NVMe', linha1: 'M.2', linha2: 'NVMe' };
    }
    if (texto.includes('ssd')) {
        return { classe: 'brand-ssd', rotulo: 'SSD', linha1: 'STORAGE', linha2: 'SSD' };
    }

    return null;
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
    adicionarProdutoAoOrcamento(produto, 1);
    atualizarPainelInterno();
}

function adicionarProdutoAoOrcamento(produto, quantidade = 1) {
    const itemExistente = orcamentoAtual.find(item => Number(item.id) === Number(produto.id));
    const qtd = Number(quantidade) || 1;
    if (itemExistente) {
        itemExistente.quantidade += qtd;
    } else {
        orcamentoAtual.push({ ...produto, quantidade: qtd });
    }
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

function limparOrcamento() {
    orcamentoAtual = [];
    atualizarPainelInterno();
}

function atualizarComputadorVirtual() {
    slotsComputadorVirtual.forEach(slot => {
        const elemento = document.getElementById(`pc-slot-${slot.id}`);
        if (!elemento) return;

        const item = orcamentoAtual.find(produto => slot.match(produto));
        elemento.classList.toggle('ativo', Boolean(item));
        elemento.innerHTML = `
            <span>${slot.label}</span>
            <strong>${item ? escaparHtml(item.nome) : 'Aguardando'}</strong>
        `;
    });
}

function atualizarPainelInterno() {
    const container = document.getElementById('itens-orcamento');
    const totalVistaEl = document.getElementById('total-vista');
    const totalParceladoEl = document.getElementById('total-parcelado');
    const resumoQuantidadeEl = document.getElementById('resumo-quantidade');
    if (!container) {
        atualizarComputadorVirtual();
        return;
    }

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

    const totalVistaFinal = arredondarParaFinal999(totalVista);
    const totalParceladoFinal = arredondarParaFinal999(totalParcelado);

    if (totalVistaEl) totalVistaEl.textContent = formatarMoeda(totalVistaFinal);
    if (totalParceladoEl) totalParceladoEl.textContent = formatarMoeda(totalParceladoFinal);
    if (resumoQuantidadeEl) resumoQuantidadeEl.textContent = quantidadeTotal === 1 ? '1 item' : `${quantidadeTotal} itens`;
    atualizarComputadorVirtual();
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
        const subtotalVista = precoVistaItem(item) * item.quantidade;
        const subtotalParcelado = precoParceladoItem(item) * item.quantidade;
        totalVista += subtotalVista;
        totalParcelado += subtotalParcelado;

        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${escaparHtml(item.nome)}</td>
            <td>${item.quantidade}</td>
        `;
        corpo.appendChild(linha);
    });

    document.getElementById('cliente-total-vista').textContent = formatarMoeda(arredondarParaFinal999(totalVista));
    document.getElementById('cliente-total-parcelado').textContent = formatarMoeda(arredondarParaFinal999(totalParcelado));
    document.getElementById('modal-cliente').style.display = 'flex';
}

function fecharEspelhoCliente() {
    document.getElementById('modal-cliente').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', carregarProdutos);
