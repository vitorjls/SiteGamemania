const fs = require('fs');
const path = require('path');

const arquivoProdutos = path.resolve(__dirname, '..', 'data', 'produtos.json');

const imagens = {
    gabinete: '/images/produtos/gabinete-bluecase-bg064.jpg',
    fonte: '/images/produtos/fonte-bluecase-atx-500w.jpg',
    processador: '/images/produtos/processador-ryzen-5-5600gt.jpg',
    placaVideo: '/images/produtos/placa-video-geforce-rtx-5060.jpg',
    memoria: '/images/produtos/memoria-kingston-fury-beast-ddr4.png',
    placaMae: '/images/produtos/placa-mae-asus-prime-a520m-k.png'
};

function normalizar(texto) {
    return String(texto || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function categoriaDaImagem(produto) {
    const texto = normalizar([produto.nome, produto.categoria, produto.subcategoria, produto.grupo_hse].join(' '));
    const ehCooler = /\bcooler\b|watercooler|water cooler/.test(texto);

    if (/\bgabinete\b/.test(texto)) return 'gabinete';
    if (/placa\s*(mae|mãe)|motherboard|\b(a520|a620|b450|b550|b650|x570|h610|b760|z790)\w*/.test(texto)) return 'placaMae';
    if (!ehCooler && /\b(processador|cpu|ryzen|core i[3579]|athlon|pentium|celeron)\b/.test(texto)) return 'processador';
    if (/placa\s*(de\s*)?video|\b(gpu|geforce|rtx|gtx|radeon)\b|\brx\s?\d{3,4}\b/.test(texto)) return 'placaVideo';
    if (/\b(memoria|memória|ram)\b.*\bddr[345]\b|\bddr[345]\b.*\b(memoria|memória|ram)\b/.test(texto)) return 'memoria';
    if (/\bfonte\b/.test(texto) && /\b(atx|sfx|w|watts?|alimentacao|alimentação|gamer)\b/.test(texto)) return 'fonte';

    return null;
}

function podeSubstituir(imagem) {
    return !imagem || /placeholder|\/images\/produtos\/hardware-/i.test(imagem);
}

const produtos = JSON.parse(fs.readFileSync(arquivoProdutos, 'utf8'));
let atualizados = 0;
const porCategoria = {};

for (const produto of produtos) {
    const categoria = categoriaDaImagem(produto);
    if (!categoria || !podeSubstituir(produto.imagem)) continue;

    produto.imagem = imagens[categoria];
    atualizados += 1;
    porCategoria[categoria] = (porCategoria[categoria] || 0) + 1;
}

fs.writeFileSync(arquivoProdutos, `${JSON.stringify(produtos, null, 2)}\n`);
console.log(`Imagens locais atribuídas: ${atualizados}`);
console.log(porCategoria);
