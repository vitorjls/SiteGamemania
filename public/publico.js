let produtosPublicos = [];
let produtosCliente = [];
let clienteAtual = null;
let googleClientId = '';

const estadoPublico = {
    categoria: 'Todos',
    busca: '',
    ordenacao: 'nome-az'
};

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

function limparCodigoGrupo(grupo) {
    return String(grupo || 'Geral').replace(/^\d+\s*-\s*/, '');
}

function textoProduto(produto) {
    return [
        produto.nome,
        produto.categoria,
        produto.subcategoria,
        produto.grupo_hse
    ].map(normalizar).filter(Boolean).join(' ');
}

function categoriaProduto(produto) {
    return corrigirTexto(produto.categoria || limparCodigoGrupo(produto.grupo_hse) || 'Produtos');
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

function identificarVisualProduto(produto) {
    const texto = textoProduto(produto);

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

function montarFiltrosPublicos() {
    const container = document.getElementById('filtros-publicos');
    if (!container) return;

    const categorias = ['Todos', ...new Set(produtosPublicos.map(categoriaProduto).filter(Boolean))]
        .sort((a, b) => a === 'Todos' ? -1 : normalizar(a).localeCompare(normalizar(b)));

    container.innerHTML = '';
    categorias.forEach(categoria => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'btn-filtro';
        botao.textContent = categoria;
        botao.classList.toggle('ativo', normalizar(estadoPublico.categoria) === normalizar(categoria));
        botao.addEventListener('click', () => {
            estadoPublico.categoria = categoria;
            montarFiltrosPublicos();
            aplicarFiltrosPublicos();
        });
        container.appendChild(botao);
    });
}

function ordenarProdutosPublicos(produtos) {
    return [...produtos].sort((a, b) => normalizar(a.nome).localeCompare(normalizar(b.nome)));
}

function aplicarFiltrosPublicos() {
    let produtos = [...produtosPublicos];

    if (estadoPublico.categoria !== 'Todos') {
        produtos = produtos.filter(produto => normalizar(categoriaProduto(produto)) === normalizar(estadoPublico.categoria));
    }

    if (estadoPublico.busca) {
        const termos = normalizar(estadoPublico.busca).split(/\s+/).filter(Boolean);
        produtos = produtos.filter(produto => termos.every(termo => textoProduto(produto).includes(termo)));
    }

    renderizarProdutosPublicos(ordenarProdutosPublicos(produtos), 'grid-publico');
}

function renderizarProdutosPublicos(produtos, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    if (produtos.length === 0) {
        grid.innerHTML = `
            <p class="empty-state public-empty">
                Nenhum produto publicado ainda.
            </p>
        `;
        return;
    }

    grid.innerHTML = produtos.map(produto => {
        const nome = corrigirTexto(produto.nome);
        const mensagem = encodeURIComponent(`Ola, tenho interesse neste produto: ${nome}`);
        return `
            <article class="apple-card public-card">
                <div>
                    ${criarVisualProduto(produto)}
                    <p class="categoria-tag">${escaparHtml(categoriaProduto(produto))}</p>
                    <h3 title="${escaparHtml(nome)}">${escaparHtml(nome)}</h3>
                    <p class="estoque public-stock">Preco e disponibilidade sob consulta</p>
                </div>
                <div>
                    <a class="card-add public-whatsapp" href="https://wa.me/5527992771900?text=${mensagem}" target="_blank" rel="noopener">Consultar vendedor</a>
                </div>
            </article>
        `;
    }).join('');
}

async function carregarProdutosPublicos() {
    const grid = document.getElementById('grid-publico');
    if (grid) {
        grid.innerHTML = '<p class="empty-state public-empty">Carregando produtos...</p>';
    }

    try {
        const resposta = await fetch('/api/produtos-publicos', { cache: 'no-store' });
        if (!resposta.ok) throw new Error('Falha ao carregar vitrine publica.');
        const dados = await resposta.json();
        produtosPublicos = dados.map(item => ({
            ...item,
            nome: corrigirTexto(item.nome),
            categoria: corrigirTexto(item.categoria)
        }));
        montarFiltrosPublicos();
        aplicarFiltrosPublicos();
    } catch (erro) {
        console.error('Erro ao carregar produtos publicos:', erro);
        if (grid) {
            grid.innerHTML = '<p class="empty-state public-empty">Nao foi possivel carregar a vitrine agora.</p>';
        }
    }
}

async function carregarProdutosCliente() {
    const grid = document.getElementById('grid-cliente');
    if (!grid) return;

    grid.innerHTML = '<p class="empty-state public-empty">Carregando produtos...</p>';
    try {
        const resposta = await fetch('/api/cliente/produtos', { cache: 'no-store' });
        if (!resposta.ok) throw new Error('Login necessario.');
        const dados = await resposta.json();
        produtosCliente = dados.map(item => ({
            ...item,
            nome: corrigirTexto(item.nome),
            categoria: corrigirTexto(item.categoria)
        }));
        renderizarProdutosPublicos(ordenarProdutosPublicos(produtosCliente), 'grid-cliente');
    } catch (erro) {
        console.error('Erro ao carregar produtos do cliente:', erro);
        grid.innerHTML = '<p class="empty-state public-empty">Entre com Google para ver a vitrine de clientes.</p>';
    }
}

function buscarPublico(event) {
    event.preventDefault();
    estadoPublico.busca = document.getElementById('busca-publica')?.value || '';
    aplicarFiltrosPublicos();
}

function limparBuscaPublica() {
    const campo = document.getElementById('busca-publica');
    if (campo) campo.value = '';
    estadoPublico.busca = '';
    aplicarFiltrosPublicos();
}

function alterarOrdenacaoPublica(valor) {
    estadoPublico.ordenacao = valor;
    aplicarFiltrosPublicos();
}

async function carregarConfigPublica() {
    try {
        const resposta = await fetch('/api/config-publica', { cache: 'no-store' });
        const config = await resposta.json();
        googleClientId = config.googleClientId || '';
        prepararGoogleLogin();
    } catch (erro) {
        console.error('Erro ao carregar configuracao publica:', erro);
        atualizarStatusLogin('Nao foi possivel carregar a configuracao do login.');
    }
}

function atualizarStatusLogin(mensagem) {
    const status = document.getElementById('google-login-status');
    if (status) status.textContent = mensagem;
}

function prepararGoogleLogin() {
    if (!googleClientId) {
        atualizarStatusLogin('Login com Google ainda nao configurado. Informe GOOGLE_CLIENT_ID no servidor.');
        return;
    }

    if (!window.google?.accounts?.id) {
        setTimeout(prepararGoogleLogin, 250);
        return;
    }

    window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: receberLoginGoogle,
        use_fedcm_for_prompt: true
    });
    window.google.accounts.id.renderButton(
        document.getElementById('google-login-button'),
        { theme: 'outline', size: 'large', shape: 'rectangular', text: 'signin_with', width: 280 }
    );
    atualizarStatusLogin('Entre com sua conta Google para liberar a area de cliente.');
}

async function receberLoginGoogle(respostaGoogle) {
    try {
        atualizarStatusLogin('Validando login...');
        const resposta = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: respostaGoogle.credential })
        });
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.error || 'Falha no login.');
        clienteAtual = dados.cliente;
        renderizarClienteLogado();
        await carregarProdutosCliente();
    } catch (erro) {
        console.error('Erro no login Google:', erro);
        atualizarStatusLogin(erro.message || 'Nao foi possivel entrar com Google.');
    }
}

async function carregarSessaoCliente() {
    try {
        const resposta = await fetch('/api/auth/me', { cache: 'no-store' });
        const dados = await resposta.json();
        if (dados.loggedIn) {
            clienteAtual = dados.cliente;
            renderizarClienteLogado();
            await carregarProdutosCliente();
        }
    } catch (erro) {
        console.error('Erro ao ler sessao:', erro);
    }
}

function preencherFormularioPerfil(profile = {}) {
    const form = document.querySelector('.client-form');
    if (!form) return;

    ['telefone', 'cidade', 'estado', 'bairro', 'comoEncontrou', 'instagram', 'facebook', 'tiktok', 'interesse', 'latitude', 'longitude'].forEach(campo => {
        if (form.elements[campo]) form.elements[campo].value = profile[campo] || '';
    });
    if (form.elements.aceitaContato) form.elements.aceitaContato.checked = Boolean(profile.aceitaContato);
    if (form.elements.consentimentoDados) form.elements.consentimentoDados.checked = Boolean(profile.consentimentoDados);

    const localizacaoStatus = document.getElementById('localizacao-status');
    if (localizacaoStatus && profile.latitude && profile.longitude) {
        localizacaoStatus.textContent = `Localizacao salva: ${profile.latitude}, ${profile.longitude}`;
    }
}

function renderizarClienteLogado() {
    const loginCard = document.getElementById('login-card');
    const dashboard = document.getElementById('client-dashboard');
    if (loginCard) loginCard.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';

    document.getElementById('cliente-nome').textContent = clienteAtual?.name || 'Cliente';
    document.getElementById('cliente-email').textContent = clienteAtual?.email || '';
    const foto = document.getElementById('cliente-foto');
    if (foto && clienteAtual?.picture) foto.src = clienteAtual.picture;
    preencherFormularioPerfil(clienteAtual?.profile || {});
}

async function salvarPerfilCliente(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = document.getElementById('perfil-status');
    const dados = Object.fromEntries(new FormData(form).entries());
    dados.aceitaContato = Boolean(form.elements.aceitaContato?.checked);
    dados.consentimentoDados = Boolean(form.elements.consentimentoDados?.checked);

    if (status) status.textContent = 'Salvando...';
    try {
        const resposta = await fetch('/api/clientes/perfil', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.error || 'Erro ao salvar perfil.');
        clienteAtual = resultado.cliente;
        preencherFormularioPerfil(clienteAtual.profile || {});
        if (status) status.textContent = 'Perfil salvo.';
    } catch (erro) {
        console.error('Erro ao salvar perfil:', erro);
        if (status) status.textContent = erro.message || 'Nao foi possivel salvar.';
    }
}

function solicitarLocalizacaoCliente() {
    const status = document.getElementById('localizacao-status');
    const form = document.querySelector('.client-form');
    if (!navigator.geolocation || !form) {
        if (status) status.textContent = 'Seu navegador nao liberou geolocalizacao.';
        return;
    }

    if (status) status.textContent = 'Solicitando permissao...';
    navigator.geolocation.getCurrentPosition(
        posicao => {
            const latitude = posicao.coords.latitude.toFixed(6);
            const longitude = posicao.coords.longitude.toFixed(6);
            form.elements.latitude.value = latitude;
            form.elements.longitude.value = longitude;
            if (status) status.textContent = `Localizacao adicionada: ${latitude}, ${longitude}`;
        },
        () => {
            if (status) status.textContent = 'Localizacao nao compartilhada.';
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
}

async function sairCliente() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    carregarProdutosPublicos();
    carregarConfigPublica();
    carregarSessaoCliente();
});
