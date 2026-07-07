const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;
const PRODUTOS_PATH = path.join(__dirname, 'data', 'produtos.json');
const PRODUTOS_PUBLICOS_PATH = path.join(__dirname, 'data', 'produtos-publicos.json');
const CLIENTES_PATH = path.join(__dirname, 'data', 'clientes.json');
const MARGEM_AVISTA_PADRAO = 60;
const MARGEM_PARCELADO_PADRAO = 70;
const SITE_USER = process.env.SITE_USER || '';
const SITE_PASSWORD = process.env.SITE_PASSWORD || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const COOKIE_NAME = 'gm_cliente';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const sessoesClientes = new Map();

app.use(express.json({ limit: '256kb' }));

function exigirAutenticacao(req, res, next) {
    if (!SITE_USER || !SITE_PASSWORD) {
        next();
        return;
    }

    const auth = req.headers.authorization || '';
    const [type, credentials] = auth.split(' ');
    const decoded = credentials ? Buffer.from(credentials, 'base64').toString('utf8') : '';
    const separatorIndex = decoded.indexOf(':');
    const user = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : '';
    const password = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : '';

    if (type === 'Basic' && user === SITE_USER && password === SITE_PASSWORD) {
        next();
        return;
    }

    res.set('WWW-Authenticate', 'Basic realm="Game Mania Teste"');
    res.status(401).send('Acesso restrito.');
}

function lerCookie(req, nome) {
    const cookies = req.headers.cookie || '';
    return cookies
        .split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith(`${nome}=`))
        ?.slice(nome.length + 1) || '';
}

function assinarSessao(sessionId) {
    const assinatura = crypto
        .createHmac('sha256', SESSION_SECRET)
        .update(sessionId)
        .digest('hex');
    return `${sessionId}.${assinatura}`;
}

function validarSessaoAssinada(valor) {
    const [sessionId, assinatura] = String(valor || '').split('.');
    if (!sessionId || !assinatura) return '';
    const esperado = assinarSessao(sessionId).split('.')[1];
    try {
        const a = Buffer.from(assinatura, 'hex');
        const b = Buffer.from(esperado, 'hex');
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return '';
        return sessionId;
    } catch {
        return '';
    }
}

function criarCookieSessao(sessionId) {
    const maxAge = 60 * 60 * 24 * 30;
    return `${COOKIE_NAME}=${assinarSessao(sessionId)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

function limparCookieSessao() {
    return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

function obterSessaoCliente(req) {
    const sessionId = validarSessaoAssinada(lerCookie(req, COOKIE_NAME));
    if (!sessionId) return null;
    const sessao = sessoesClientes.get(sessionId);
    if (!sessao) return null;
    if (sessao.expiresAt < Date.now()) {
        sessoesClientes.delete(sessionId);
        return null;
    }
    return sessao;
}

function exigirClienteLogado(req, res, next) {
    const sessao = obterSessaoCliente(req);
    if (!sessao) {
        res.status(401).json({ error: 'Login necessario.' });
        return;
    }
    req.cliente = sessao.cliente;
    next();
}

app.get(['/interno', '/interno/'], exigirAutenticacao, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'interno.html'));
});

app.use((req, res, next) => {
    const caminhosInternos = new Set(['/interno.html', '/app.js', '/ranking-junho-2026.json']);
    if (caminhosInternos.has(req.path)) {
        exigirAutenticacao(req, res, next);
        return;
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

function carregarProdutos() {
    const dados = fs.readFileSync(PRODUTOS_PATH, 'utf8');
    return JSON.parse(dados);
}

function carregarClientes() {
    try {
        const dados = fs.readFileSync(CLIENTES_PATH, 'utf8');
        const clientes = JSON.parse(dados);
        return Array.isArray(clientes) ? clientes : [];
    } catch {
        return [];
    }
}

function salvarClientes(clientes) {
    fs.writeFileSync(CLIENTES_PATH, JSON.stringify(clientes, null, 2));
}

function carregarIdsProdutosPublicos() {
    try {
        const dados = fs.readFileSync(PRODUTOS_PUBLICOS_PATH, 'utf8');
        const ids = JSON.parse(dados);
        if (!Array.isArray(ids)) return new Set();
        return new Set(ids.map(Number).filter(Number.isFinite));
    } catch {
        return new Set();
    }
}

function salvarIdsProdutosPublicos(ids) {
    const lista = [...ids]
        .map(Number)
        .filter(Number.isFinite)
        .sort((a, b) => a - b);
    fs.writeFileSync(PRODUTOS_PUBLICOS_PATH, JSON.stringify(lista, null, 2));
}

function produtoInterno(produto, idsPublicos) {
    const { preco_custo, ...publico } = produto;
    return {
        ...publico,
        publico: idsPublicos.has(Number(produto.id))
    };
}

function produtoVitrinePublica(produto) {
    const { preco_custo, preco_venda, estoque, codigo_hse, publico, ...dadosPublicos } = produto;
    return dadosPublicos;
}

function precoBaseItem(item) {
    return numeroMoeda(item.preco_custo) || numeroMoeda(item.preco_venda) || 0;
}

function arredondarParaFinal999(valor) {
    const numero = Number(valor) || 0;
    if (numero <= 0) return 0;
    return Number((Math.ceil((numero + 0.01) / 10) * 10 - 0.01).toFixed(2));
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

function normalizarItensOrcamento(itens) {
    if (!Array.isArray(itens)) return [];
    return itens
        .map(item => ({
            id: Number(item.id),
            quantidade: Math.max(1, Math.min(99, Number.parseInt(item.quantidade, 10) || 1))
        }))
        .filter(item => Number.isFinite(item.id));
}

function normalizarPercentual(valor, padrao) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return padrao;
    return Math.max(0, Math.min(200, numero));
}

app.get('/api/produtos-publicos', (req, res) => {
    try {
        const idsPublicos = carregarIdsProdutosPublicos();
        const produtos = carregarProdutos()
            .filter(produto => idsPublicos.has(Number(produto.id)))
            .map(produtoVitrinePublica);
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao ler o banco de dados.' });
    }
});

app.get('/api/config-publica', (req, res) => {
    res.json({
        googleClientId: GOOGLE_CLIENT_ID,
        googleLoginAtivo: Boolean(GOOGLE_CLIENT_ID)
    });
});

app.post('/api/auth/google', async (req, res) => {
    try {
        if (!GOOGLE_CLIENT_ID) {
            res.status(503).json({ error: 'Login com Google ainda nao configurado.' });
            return;
        }

        const credential = String(req.body?.credential || '');
        if (!credential) {
            res.status(400).json({ error: 'Credencial Google ausente.' });
            return;
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const googleSub = payload.sub;
        const agora = new Date().toISOString();
        const clientes = carregarClientes();
        let cliente = clientes.find(item => item.googleSub === googleSub);

        if (!cliente) {
            cliente = {
                googleSub,
                email: payload.email || '',
                emailVerified: Boolean(payload.email_verified),
                name: payload.name || '',
                picture: payload.picture || '',
                locale: payload.locale || '',
                firstAccessAt: agora,
                loginCount: 0,
                profile: {}
            };
            clientes.push(cliente);
        }

        cliente.email = payload.email || cliente.email;
        cliente.emailVerified = Boolean(payload.email_verified);
        cliente.name = payload.name || cliente.name;
        cliente.picture = payload.picture || cliente.picture;
        cliente.locale = payload.locale || cliente.locale;
        cliente.lastAccessAt = agora;
        cliente.loginCount = Number(cliente.loginCount || 0) + 1;
        cliente.lastTechnicalData = {
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
            userAgent: req.headers['user-agent'] || '',
            referer: req.headers.referer || ''
        };

        salvarClientes(clientes);

        const sessionId = crypto.randomBytes(24).toString('hex');
        sessoesClientes.set(sessionId, {
            cliente: { googleSub },
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30
        });

        res.setHeader('Set-Cookie', criarCookieSessao(sessionId));
        res.json({ cliente: clientePublico(cliente) });
    } catch (err) {
        res.status(401).json({ error: 'Nao foi possivel validar o login com Google.' });
    }
});

function clientePublico(cliente) {
    return {
        email: cliente.email || '',
        emailVerified: Boolean(cliente.emailVerified),
        name: cliente.name || '',
        picture: cliente.picture || '',
        locale: cliente.locale || '',
        firstAccessAt: cliente.firstAccessAt || '',
        lastAccessAt: cliente.lastAccessAt || '',
        profile: cliente.profile || {}
    };
}

app.get('/api/auth/me', (req, res) => {
    const sessao = obterSessaoCliente(req);
    if (!sessao) {
        res.json({ loggedIn: false });
        return;
    }

    const cliente = carregarClientes().find(item => item.googleSub === sessao.cliente.googleSub);
    if (!cliente) {
        res.json({ loggedIn: false });
        return;
    }
    res.json({ loggedIn: true, cliente: clientePublico(cliente) });
});

app.post('/api/auth/logout', (req, res) => {
    const sessionId = validarSessaoAssinada(lerCookie(req, COOKIE_NAME));
    if (sessionId) sessoesClientes.delete(sessionId);
    res.setHeader('Set-Cookie', limparCookieSessao());
    res.json({ ok: true });
});

function limitarTexto(valor, limite) {
    return String(valor || '').trim().slice(0, limite);
}

app.post('/api/clientes/perfil', exigirClienteLogado, (req, res) => {
    try {
        const clientes = carregarClientes();
        const cliente = clientes.find(item => item.googleSub === req.cliente.googleSub);
        if (!cliente) {
            res.status(404).json({ error: 'Cliente nao encontrado.' });
            return;
        }

        const consentimentoDados = Boolean(req.body?.consentimentoDados);
        if (!consentimentoDados) {
            res.status(400).json({ error: 'Confirme o consentimento para salvar o perfil.' });
            return;
        }

        cliente.profile = {
            telefone: limitarTexto(req.body?.telefone, 32),
            cidade: limitarTexto(req.body?.cidade, 80),
            estado: limitarTexto(req.body?.estado, 40),
            bairro: limitarTexto(req.body?.bairro, 80),
            comoEncontrou: limitarTexto(req.body?.comoEncontrou, 120),
            instagram: limitarTexto(req.body?.instagram, 80),
            facebook: limitarTexto(req.body?.facebook, 120),
            tiktok: limitarTexto(req.body?.tiktok, 80),
            interesse: limitarTexto(req.body?.interesse, 400),
            latitude: limitarTexto(req.body?.latitude, 32),
            longitude: limitarTexto(req.body?.longitude, 32),
            aceitaContato: Boolean(req.body?.aceitaContato),
            consentimentoDados,
            consentimentoTexto: 'Cliente autorizou salvar os dados informados voluntariamente para atendimento e relacionamento comercial.',
            updatedAt: new Date().toISOString()
        };

        salvarClientes(clientes);
        res.json({ cliente: clientePublico(cliente) });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao salvar perfil do cliente.' });
    }
});

app.get('/api/cliente/produtos', exigirClienteLogado, (req, res) => {
    try {
        const idsPublicos = carregarIdsProdutosPublicos();
        const produtos = carregarProdutos()
            .filter(produto => idsPublicos.has(Number(produto.id)))
            .map(produtoVitrinePublica);
        res.json(produtos);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao ler produtos do cliente.' });
    }
});

app.get('/api/produtos', exigirAutenticacao, (req, res) => {
    try {
        const idsPublicos = carregarIdsProdutosPublicos();
        res.json(carregarProdutos().map(produto => produtoInterno(produto, idsPublicos)));
    } catch (err) {
        res.status(500).json({ error: 'Erro ao ler o banco de dados.' });
    }
});

app.post('/api/produtos/:id/publico', exigirAutenticacao, (req, res) => {
    try {
        const id = Number(req.params.id);
        const produtos = carregarProdutos();
        const produtoExiste = produtos.some(produto => Number(produto.id) === id);
        if (!Number.isFinite(id) || !produtoExiste) {
            res.status(404).json({ error: 'Produto nao encontrado.' });
            return;
        }

        const idsPublicos = carregarIdsProdutosPublicos();
        const devePublicar = Boolean(req.body?.publico);
        if (devePublicar) {
            idsPublicos.add(id);
        } else {
            idsPublicos.delete(id);
        }
        salvarIdsProdutosPublicos(idsPublicos);
        res.json({ id, publico: idsPublicos.has(id) });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar vitrine publica.' });
    }
});

app.post('/api/orcamento/calcular', exigirAutenticacao, (req, res) => {
    try {
        const itensSolicitados = normalizarItensOrcamento(req.body?.itens);
        const produtos = carregarProdutos();
        const produtosPorId = new Map(produtos.map(produto => [Number(produto.id), produto]));

        const margemVista = normalizarPercentual(req.body?.margemVista, MARGEM_AVISTA_PADRAO);
        const margemParcelado = normalizarPercentual(req.body?.margemParcelado, MARGEM_PARCELADO_PADRAO);

        let totalNormal = 0;
        let totalCusto = 0;
        let quantidadeTotal = 0;

        itensSolicitados.forEach(item => {
            const produto = produtosPorId.get(item.id);
            if (!produto) return;

            totalNormal += numeroMoeda(produto.preco_venda) * item.quantidade;
            totalCusto += precoBaseItem(produto) * item.quantidade;
            quantidadeTotal += item.quantidade;
        });

        res.json({
            quantidadeTotal,
            totalNormal: Number(totalNormal.toFixed(2)),
            totalVista: arredondarParaFinal999(totalCusto * (1 + margemVista / 100)),
            totalParcelado: arredondarParaFinal999(totalCusto * (1 + margemParcelado / 100)),
            margemVista,
            margemParcelado
        });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao calcular orcamento.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando localmente em http://localhost:${PORT}`);
});
