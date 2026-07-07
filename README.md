# Site Game Mania

Site de vitrine e orcamento da Game Mania Informatica.

## Versoes do site

- `/` abre a vitrine publica, sem login, mostrando somente os produtos marcados como publicados.
- `/interno` abre a area interna, com produtos, rankings e orcamentos. Use `SITE_USER` e `SITE_PASSWORD` para proteger essa area.
- A area `Cliente Game Mania`, dentro da pagina publica, usa login com Google e mostra a vitrine para clientes logados.

Na area interna, cada card de produto tem o botao `Publicar` ou `Publicado`. Esse botao controla quais itens aparecem na vitrine publica.

## Arquivo privado de estoque

O arquivo `data/produtos.json` fica fora do Git porque pode conter custo interno dos produtos.
Para rodar em outro computador, crie esse arquivo localmente usando `data/produtos.example.json` como modelo.

O arquivo `data/produtos-publicos.json` guarda apenas os ids dos produtos publicados na vitrine.

O arquivo `data/clientes.json` fica fora do Git porque guarda cadastros, contatos e consentimentos dos clientes.

## Login com Google

Crie um OAuth Client ID no Google Cloud para aplicativo Web e configure as origens autorizadas, por exemplo:

- `http://localhost:3000`
- a URL temporaria do Cloudflare Tunnel, quando estiver testando fora da loja

Depois rode o site com:

```powershell
$env:GOOGLE_CLIENT_ID="cole-aqui-o-client-id-do-google"
$env:SESSION_SECRET="troque-por-uma-chave-grande-aleatoria"
```

O login salva nome, e-mail, foto e locale enviados pelo Google, alem dos dados que o cliente preencher voluntariamente no formulario. Localizacao do navegador so e salva quando o cliente clica no botao e autoriza.

## Rodar com senha

No PowerShell, dentro da pasta do projeto:

```powershell
$env:SITE_USER="gamemania"
$env:SITE_PASSWORD="troque-esta-senha"
$env:PORT="3000"
npm start
```

Sem `SITE_USER` e `SITE_PASSWORD`, o site abre sem senha.

## Link publico temporario

Com o site rodando localmente, use:

```powershell
cloudflared tunnel --url http://localhost:3000
```

O link gerado e temporario e deve ser usado apenas para testes.
