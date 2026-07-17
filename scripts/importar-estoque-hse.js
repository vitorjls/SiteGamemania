const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const produtosPath = path.join(root, 'data', 'produtos.json');
const dataPath = path.join(root, 'data');
const arquivoInformado = process.argv[2];
const relatoriosDisponiveis = fs.readdirSync(dataPath)
    .filter(arquivo => /^hse-stock-.*\.json$/i.test(arquivo))
    .sort()
    .reverse();
const estoquePath = arquivoInformado
    ? path.resolve(root, arquivoInformado)
    : (relatoriosDisponiveis[0] ? path.join(dataPath, relatoriosDisponiveis[0]) : '');

const grupos = {
    1: 'Geral', 2: 'Perifericos', 3: 'Jogos', 4: 'Memoria', 5: 'Controle',
    6: 'Mouse', 7: 'Video Game', 8: 'Fonte', 9: 'Carregador', 10: 'Fone',
    12: 'HD', 13: 'Cartucho', 14: 'Placa', 15: 'Processador', 16: 'Caixa de Som',
    17: 'Teclado', 18: 'Headset', 19: 'Gabinete', 20: 'Pelicula', 21: 'Cabo',
    22: 'Adaptador', 23: 'Bateria', 25: 'Camera', 26: 'TV Box', 27: 'Aparelho',
    34: 'Monitor', 35: 'Bonecos', 36: 'Volante', 38: 'Capa', 40: 'Cartao',
    41: 'Pen Drive', 42: 'GPS', 43: 'Switch', 45: 'Radio', 46: 'Pilha',
    47: 'Suporte', 48: 'Apresentador', 49: 'Webcam', 50: 'Case', 51: 'Home',
    52: 'Tablet', 55: 'Base', 56: 'Gravador', 57: 'Tripe', 58: 'Bastao',
    60: 'Espuma', 61: 'Pastilha', 62: 'Impressora', 65: 'Bluetooth', 68: 'Skim',
    70: 'Uniformes', 71: 'Headphone', 72: 'Telefone', 73: 'Papelaria', 74: 'Console',
    75: 'Celular', 76: 'Microfone', 77: 'Card', 78: 'Energia', 79: 'Cartas',
    80: 'Chaveiros', 81: 'Fantasia', 82: 'Servico', 83: 'Cadeira', 84: 'Board',
    85: 'Protetor Eletrico', 86: 'Pasta Termica', 87: 'Notebook', 88: 'SSD',
    89: 'Rede', 90: 'Cooler', 91: 'Computador', 92: 'Relogio', 94: 'Spray',
    96: 'Smart', 97: 'Hoverboard', 98: 'Brinquedo', 99: 'Ferramenta',
    100: 'Papelaria', 101: 'Mesa'
};

function numero(valor) {
    const texto = String(valor || '').trim();
    if (!texto) return 0;
    return Number(texto.replace(/\./g, '').replace(',', '.')) || 0;
}

function codigoNormalizado(valor) {
    return String(valor || '').replace(/\D/g, '');
}

function grupoDoCodigo(codigo) {
    const grupo = Number(String(codigo || '').split('.')[0]);
    return grupos[grupo] || 'Geral';
}

const produtos = JSON.parse(fs.readFileSync(produtosPath, 'utf8'));
if (!estoquePath || !fs.existsSync(estoquePath)) {
    throw new Error('Nenhum relatorio de estoque HSE foi encontrado em data/.');
}
const relatorio = JSON.parse(fs.readFileSync(estoquePath, 'utf8'));
const estoqueAtual = Array.isArray(relatorio.produtos) ? relatorio.produtos : [];
const porCodigo = new Map(produtos.map(produto => [codigoNormalizado(produto.codigo_hse), produto]));
const codigosAtuais = new Set();
let proximoId = produtos.reduce((maior, produto) => Math.max(maior, Number(produto.id) || 0), 0) + 1;
let atualizados = 0;
let adicionados = 0;

estoqueAtual.forEach(item => {
    const codigo = codigoNormalizado(item.codigo_hse);
    if (!codigo) return;

    codigosAtuais.add(codigo);
    const custoMedio = numero(item.custo_medio);
    const produto = porCodigo.get(codigo);
    const dadosAtualizados = {
        codigo_hse: item.codigo_hse,
        nome: item.nome,
        preco_custo: custoMedio || numero(item.custo_unitario),
        preco_venda: numero(item.preco_venda),
        estoque: numero(item.estoque)
    };

    if (produto) {
        Object.assign(produto, dadosAtualizados);
        atualizados += 1;
        return;
    }

    const grupo = grupoDoCodigo(item.codigo_hse);
    produtos.push({
        id: proximoId++,
        ...dadosAtualizados,
        categoria: grupo,
        grupo_hse: grupo,
        imagem: 'https://via.placeholder.com/200'
    });
    adicionados += 1;
});

let zerados = 0;
produtos.forEach(produto => {
    if (!codigosAtuais.has(codigoNormalizado(produto.codigo_hse)) && Number(produto.estoque) !== 0) {
        produto.estoque = 0;
        zerados += 1;
    }
});

fs.writeFileSync(produtosPath, `${JSON.stringify(produtos, null, 2)}\n`);
console.log(JSON.stringify({
    relatorio: path.basename(estoquePath),
    atualizados,
    adicionados,
    zerados,
    total: produtos.length
}, null, 2));
