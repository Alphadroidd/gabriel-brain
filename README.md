# Gabriel Brain 🧠

Assistente pessoal do Gabriel — PWA com chat IA, tarefas e notas.

**Stack:** HTML/CSS/JS puro · Cloudflare Pages + Functions · Groq (llama-3.3-70b)

---

## ⚠️ PROBLEMA ATUAL — Leia isso primeiro

O Cloudflare está configurado como **Worker** (wrangler deploy), mas o projeto precisa ser **Pages**. São produtos diferentes:

| | Cloudflare Workers | Cloudflare Pages |
|--|--|--|
| Deploy | `npx wrangler deploy` | Git push automático |
| Functions | `src/index.js` ou similar | pasta `/functions` |
| Static files | Não nativo | pasta `/public` |
| Variáveis | Settings > Variables | Settings > Variables |

---

## ✅ SOLUÇÃO: Migrar para Cloudflare Pages

### Passo 1 — Deletar o Worker atual

1. No Cloudflare Dashboard → **Workers & Pages**
2. Clique em `gabriel-brain`
3. Settings → Role até o fim → **Delete** (botão vermelho)
4. Confirme digitando o nome

### Passo 2 — Criar projeto Pages novo

1. Workers & Pages → **Create**
2. Escolha **Pages** (não Workers)
3. Clique em **Connect to Git**
4. Selecione o repo `Alphadroidd/gabriel-brain`
5. Configure o build:

```
Framework preset:    None
Build command:       (deixe vazio)
Build output dir:    public
Root directory:      (deixe vazio)
```

6. Clique em **Save and Deploy**

### Passo 3 — Adicionar a variável GROQ_API_KEY

1. No projeto Pages → **Settings** → **Environment variables**
2. Clique em **Add variable**
3. Nome: `GROQ_API_KEY`
4. Valor: sua chave `gsk_...`
5. Marque **Production** e **Preview**
6. Clique **Save**

### Passo 4 — Fazer push do código corrigido

```bash
# No terminal, na pasta do projeto:
git add .
git commit -m "fix: migrate to Cloudflare Pages"
git push origin main
```

O Cloudflare vai fazer o deploy automaticamente em ~1 minuto.

---

## Estrutura do projeto

```
gabriel-brain/
├── public/                  ← tudo que é servido ao browser
│   ├── index.html           ← PWA completa
│   ├── manifest.json        ← config PWA
│   ├── _headers             ← headers HTTP
│   └── _redirects           ← rotas SPA
├── functions/               ← serverless functions (Cloudflare Pages)
│   └── api/
│       └── chat.js          ← endpoint POST /api/chat
└── wrangler.toml            ← config Cloudflare Pages
```

> **Importante:** A pasta `functions/` fica na raiz, FORA de `public/`. Cloudflare Pages detecta automaticamente.

---

## Como funciona a integração Groq

O `functions/api/chat.js` expõe o endpoint `POST /api/chat`.

O frontend chama `/api/chat` (caminho relativo) — Cloudflare injeta a Function automaticamente.

```
Browser → /api/chat → functions/api/chat.js → api.groq.com → resposta
```

---

## Variáveis de ambiente

| Variável | Onde definir | Descrição |
|--|--|--|
| `GROQ_API_KEY` | Pages > Settings > Variables | Chave da API Groq |

---

## Roadmap

- [x] Chat com memória (localStorage)
- [x] Tarefas com prioridade e prazo
- [x] Notas rápidas
- [x] Export para Obsidian (.md)
- [ ] Cloudflare D1 (banco persistente)
- [ ] Login com Google
- [ ] Sync com vault Obsidian via GitHub

---

## Dev local

```bash
npm install -g wrangler

# Crie um arquivo .dev.vars na raiz:
echo "GROQ_API_KEY=gsk_sua_chave_aqui" > .dev.vars

# Rode localmente:
npx wrangler pages dev public --compatibility-date=2024-01-01
```

Acesse `http://localhost:8788`
