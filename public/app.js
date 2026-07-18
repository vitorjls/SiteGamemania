let listaCompleta = [];
let orcamentoAtual = [];
let totaisOrcamentoServidor = { quantidadeTotal: 0, totalNormal: 0, totalVista: 0, totalParcelado: 0 };
let versaoCalculoOrcamento = 0;
let modoDescontoOrcamento = 'normal';
let margensOrcamento = { vista: 60, parcelado: 70 };
let mostrarValoresItensOrcamento = false;

const estadoFiltros = {
    vitrine: { categoria: 'Todos', subcategoria: 'Todos', ordenacao: 'nome-az', busca: '' },
    hardware: { categoria: 'Todos', tipo: 'Todos', ordenacao: 'estoque-custo', busca: '' }
};

const wizardState = {
    ativo: false,
    etapa: 0,
    plataforma: null
};

const LIMITE_SUGESTOES_ASSISTENTE = 10;

const regrasHardware = [
    {
        nome: 'Processador',
        incluir: ['core i3', 'core i5', 'core i7', 'core i9', 'xeon', 'pentium', 'celeron', 'intel core', 'ryzen 3', 'ryzen 5', 'ryzen 7', 'ryzen 9', 'athlon', 'processador', 'cpu'],
        padroes: [
            /(^|[^a-z0-9])i[3579][-\s]?\d{3,5}[a-z]{0,3}([^a-z0-9]|$)/,
            /(^|[^a-z0-9])ryzen\s?[3579]\s?\d{3,5}[a-z]{0,3}([^a-z0-9]|$)/
        ],
        excluir: ['cooler', 'air cooler', 'water', 'watercooler', 'fan', 'ventoinha', 'pasta', 'dissipador', 'heatsink', 'suporte', 'espelho', 'base', 'placa']
    },
    {
        nome: 'Placa M\u00e3e',
        incluir: ['h61', 'h81', 'h110', 'h310', 'h410', 'h510', 'h610', 'h710', 'b75', 'b85', 'b150', 'b250', 'b360', 'b365', 'b460', 'b560', 'b660', 'b760', 'z97', 'z170', 'z270', 'z370', 'z390', 'z490', 'z590', 'z690', 'z790', 'lga1155', 'lga1150', 'lga1151', 'lga1200', 'lga1700', 'a320', 'a520', 'b350', 'b450', 'b550', 'b650', 'x370', 'x470', 'x570', 'x670', 'am3', 'am4', 'am5', 'placa mae', 'motherboard', 'mainboard'],
        padroes: [
            /(^|[^a-z0-9])(h|b|z|a|x)\d{2,3}[a-z0-9-]*([^a-z0-9]|$)/
        ],
        excluir: ['espelho', 'processador', 'memoria', 'cooler', 'video', 'gpu', 'rtx', 'gtx', 'radeon', 'geforce', 'gddr', 'parafuso', 'cabo', 'suporte']
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
        excluir: ['placa mae', 'placa de video', 'cooler', 'dissipador', 'adaptador', 'hd', 'ssd', 'video', 'fonte', 'gabinete', 'cartao', 'card', 'pendrive', 'pen drive']
    },
    {
        nome: 'Rede / Wi-Fi',
        incluir: ['placa wifi', 'placa wi-fi', 'wireless pci', 'pci wireless', 'dual band', 'tl-wn', 'wn881', 'adaptador pci wireless'],
        excluir: ['fone', 'headset', 'mouse', 'teclado', 'controle', 'caixa de som']
    },
    {
        nome: 'SSD',
        incluir: ['ssd', 'nvme', 'sata iii', 'sata3', 'm.2', 'm2 pcie', 'm2 pcle', 'kingfast', 'keepdata', 'hiksemi', 'crucial', 'kingston snv', 'wd green'],
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
        excluir: ['gabinete', 'fonte']
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
    'Rede / Wi-Fi',
    'Refrigera\u00e7\u00e3o',
    'Gabinete',
    'Outros'
];

const caminhosCatalogoHardware = {
    'Processador': 'Computador > Componentes > Processadores',
    'Placa M\u00e3e': 'Computador > Componentes > Placas-mae',
    'Mem\u00f3ria RAM': 'Computador > Componentes > Memoria RAM',
    'Placa de V\u00eddeo': 'Computador > Componentes > Placas de video',
    'SSD': 'Computador > Armazenamento > SSD e NVMe',
    'Fonte ATX': 'Computador > Energia > Fontes ATX',
    'Rede / Wi-Fi': 'Computador > Conectividade > Placas Wi-Fi',
    'Refrigera\u00e7\u00e3o': 'Computador > Refrigeracao > Coolers, water coolers e fans',
    'Gabinete': 'Computador > Estrutura > Gabinetes',
    'Outros': 'Computador > Outros'
};

const categoriasVitrineFixas = [
    'Todos',
    'Perif\u00e9ricos',
    '\u00c1udio',
    'Cabos e Adaptadores',
    'Energia',
    'Conectividade',
    'Celular e Smart',
    'Games e Console',
    'Suportes e M\u00f3veis',
    'Outros'
];

let dadosRankingJunho2026 = null;

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
    },
    {
        id: 'h81-i5-slim',
        nome: 'Kit DDR3 i5 Slim',
        subtitulo: 'H81 + i5 4570 + SSD 240GB',
        itens: [
            { termos: ['bmbh81', 'g3hgu'], quantidade: 1, alternativos: [['placa-mae', 'h81', '1150'], ['placa mae', 'h81', '1150']] },
            { termos: ['i5', '4570'], quantidade: 1 },
            { termos: ['gabinete', 'slimdesk', 'bg-2002'], quantidade: 1 },
            { termos: ['memoria', 'ddr3', '1600', 'infinity'], quantidade: 1 },
            { termos: ['ssd', 'hawking', '240gb'], quantidade: 1 }
        ]
    },
    {
        id: 'h81-i3-slim',
        nome: 'Kit DDR3 i3 Slim',
        subtitulo: 'H81 + i3 4160 + SSD 240GB',
        itens: [
            { termos: ['bmbh81', 'g3hgu'], quantidade: 1, alternativos: [['placa-mae', 'h81', '1150'], ['placa mae', 'h81', '1150']] },
            { termos: ['gabinete', 'slimdesk', 'bg-2002'], quantidade: 1 },
            { termos: ['i3', '4160'], quantidade: 1 },
            { termos: ['memoria', 'ddr3', '1600', 'infinity'], quantidade: 1 },
            { termos: ['ssd', 'hawking', '240gb'], quantidade: 1 }
        ]
    },
    {
        id: 'rx550-i7-gamer',
        nome: 'RX 550 i7 Gamer',
        subtitulo: 'i7 4a ger. + RX 550 + SSD 480GB',
        itens: [
            { termos: ['rx', '550', '4gb'], quantidade: 1 },
            { termos: ['bmbh81', 'g3hgu'], quantidade: 1, alternativos: [['placa-mae', 'h81', '1150'], ['placa mae', 'h81', '1150']] },
            { termos: ['i7', '4790'], quantidade: 1, alternativos: [['i7', '4770']] },
            { termos: ['memoria', 'ddr3', '1600', 'infinity'], quantidade: 2 },
            { termos: ['fonte', 'blu600'], quantidade: 1 },
            { termos: ['gabinete', 'bg-064', 'pure', 'preto'], quantidade: 1 },
            { termos: ['ssd', 'hawking', '480gb'], quantidade: 1 }
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
        subcategoriaExtra: 'Gabinete',
        limite: LIMITE_SUGESTOES_ASSISTENTE,
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
        subcategoriaExtra: 'Processador',
        limite: LIMITE_SUGESTOES_ASSISTENTE,
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
        ajuda: 'Escolha air cooler ou water cooler quando o processador ou o gabinete pedir uma refrigera\u00e7\u00e3o melhor.',
        categoriaLivre: 'Refrigera\u00e7\u00e3o',
        tipo: 'categoria',
        subcategoria: 'Refrigera\u00e7\u00e3o',
        termosIncluidos: ['cooler', 'watercooler', 'water-cooler'],
        gruposPrioritarios: [['water'], ['watercooler']],
        limite: LIMITE_SUGESTOES_ASSISTENTE
    },
    {
        id: 'memoria',
        titulo: 'Mem\u00f3ria RAM',
        ajuda: 'Para setups gamer, 2 pentes costumam ser uma boa base. Voc\u00ea pode adicionar mais de uma unidade.',
        categoriaLivre: 'Mem\u00f3ria RAM',
        tipo: 'categoria',
        subcategoria: 'Mem\u00f3ria RAM',
        limite: LIMITE_SUGESTOES_ASSISTENTE
    },
    {
        id: 'ssd',
        titulo: 'SSD',
        ajuda: 'Priorize SSDs com bom estoque e custo equilibrado.',
        categoriaLivre: 'SSD',
        tipo: 'categoria',
        subcategoria: 'SSD',
        limite: LIMITE_SUGESTOES_ASSISTENTE
    },
    {
        id: 'gpu',
        titulo: 'Placa de v\u00eddeo',
        ajuda: 'Escolha uma GPU dedicada quando o cliente quiser mais desempenho em jogos, edi\u00e7\u00e3o ou monitores extras.',
        categoriaLivre: 'Placa de V\u00eddeo',
        tipo: 'categoria',
        subcategoria: 'Placa de V\u00eddeo',
        limite: LIMITE_SUGESTOES_ASSISTENTE
    },
    {
        id: 'fonte',
        titulo: 'Fonte',
        ajuda: 'A fonte precisa acompanhar a configura\u00e7\u00e3o, principalmente se houver placa de v\u00eddeo dedicada.',
        categoriaLivre: 'Fonte ATX',
        tipo: 'categoria',
        subcategoria: 'Fonte ATX',
        limite: LIMITE_SUGESTOES_ASSISTENTE
    },
    {
        id: 'fans',
        titulo: 'Fans adicionais',
        ajuda: 'Fans ajudam na temperatura e tamb\u00e9m no visual do gabinete.',
        categoriaLivre: 'Refrigera\u00e7\u00e3o',
        tipo: 'busca',
        busca: ['fan'],
        limite: LIMITE_SUGESTOES_ASSISTENTE
    },
    {
        id: 'wifi',
        titulo: 'Placa Wi-Fi',
        ajuda: 'Adicione Wi-Fi quando a placa-m\u00e3e n\u00e3o tiver rede sem fio integrada.',
        categoriaLivre: 'Todos',
        tipo: 'buscaQualquer',
        buscaGrupos: [['wifi'], ['wi-fi'], ['wireless']],
        limite: LIMITE_SUGESTOES_ASSISTENTE
    },
    {
        id: 'filtro-linha',
        titulo: 'Prote\u00e7\u00e3o el\u00e9trica',
        ajuda: 'Finalize escolhendo filtro de linha ou protetor eletr\u00f4nico para proteger o computador.',
        categoriaLivre: 'Todos',
        areaLivre: 'vitrine',
        tipo: 'buscaQualquer',
        buscaGrupos: [['filtro', 'linha'], ['protetor', 'eletronico'], ['protetor', 'eletrico'], ['nobreak']],
        termosExcluidos: ['organizador'],
        limite: LIMITE_SUGESTOES_ASSISTENTE
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

function numeroMoeda(valor) {
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : 0;
    const texto = String(valor || '').trim();
    if (!texto) return 0;
    const limpo = texto.replace(/[^\d,.-]/g, '');
    if (limpo.includes(',')) {
        return Number(limpo.replace(/\./g, '').replace(',', '.')) || 0;
    }
    return Number(limpo) || 0;
}

function formatarQuantidade(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function limparCodigoGrupo(grupo) {
    return String(grupo || 'Geral').replace(/^\d+\s*-\s*/, '');
}

async function carregarRankingJunho() {
    const resumo = document.getElementById('ranking-junho-resumo');
    try {
        const resposta = await fetch('ranking-junho-2026.json', { cache: 'no-store' });
        dadosRankingJunho2026 = await resposta.json();
        renderizarRankingJunho(dadosRankingJunho2026);
    } catch (erro) {
        console.error('Erro ao carregar ranking:', erro);
        if (resumo) {
            resumo.innerHTML = '<strong>Ranking</strong><span>Nao foi possivel carregar os dados.</span>';
        }
    }
}

function criarCardRanking(item, tipo = 'venda') {
    const destaque = item.posicao <= 3 ? 'ranking-card-destaque' : '';
    const valorPrincipal = tipo === 'lucro'
        ? `<strong>${formatarMoeda(item.lucro)}</strong><span>lucro</span>`
        : `<strong>${formatarQuantidade(item.quantidade)} un</strong><span>${formatarMoeda(item.totalLiquido)}</span>`;
    const valorSecundario = tipo === 'lucro'
        ? `<small>${formatarQuantidade(item.quantidade)} un - ${formatarMoeda(item.totalLiquido)} venda</small>`
        : `<small>Lucro ${formatarMoeda(item.lucro)}</small>`;

    return `
        <article class="ranking-card ${destaque}">
            <div class="ranking-position">#${item.posicao}</div>
            <div class="ranking-info">
                <span>${escaparHtml(limparCodigoGrupo(item.grupo))} - Cod. ${escaparHtml(item.codigo)}</span>
                <h3 title="${escaparHtml(item.produto)}">${escaparHtml(item.produto)}</h3>
            </div>
            <div class="ranking-numbers">
                ${valorPrincipal}
                ${valorSecundario}
            </div>
        </article>
    `;
}

function renderizarRankingJunho(dados) {
    const container = document.getElementById('ranking-junho-lista');
    const lucroContainer = document.getElementById('ranking-lucro-lista');
    const resumo = document.getElementById('ranking-junho-resumo');
    if (!container) return;

    const maisVendidos = dados?.maisVendidos || [];
    const maioresLucros = dados?.maioresLucros || [];
    const totalUnidades = dados?.totais?.unidadesTop100 || maisVendidos.reduce((total, item) => total + item.quantidade, 0);
    const totalLiquido = dados?.totais?.totalLiquidoTop100 || maisVendidos.reduce((total, item) => total + item.totalLiquido, 0);
    const totalLucro = dados?.totais?.lucroTopLucro || maioresLucros.reduce((total, item) => total + item.lucro, 0);

    if (resumo) {
        resumo.innerHTML = `
            <strong>${formatarQuantidade(totalUnidades)} un</strong>
            <span>${formatarMoeda(totalLiquido)} no top 100</span>
            <small>${formatarMoeda(totalLucro)} de lucro nos destaques</small>
        `;
    }

    container.innerHTML = maisVendidos.map(item => criarCardRanking(item, 'venda')).join('');
    if (lucroContainer) {
        lucroContainer.innerHTML = maioresLucros.map(item => criarCardRanking(item, 'lucro')).join('');
    }
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
    { id: 'gpu', label: 'GPU', match: produto => normalizar(produto.subcategoria) === 'placa de video' },
    {
        id: 'protecao',
        label: 'Protecao',
        match: produto => produtoContemAlgumGrupoTermos(produto, [
            ['filtro', 'linha'],
            ['protetor', 'eletronico'],
            ['protetor', 'eletrico'],
            ['nobreak']
        ])
    }
];

function textoClassificacaoProduto(produto) {
    return [
        produto.nome,
        produto.categoria,
        produto.subcategoria,
        produto.grupo_hse
    ].map(normalizar).filter(Boolean).join(' ');
}

function textoTemQualquer(texto, termos) {
    return termos.some(termo => texto.includes(normalizar(termo)));
}

function ehPlacaVideoComputador(produto) {
    const texto = textoClassificacaoProduto(produto);
    const temVideo = texto.includes('placa de video') ||
        texto.includes('gpu') ||
        texto.includes('geforce') ||
        texto.includes('nvidia') ||
        texto.includes('gddr') ||
        texto.includes('radeon') ||
        /(^|[^a-z0-9])(gt|gtx|rtx)\s?\d{3,4}[a-z0-9]*([^a-z0-9]|$)/.test(texto) ||
        /(^|[^a-z0-9])rx\s?\d{3,4}[a-z0-9]*([^a-z0-9]|$)/.test(texto) ||
        /(^|[^a-z0-9])r[579]\s?\d{3}([^a-z0-9]|$)/.test(texto);

    if (!temVideo) return false;
    if (texto.includes('processador') && !texto.includes('placa de video') && !texto.includes('gpu')) return false;
    if (texto.includes('suporte') && !textoTemQualquer(texto, ['gpu', 'rtx', 'gtx', 'radeon', 'geforce', 'gddr'])) return false;
    if (texto.includes('cabo') && !textoTemQualquer(texto, ['gpu', 'rtx', 'gtx', 'radeon', 'geforce', 'gddr'])) return false;
    return true;
}

function ehPlacaMaeComputador(produto) {
    const texto = textoClassificacaoProduto(produto);
    if (ehPlacaVideoComputador(produto)) return false;
    if (texto.includes('placa mae') || texto.includes('placa-mae') || texto.includes('motherboard') || texto.includes('mainboard')) return true;

    const chipsets = /(a320|a520|b350|b450|b550|b650|x370|x470|x570|x670|h61|h81|h110|h310|h410|h510|h610|b75|b85|b150|b250|b360|b365|b460|b560|b660|b760|z97|z170|z270|z370|z390|z490|z590|z690|z790)/;
    const sockets = /(lga\s?1155|lga\s?1150|lga\s?1151|lga\s?1200|lga\s?1700|am3|am4|am5)/;
    const temContextoPlaca = textoTemQualquer(texto, ['placa', 'chipset', 'matx', 'micro atx', 'ddr3', 'ddr4', 'ddr5', 'm.2', 'nvme']);
    return temContextoPlaca && (chipsets.test(texto) || sockets.test(texto));
}

function ehFonteAtxComputador(produto) {
    const texto = textoClassificacaoProduto(produto);
    if (ehGabineteComputador(produto)) return false;
    if (!texto.includes('fonte') && !texto.includes('fte atx')) return false;

    const temPotencia = /(^|[^a-z0-9])\d{3,4}\s?w(atts?)?([^a-z0-9]|$)/.test(texto);
    const temPadraoPc = textoTemQualquer(texto, ['atx', 'ps/2', 'ps2', 'ps/3', '80 plus', '80plus', 'pfc ativo', 'fonte gamer', 'real']);
    if (!temPotencia && !temPadraoPc) return false;

    const ehFonteExterna = textoTemQualquer(texto, [
        'notebook', 'fonte note', 'monitor', 'xbox', 'magsafe', 'apple', 'acer', 'dell',
        'hp', 'lenovo', 'samsung', 'universal regulavel', 'chaveada', '12v', '19v', '20v',
        'type c', 'usb'
    ]);
    if (ehFonteExterna && !textoTemQualquer(texto, ['atx', 'ps/2', 'ps2', 'ps/3', '80 plus', '80plus', 'pfc ativo'])) return false;
    if (texto.includes('cabo de forca') && !temPadraoPc && !temPotencia) return false;
    return true;
}

function ehRedeWifiComputador(produto) {
    const texto = textoClassificacaoProduto(produto);
    const temWifi = textoTemQualquer(texto, ['placa wifi', 'placa wi-fi', 'wireless', 'dual band', 'tl-wn', 'wn881']);
    const temContextoPc = textoTemQualquer(texto, ['placa', 'pci', 'pci-e', 'pcie', 'desktop']);
    return temWifi && temContextoPc && !textoTemQualquer(texto, ['fone', 'headset', 'mouse', 'teclado', 'caixa de som']);
}

function ehSsdComputador(produto) {
    const texto = textoClassificacaoProduto(produto);
    if (ehRedeWifiComputador(produto)) return false;
    return textoTemQualquer(texto, ['ssd', 'nvme', 'm.2', 'm2 pcie', 'm2 pcle', 'sata iii', 'sata3', 'kingfast', 'keepdata', 'hiksemi', 'kingston snv', 'wd green']);
}

function ehGabineteComputador(produto) {
    const texto = textoClassificacaoProduto(produto);
    return texto.includes('gabinete') || /(^|[^a-z0-9])bg-\d{3,4}/.test(texto) || textoTemQualquer(texto, ['arbaton', 'slimdesk']);
}

function ehProcessadorComputador(produto) {
    const texto = textoClassificacaoProduto(produto);
    const bloqueadores = [
        'cooler', 'air cooler', 'watercooler', 'water-cooler', 'fan', 'ventoinha',
        'pasta termica', 'dissipador', 'heatsink', 'suporte', 'base', 'espelho',
        'placa mae', 'placa de video', 'cabo', 'adaptador'
    ];
    if (textoTemQualquer(texto, bloqueadores)) return false;

    const temLinhaCpu = textoTemQualquer(texto, [
        'ryzen 3', 'ryzen 5', 'ryzen 7', 'ryzen 9', 'intel core', 'core i3',
        'core i5', 'core i7', 'core i9', 'xeon', 'pentium', 'celeron', 'athlon'
    ]);
    const temModeloCpu = /(^|[^a-z0-9])i[3579][-\s]?\d{3,5}[a-z]{0,3}([^a-z0-9]|$)/.test(texto) ||
        /(^|[^a-z0-9])ryzen\s?[3579]\s?\d{3,5}[a-z]{0,3}([^a-z0-9]|$)/.test(texto) ||
        /(^|[^a-z0-9])(g\d{4}|r\d{4}|athlon\s?\d{3,4})([^a-z0-9]|$)/.test(texto);
    const temContextoVendaCpu = textoTemQualquer(texto, ['processador amd', 'processador intel', 'cpu amd', 'cpu intel', 'box am4', 'box am5', 'lga1700']);

    return temLinhaCpu || temModeloCpu || temContextoVendaCpu;
}

function ehMemoriaRamComputador(produto) {
    const texto = textoClassificacaoProduto(produto);
    if (textoTemQualquer(texto, ['cartao', 'card', 'pendrive', 'pen drive', 'ssd', 'hd externo', 'placa de video', 'placa mae'])) return false;
    const temPadraoRam = /(^|[^a-z0-9])(ddr3|ddr4|ddr5|sodimm|so-dimm|pc3|pc4|pc5)([^a-z0-9]|$)/.test(texto);
    const temCapacidadeRam = /(^|[^a-z0-9])([248]|16|32|64)\s?gb([^a-z0-9]|$)/.test(texto);
    const temVelocidadeRam = /(^|[^a-z0-9])(2133|2400|2666|3000|3200|3600|4800|5200|5600|6000)\s?mhz([^a-z0-9]|$)/.test(texto);
    return textoTemQualquer(texto, ['memoria ram', 'memoria ddr', 'ram ddr', 'memoria notebook', 'memoria desktop']) ||
        (temPadraoRam && (temCapacidadeRam || temVelocidadeRam || texto.includes('memoria')));
}

function ehRefrigeracaoComputador(produto) {
    const texto = textoClassificacaoProduto(produto);
    if (ehGabineteComputador(produto) || ehFonteAtxComputador(produto)) return false;
    if (textoTemQualquer(texto, ['cooler notebook', 'base cooler', 'cooling stand'])) return false;
    return textoTemQualquer(texto, [
        'cooler', 'air cooler', 'watercooler', 'water-cooler', 'fan', 'ventoinha',
        'pasta termica', 'dissipador', 'heatsink', 'kit 3 fans'
    ]);
}

function regraCombinaProduto(regra, produto) {
    const texto = textoClassificacaoProduto(produto);
    if (regra.nome === 'Processador') return ehProcessadorComputador(produto);
    if (regra.nome === 'Placa de V\u00eddeo') return ehPlacaVideoComputador(produto);
    if (regra.nome === 'Placa M\u00e3e') return ehPlacaMaeComputador(produto);
    if (regra.nome === 'Mem\u00f3ria RAM') return ehMemoriaRamComputador(produto);
    if (regra.nome === 'Fonte ATX') return ehFonteAtxComputador(produto);
    if (regra.nome === 'Rede / Wi-Fi') return ehRedeWifiComputador(produto);
    if (regra.nome === 'SSD') return ehSsdComputador(produto);
    if (regra.nome === 'Refrigera\u00e7\u00e3o') return ehRefrigeracaoComputador(produto);
    if (regra.nome === 'Gabinete') return ehGabineteComputador(produto);

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
    if (detectarSubcategoriaHardware(produto)) return true;
    const categoria = normalizar(produto.categoria);
    const subcategoria = normalizar(produto.subcategoria);
    const grupo = normalizar(produto.grupo_hse);
    const termos = ['hardware', 'gabinete', 'placa mae', 'memoria ram', 'ram ddr', 'watercooler', 'placa de video', 'ssd', 'nvme', 'armazenamento', 'fonte atx', 'refrigeracao'];
    return termos.some(termo => categoria.includes(termo) || subcategoria.includes(termo) || grupo.includes(termo));
}

function classificarProdutoAutomaticamente(produto) {
    const subcategoriaDetectada = detectarSubcategoriaHardware(produto);
    if (!ehCategoriaHardware(produto) && !subcategoriaDetectada) return produto;

    const nome = normalizar(produto.nome);
    const subcategoria = subcategoriaDetectada || produto.subcategoria || 'Outros';

    produto.categoria = 'Hardware';
    produto.subcategoria = subcategoria;
    produto.departamento = 'Hardware';
    produto.caminhoCatalogo = caminhosCatalogoHardware[subcategoria] || caminhosCatalogoHardware.Outros;

    if (subcategoria === 'Gabinete') {
        produto.tipo = (nome.includes('office') || nome.includes('slim') || nome.includes('slimdesk')) ? 'Office' : 'Gamer';
    }

    return produto;
}

function ehProdutoHardware(produto) {
    return ehCategoriaHardware(produto) || Boolean(detectarSubcategoriaHardware(produto));
}

function obterGrupoVitrine(produto) {
    const texto = textoClassificacaoProduto(produto);
    const categoria = normalizar(produto.categoria);
    const grupo = normalizar(produto.grupo_hse);

    if (textoTemQualquer(texto, ['headset', 'headphone', 'fone', 'caixa de som', 'microfone', 'speaker', 'soundbar'])) return '\u00c1udio';
    if (textoTemQualquer(texto, ['mouse', 'mousepad', 'teclado', 'webcam', 'controle', 'joystick', 'volante', 'apresentador'])) return 'Perif\u00e9ricos';
    if (textoTemQualquer(texto, ['cabo', 'adaptador', 'conversor', 'hub', 'dock', 'extensor'])) return 'Cabos e Adaptadores';
    if (textoTemQualquer(texto, ['carregador', 'bateria', 'pilha', 'protetor eletrico', 'filtro de linha', 'nobreak', 'fonte'])) return 'Energia';
    if (textoTemQualquer(texto, ['roteador', 'switch', 'rede', 'bluetooth', 'wifi', 'wi-fi', 'wireless', 'pen drive', 'pendrive', 'cartao', 'card'])) return 'Conectividade';
    if (textoTemQualquer(texto, ['celular', 'smart', 'tablet', 'relogio', 'tv box', 'pelicula', 'capa'])) return 'Celular e Smart';
    if (textoTemQualquer(texto, ['console', 'video game', 'jogo', 'games', 'xbox', 'playstation', 'nintendo'])) return 'Games e Console';
    if (textoTemQualquer(texto, ['suporte', 'cadeira', 'mesa', 'tripe', 'base', 'stand'])) return 'Suportes e M\u00f3veis';

    if (['mouse', 'teclado', 'webcam', 'controle', 'volante', 'apresentador'].includes(categoria) || ['mouse', 'teclado', 'webcam', 'controle', 'volante'].includes(grupo)) return 'Perif\u00e9ricos';
    if (['fone', 'headset', 'headphone', 'microfone', 'cx'].includes(categoria) || ['fone', 'headset', 'headphone', 'microfone'].includes(grupo)) return '\u00c1udio';
    if (['cabo', 'adaptador', 'case'].includes(categoria) || ['cabo', 'adaptador'].includes(grupo)) return 'Cabos e Adaptadores';
    if (['carregador', 'bateria', 'pilha', 'protetor eletrico'].includes(categoria)) return 'Energia';
    if (['rede', 'switch', 'pen drive', 'cartao', 'card'].includes(categoria)) return 'Conectividade';
    if (['celular', 'smart', 'tablet', 'relogio', 'tv box', 'pelicula', 'capa'].includes(categoria)) return 'Celular e Smart';
    if (['console', 'video game', 'jogos'].includes(categoria)) return 'Games e Console';
    if (['suporte', 'cadeira', 'mesa', 'tripe', 'base'].includes(categoria)) return 'Suportes e M\u00f3veis';

    return 'Outros';
}

function obterSubcategoriaVitrine(produto) {
    const texto = textoClassificacaoProduto(produto);
    if (texto.includes('headset')) return 'Headset';
    if (texto.includes('headphone')) return 'Headphone';
    if (texto.includes('fone')) return 'Fone';
    if (texto.includes('caixa de som')) return 'Caixa de som';
    if (texto.includes('microfone')) return 'Microfone';
    if (texto.includes('mousepad')) return 'Mousepad';
    if (texto.includes('mouse')) return 'Mouse';
    if (texto.includes('teclado')) return 'Teclado';
    if (texto.includes('webcam')) return 'Webcam';
    if (texto.includes('controle') || texto.includes('joystick')) return 'Controle';
    if (texto.includes('volante')) return 'Volante';
    if (texto.includes('cabo')) return 'Cabo';
    if (texto.includes('adaptador')) return 'Adaptador';
    if (texto.includes('hub')) return 'Hub';
    if (texto.includes('carregador')) return 'Carregador';
    if (texto.includes('bateria')) return 'Bateria';
    if (texto.includes('pilha')) return 'Pilha';
    if (texto.includes('roteador')) return 'Roteador';
    if (texto.includes('switch')) return 'Switch';
    if (texto.includes('bluetooth')) return 'Bluetooth';
    if (texto.includes('wifi') || texto.includes('wi-fi') || texto.includes('wireless')) return 'Wi-Fi';
    if (texto.includes('pen drive') || texto.includes('pendrive')) return 'Pen drive';
    if (texto.includes('cartao') || texto.includes('card')) return 'Cart\u00e3o';
    if (texto.includes('pelicula')) return 'Pel\u00edcula';
    if (texto.includes('capa')) return 'Capa';
    if (texto.includes('tv box')) return 'TV Box';
    if (texto.includes('relogio')) return 'Rel\u00f3gio';
    if (texto.includes('console') || texto.includes('video game')) return 'Console';
    if (texto.includes('jogo')) return 'Jogos';
    if (texto.includes('suporte')) return 'Suporte';
    if (texto.includes('cadeira')) return 'Cadeira';
    if (texto.includes('mesa')) return 'Mesa';
    if (texto.includes('tripe')) return 'Trip\u00e9';

    const origem = normalizar(produto.categoria) === 'hardware'
        ? (produto.grupo_hse || produto.categoria)
        : (produto.categoria || produto.grupo_hse);
    return corrigirTexto(origem || 'Outros');
}

function produtoPassaBusca(produto, busca) {
    if (!busca) return true;
    const termosBusca = normalizar(busca).split(/\s+/).filter(Boolean);
    const textoProduto = textoClassificacaoProduto(produto);
    return termosBusca.every(termo => textoProduto.includes(termo));
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
            preco_venda: numeroMoeda(item.preco_venda),
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
        const produto = buscarProdutoPreset(config);
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
    renderizarBotoesFiltro('vitrine', categoriasVitrineFixas);
    renderizarSubFiltrosVitrine();
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

function renderizarSubFiltrosVitrine() {
    const container = document.getElementById('sub-filtros-vitrine');
    const titulo = document.getElementById('titulo-sub-vitrine');
    if (!container) return;

    const categoriaAtual = estadoFiltros.vitrine.categoria;
    const produtosBase = listaCompleta
        .filter(produto => !ehProdutoHardware(produto))
        .filter(produto => categoriaAtual === 'Todos' || normalizar(obterGrupoVitrine(produto)) === normalizar(categoriaAtual));

    const subcategorias = [...new Set(produtosBase.map(obterSubcategoriaVitrine))]
        .filter(Boolean)
        .sort((a, b) => normalizar(a).localeCompare(normalizar(b)));

    const deveMostrar = categoriaAtual !== 'Todos' && subcategorias.length > 1;
    container.style.display = deveMostrar ? 'flex' : 'none';
    if (titulo) titulo.style.display = deveMostrar ? 'block' : 'none';
    if (!deveMostrar) {
        estadoFiltros.vitrine.subcategoria = 'Todos';
        container.innerHTML = '';
        return;
    }

    container.innerHTML = '';
    ['Todos', ...subcategorias].forEach(subcategoria => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'btn-filtro';
        botao.textContent = subcategoria;
        if (normalizar(estadoFiltros.vitrine.subcategoria) === normalizar(subcategoria)) {
            botao.classList.add('ativo');
        }
        botao.addEventListener('click', () => selecionarSubcategoriaVitrine(subcategoria));
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

    if (etapa.areaLivre === 'vitrine') {
        mudarAba('vitrine');
        estadoFiltros.vitrine.categoria = 'Todos';
        estadoFiltros.vitrine.subcategoria = 'Todos';
        estadoFiltros.vitrine.busca = etapa.buscaGrupos ? etapa.buscaGrupos[0].join(' ') : (etapa.busca || []).join(' ');
        const campoVitrine = document.getElementById('busca-vitrine');
        if (campoVitrine) campoVitrine.value = estadoFiltros.vitrine.busca;
        renderizarBotoesFiltro('vitrine', categoriasVitrineFixas);
        renderizarSubFiltrosVitrine();
        aplicarFiltros('vitrine');
        document.getElementById('grid-acessorios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    estadoFiltros.hardware.categoria = etapa.categoriaLivre || 'Todos';
    estadoFiltros.hardware.tipo = 'Todos';
    estadoFiltros.hardware.busca = etapa.tipo === 'busca' ? (etapa.busca || []).join(' ') : '';
    if (etapa.tipo === 'buscaQualquer') {
        estadoFiltros.hardware.busca = etapa.buscaGrupos ? etapa.buscaGrupos[0].join(' ') : '';
    }
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
    const limite = etapa.limite || LIMITE_SUGESTOES_ASSISTENTE;

    if (etapa.tipo === 'termos') {
        const sugeridos = etapa.opcoes
            .map(termos => buscarProdutoPorTermos(termos))
            .filter(Boolean);
        const extras = etapa.subcategoriaExtra ? produtosPorSubcategoria(etapa.subcategoriaExtra, limite) : [];
        return removerDuplicadosPorId([...sugeridos, ...extras]).slice(0, limite);
    }

    if (etapa.tipo === 'processador') {
        const sugeridos = etapa.opcoes
            .map(opcao => {
                const produto = buscarProdutoPorTermos(opcao.termos);
                return produto ? { ...opcao, produto } : null;
            })
            .filter(Boolean);
        const idsSugeridos = new Set(sugeridos.map(item => item.produto.id));
        const extras = etapa.subcategoriaExtra
            ? produtosPorSubcategoria(etapa.subcategoriaExtra, limite)
                .filter(produto => !idsSugeridos.has(produto.id))
                .map(produto => ({
                    label: produto.nome,
                    termos: [produto.nome],
                    plataforma: normalizar(produto.nome).includes('intel') ? 'intel' : 'ryzen',
                    produto
                }))
            : [];
        return [...sugeridos, ...extras].slice(0, limite);
    }

    if (etapa.tipo === 'placa-mae') {
        const termos = wizardState.plataforma === 'intel'
            ? [['h610'], ['lga1700'], ['intel 1700']]
            : [['a520']];
        const encontrados = termos.flatMap(grupo => buscarProdutosPorTermos(grupo, 20))
            .filter(produto => normalizar(produto.subcategoria) === normalizar('Placa M\u00e3e'));
        return removerDuplicadosPorId(ordenarPorEstoqueECusto(encontrados)).slice(0, limite);
    }

    if (etapa.tipo === 'categoria') {
        let produtos = listaCompleta.filter(produto =>
            ehProdutoHardware(produto) &&
            normalizar(produto.subcategoria || 'Outros') === normalizar(etapa.subcategoria)
        );
        if (etapa.termosIncluidos) {
            produtos = produtos.filter(produto => etapa.termosIncluidos.some(termo =>
                textoClassificacaoProduto(produto).includes(normalizar(termo))
            ));
        }
        produtos = filtrarTermosExcluidos(produtos, etapa.termosExcluidos);
        if (etapa.gruposPrioritarios) {
            const prioritarios = ordenarPorEstoqueECusto(produtos.filter(produto =>
                produtoContemAlgumGrupoTermos(produto, etapa.gruposPrioritarios)
            ));
            const restantes = ordenarPorEstoqueECusto(produtos.filter(produto =>
                !produtoContemAlgumGrupoTermos(produto, etapa.gruposPrioritarios)
            ));
            return removerDuplicadosPorId([...prioritarios, ...restantes]).slice(0, limite);
        }
        return ordenarPorEstoqueECusto(produtos).slice(0, limite);
    }

    if (etapa.tipo === 'busca') {
        return buscarProdutosPorTermos(etapa.busca, limite);
    }

    if (etapa.tipo === 'buscaQualquer') {
        const produtos = listaCompleta.filter(produto =>
            produtoContemAlgumGrupoTermos(produto, etapa.buscaGrupos || [])
        );
        return ordenarPorEstoqueECusto(filtrarTermosExcluidos(produtos, etapa.termosExcluidos)).slice(0, limite);
    }

    return [];
}

function produtosPorSubcategoria(subcategoria, limite = LIMITE_SUGESTOES_ASSISTENTE) {
    return ordenarPorEstoqueECusto(listaCompleta.filter(produto =>
        ehProdutoHardware(produto) &&
        normalizar(produto.subcategoria || 'Outros') === normalizar(subcategoria)
    )).slice(0, limite);
}

function filtrarTermosExcluidos(produtos, termosExcluidos = []) {
    if (!termosExcluidos.length) return produtos;
    return produtos.filter(produto => !termosExcluidos.some(termo =>
        textoClassificacaoProduto(produto).includes(normalizar(termo))
    ));
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
        estadoFiltros.vitrine.subcategoria = 'Todos';
        renderizarBotoesFiltro('vitrine', categoriasVitrineFixas);
        renderizarSubFiltrosVitrine();
    }

    aplicarFiltros(area);
}

function selecionarSubcategoriaVitrine(subcategoria) {
    estadoFiltros.vitrine.subcategoria = subcategoria;
    renderizarSubFiltrosVitrine();
    aplicarFiltros('vitrine');
}

function alterarOrdenacao(area, ordenacao) {
    estadoFiltros[area].ordenacao = ordenacao;
    aplicarFiltros(area);
}

function buscarVitrine(event) {
    if (event) event.preventDefault();
    const campo = document.getElementById('busca-vitrine');
    estadoFiltros.vitrine.busca = campo ? campo.value.trim() : '';
    aplicarFiltros('vitrine');
}

function limparBuscaVitrine() {
    const campo = document.getElementById('busca-vitrine');
    if (campo) campo.value = '';
    estadoFiltros.vitrine.busca = '';
    aplicarFiltros('vitrine');
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

function produtoContemAlgumGrupoTermos(produto, gruposTermos) {
    return gruposTermos.some(termos => produtoContemTermos(produto, termos));
}

function buscarProdutoPorTermos(termos) {
    return ordenarPorEstoqueECusto(listaCompleta.filter(produto => produtoContemTermos(produto, termos)))[0] || null;
}

function buscarProdutoPreset(config) {
    const grupos = [config.termos, ...(config.alternativos || [])].filter(Boolean);
    for (const termos of grupos) {
        const produto = buscarProdutoPorTermos(termos);
        if (produto) return produto;
    }
    return null;
}

function buscarProdutosPorTermos(termos, limite = 5) {
    return ordenarPorEstoqueECusto(listaCompleta.filter(produto => produtoContemTermos(produto, termos))).slice(0, limite);
}

function aplicarFiltros(area) {
    if (area === 'vitrine') {
        let produtos = listaCompleta.filter(produto => !ehProdutoHardware(produto));
        if (estadoFiltros.vitrine.categoria !== 'Todos') {
            produtos = produtos.filter(produto => normalizar(obterGrupoVitrine(produto)) === normalizar(estadoFiltros.vitrine.categoria));
        }
        if (estadoFiltros.vitrine.subcategoria !== 'Todos') {
            produtos = produtos.filter(produto => normalizar(obterSubcategoriaVitrine(produto)) === normalizar(estadoFiltros.vitrine.subcategoria));
        }
        if (estadoFiltros.vitrine.busca) {
            produtos = produtos.filter(produto => produtoPassaBusca(produto, estadoFiltros.vitrine.busca));
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
        produtos = produtos.filter(produto => produtoPassaBusca(produto, estadoFiltros.hardware.busca));
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
    return numeroMoeda(produto.preco_venda);
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

    const categoria = isHardware
        ? (produto.subcategoria || 'Outros')
        : `${obterGrupoVitrine(produto)} / ${obterSubcategoriaVitrine(produto)}`;
    const precoPrincipal = produto.preco_venda;
    const textoPublico = produto.publico ? 'Publicado' : 'Publicar';
    const classePublico = produto.publico ? 'public-toggle ativo' : 'public-toggle';

    card.innerHTML = `
        <div>
            ${criarVisualProduto(produto)}
            <p class="categoria-tag">${escaparHtml(categoria)}</p>
            <h3 title="${escaparHtml(produto.nome)}">${escaparHtml(produto.nome)}</h3>
            <p class="estoque">Estoque: ${produto.estoque} un</p>
        </div>
        <div>
            <p class="preco">${formatarMoeda(precoPrincipal)}</p>
            <div class="card-actions">
                <button class="${classePublico}" type="button" onclick="alternarProdutoPublico(${produto.id})">${textoPublico}</button>
                <button class="card-add" type="button" onclick="adicionarAoOrcamento(${produto.id})">Adicionar</button>
            </div>
        </div>
    `;
    return card;
}

function criarVisualProduto(produto) {
    const imagem = obterImagemLocalProduto(produto);
    if (imagem) {
        return `
            <div class="produto-foto">
                <img src="${escaparHtml(imagem)}" alt="${escaparHtml(produto.nome)}" loading="lazy">
            </div>
        `;
    }

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

function obterImagemLocalProduto(produto) {
    const imagem = String(produto.imagem || '').trim();
    const imagensDisponiveis = [
        '/images/produtos/gabinete-bluecase-bg064.jpg',
        '/images/produtos/fonte-bluecase-atx-500w.jpg',
        '/images/produtos/processador-ryzen-5-5600gt.jpg',
        '/images/produtos/placa-video-geforce-rtx-5060.jpg',
        '/images/produtos/memoria-kingston-fury-beast-ddr4.png',
        '/images/produtos/placa-mae-asus-prime-a520m-k.png'
    ];

    return imagensDisponiveis.includes(imagem) ? imagem : '';
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
    return numeroMoeda(item.preco_venda);
}

function nomeExibicaoOrcamento(item) {
    return String(item.nome_orcamento || item.nome || '').trim();
}

function itensParaCalculoOrcamento() {
    return orcamentoAtual.map(item => ({
        id: item.id,
        quantidade: item.quantidade
    }));
}

function aplicarTotaisOrcamentoServidor(totais) {
    totaisOrcamentoServidor = {
        quantidadeTotal: Number(totais?.quantidadeTotal) || 0,
        totalNormal: Number(totais?.totalNormal) || 0,
        totalVista: Number(totais?.totalVista) || 0,
        totalParcelado: Number(totais?.totalParcelado) || 0
    };

    const resumoQuantidadeEl = document.getElementById('resumo-quantidade');

    if (resumoQuantidadeEl) {
        resumoQuantidadeEl.textContent = totaisOrcamentoServidor.quantidadeTotal === 1
            ? '1 item'
            : `${totaisOrcamentoServidor.quantidadeTotal} itens`;
    }
    atualizarBotoesDesconto();
}

async function calcularTotaisOrcamentoServidor() {
    const versaoAtual = ++versaoCalculoOrcamento;

    if (orcamentoAtual.length === 0) {
        aplicarTotaisOrcamentoServidor({ quantidadeTotal: 0, totalNormal: 0, totalVista: 0, totalParcelado: 0 });
        return true;
    }

    try {
        const resposta = await fetch('/api/orcamento/calcular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                itens: itensParaCalculoOrcamento(),
                margemVista: margensOrcamento.vista,
                margemParcelado: margensOrcamento.parcelado
            })
        });

        if (!resposta.ok) throw new Error('Falha ao calcular orcamento.');
        const totais = await resposta.json();
        if (versaoAtual === versaoCalculoOrcamento) {
            aplicarTotaisOrcamentoServidor(totais);
        }
        return true;
    } catch (erro) {
        console.error('Erro ao calcular orcamento:', erro);
        const totalFinalEl = document.getElementById('total-final-resumo');
        if (totalFinalEl) totalFinalEl.textContent = 'Erro';
        return false;
    }
}

function atualizarTotalUnicoOrcamento() {
    const totalSelecionado = obterTotalSelecionadoOrcamento();
    const label = document.getElementById('total-label');
    const valor = document.getElementById('total-final-resumo');
    if (label) label.textContent = totalSelecionado.rotulo;
    if (valor) valor.textContent = formatarMoeda(totalSelecionado.valor);
}

function definirModoDesconto(modo) {
    modoDescontoOrcamento = modo;
    atualizarBotoesDesconto();
}

function alterarMargemOrcamento(tipo, valor) {
    const numero = Math.max(0, Math.min(200, Number(valor) || 0));
    if (tipo === 'vista') {
        margensOrcamento.vista = numero;
    } else {
        margensOrcamento.parcelado = numero;
    }
    calcularTotaisOrcamentoServidor();
}

function atualizarBotoesDesconto() {
    const mapa = {
        normal: document.getElementById('btn-total-normal'),
        vista: document.getElementById('btn-total-vista'),
        parcelado: document.getElementById('btn-total-parcelado')
    };
    Object.entries(mapa).forEach(([modo, botao]) => {
        if (botao) botao.classList.toggle('ativo', modoDescontoOrcamento === modo);
    });

    atualizarTotalUnicoOrcamento();
}

function obterTotalSelecionadoOrcamento() {
    if (modoDescontoOrcamento === 'vista') {
        return { rotulo: `Total com desconto a vista`, valor: totaisOrcamentoServidor.totalVista };
    }
    if (modoDescontoOrcamento === 'parcelado') {
        return { rotulo: `Total com desconto parcelado`, valor: totaisOrcamentoServidor.totalParcelado };
    }
    return { rotulo: 'Total normal', valor: totaisOrcamentoServidor.totalNormal };
}

function alternarValoresItensOrcamento() {
    mostrarValoresItensOrcamento = !mostrarValoresItensOrcamento;
    atualizarPainelInterno();
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

async function alternarProdutoPublico(id) {
    const produto = listaCompleta.find(item => Number(item.id) === Number(id));
    if (!produto) return;

    const novoEstado = !produto.publico;
    try {
        const resposta = await fetch(`/api/produtos/${id}/publico`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publico: novoEstado })
        });

        if (!resposta.ok) throw new Error('Falha ao atualizar vitrine publica.');
        const resultado = await resposta.json();
        produto.publico = Boolean(resultado.publico);
        aplicarFiltros('vitrine');
        aplicarFiltros('hardware');
    } catch (erro) {
        console.error('Erro ao atualizar vitrine publica:', erro);
        alert('Nao foi possivel atualizar a vitrine publica agora.');
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

function atualizarNomeItemNoEspelho(id, nome) {
    const item = orcamentoAtual.find(produto => Number(produto.id) === Number(id));
    if (!item) return;

    item.nome_orcamento = String(nome || '').trim();
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
            <strong>${item ? escaparHtml(nomeExibicaoOrcamento(item)) : 'Aguardando'}</strong>
        `;
    });
}

function atualizarPainelInterno() {
    const container = document.getElementById('itens-orcamento');
    const totalFinalEl = document.getElementById('total-final-resumo');
    const resumoQuantidadeEl = document.getElementById('resumo-quantidade');
    const botaoMostrarValores = document.getElementById('btn-mostrar-valores');
    if (!container) {
        atualizarComputadorVirtual();
        return;
    }

    container.innerHTML = '';

    if (orcamentoAtual.length === 0) {
        container.innerHTML = '<p class="orcamento-vazio">Nenhum item adicionado.</p>';
    }

    let quantidadeTotal = 0;
    if (botaoMostrarValores) {
        botaoMostrarValores.textContent = mostrarValoresItensOrcamento
            ? 'Ocultar valores dos produtos'
            : 'Mostrar valores dos produtos';
    }

    orcamentoAtual.forEach(item => {
        const nomeItem = nomeExibicaoOrcamento(item);
        const subtotalProduto = numeroMoeda(item.preco_venda) * item.quantidade;
        quantidadeTotal += item.quantidade;
        const detalheValor = mostrarValoresItensOrcamento
            ? `${item.quantidade} un - Produto ${formatarMoeda(item.preco_venda)}`
            : `${item.quantidade} un`;
        const subtotalHtml = mostrarValoresItensOrcamento
            ? `<span>${formatarMoeda(subtotalProduto)}</span>`
            : '';

        const linha = document.createElement('div');
        linha.className = 'item-linha';
        linha.innerHTML = `
            <span class="item-sigla" aria-hidden="true">${iniciaisProduto(nomeItem)}</span>
            <span class="item-info">
                <strong title="${escaparHtml(nomeItem)}">${escaparHtml(nomeItem)}</strong>
                <small>${detalheValor}</small>
            </span>
            <span class="item-acoes">
                ${subtotalHtml}
                <button class="btn-remove" type="button" onclick="removerDoOrcamento(${item.id})" aria-label="Remover ${escaparHtml(nomeItem)}">&times;</button>
            </span>
        `;
        container.appendChild(linha);
    });

    if (totalFinalEl) totalFinalEl.textContent = orcamentoAtual.length ? 'Calculando...' : formatarMoeda(0);
    if (resumoQuantidadeEl) resumoQuantidadeEl.textContent = quantidadeTotal === 1 ? '1 item' : `${quantidadeTotal} itens`;
    atualizarComputadorVirtual();
    calcularTotaisOrcamentoServidor();
}

async function abrirEspelhoCliente() {
    if (orcamentoAtual.length === 0) {
        alert('Adicione itens ao orcamento primeiro.');
        return;
    }

    const calculou = await calcularTotaisOrcamentoServidor();
    if (!calculou) {
        alert('Nao foi possivel calcular o orcamento agora. Verifique se o servidor esta rodando.');
        return;
    }

    const corpo = document.getElementById('tabela-cliente-corpo');
    corpo.innerHTML = '';

    orcamentoAtual.forEach(item => {
        const nomeItem = nomeExibicaoOrcamento(item);
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td><input class="nome-item-cliente" type="text" value="${escaparHtml(nomeItem)}" onchange="atualizarNomeItemNoEspelho(${item.id}, this.value)" aria-label="Nome do item"></td>
            <td>${item.quantidade}</td>
            <td class="coluna-acoes-cliente"><button class="btn-edit-name" type="button" onclick="this.closest('tr').querySelector('.nome-item-cliente').focus()" aria-label="Editar nome de ${escaparHtml(nomeItem)}" title="Editar nome">&#9998;</button></td>
        `;
        corpo.appendChild(linha);
    });

    const totalSelecionado = obterTotalSelecionadoOrcamento();
    document.getElementById('cliente-condicao').textContent = totalSelecionado.rotulo;
    document.getElementById('cliente-total-final').textContent = formatarMoeda(totalSelecionado.valor);
    document.getElementById('modal-cliente').style.display = 'flex';
}

function enviarOrcamentoWhatsApp() {
    if (orcamentoAtual.length === 0) return;

    const totalSelecionado = obterTotalSelecionadoOrcamento();
    const itens = orcamentoAtual
        .map(item => `- ${item.quantidade}x ${nomeExibicaoOrcamento(item)}`)
        .join('\n');
    const mensagem = [
        '*ORCAMENTO GAME MANIA*',
        '',
        'Ola! Segue a configuracao selecionada:',
        itens,
        '',
        `*${totalSelecionado.rotulo}: ${formatarMoeda(totalSelecionado.valor)}*`,
        'Validade: 7 dias.',
        '',
        'Ficamos a disposicao para tirar duvidas.'
    ].join('\n');

    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
}

function fecharEspelhoCliente() {
    document.getElementById('modal-cliente').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    carregarRankingJunho();
    carregarProdutos();
});
