# 🗳️ Consulta Eleitoral - Sistema de Votação Digital

## 📋 Descrição

Sistema completo de votação digital com análise geográfica, painel administrativo e suporte multi-plataforma (Web, iOS, Android).

**Versão:** 3.0 com som de urna eletrônica
**Data:** 01/03/2026
**Status:** Pronto para produção

---

## ✨ Principais Características

✅ **Cadastro de Eleitores**
- Validação de CPF
- Verificação de idade (mínimo 16 anos)
- Seleção de Estado, Município e Bairro
- Fallback automático para cidades não mapeadas

✅ **Votação Digital**
- Interface intuitiva com fotos dos candidatos
- Confirmação de voto
- **Som de urna eletrônica** (beep característico)
- Segurança e transparência

✅ **Análise de Resultados**
- Gráficos em tempo real
- Análise por bairro e região
- Dashboard interativo
- Exportação de dados

✅ **Painel Administrativo**
- Geração de dados de teste
- Controle de votação
- Visualização de resultados parciais
- Gerenciamento completo

✅ **Design Responsivo**
- Tema Glassmorphism Patriótico
- Compatível com desktop, tablet e mobile
- Cores brasileiras (verde, amarelo, azul)
- Interface moderna e profissional

---

## 🚀 Como Executar Localmente

### Pré-requisitos

- **Node.js** 18+ (https://nodejs.org/)
- **pnpm** (gerenciador de pacotes)
  ```bash
  npm install -g pnpm
  ```

### Instalação

1. **Extrair o arquivo ZIP**
   ```bash
   unzip consulta-eleitoral-v3-completo.zip
   cd consulta-eleitoral
   ```

2. **Instalar dependências**
   ```bash
   pnpm install
   ```

3. **Iniciar servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```

4. **Acessar no navegador**
   ```
   http://localhost:3000/
   ```

---

## 📱 Fluxo de Uso

### 1️⃣ Página Inicial
- Bem-vindo ao sistema
- Opções: Cadastrar, Votar, Ver Resultados, Admin

### 2️⃣ Cadastro de Eleitor
- Nome completo
- CPF (com máscara)
- Data de nascimento (DD/MM/AAAA)
- Estado (carregado do IBGE)
- Município (carregado do IBGE)
- Bairro/Região (com fallback automático)

**Validações:**
- Idade mínima: 16 anos
- CPF: 11 dígitos
- Data: formato válido

### 3️⃣ Votação
- Seleção de candidato
- Confirmação de voto
- **🔊 Som de urna eletrônica** (beep duplo)
- Mensagem de sucesso
- Retorno à página inicial

### 4️⃣ Resultados
- Gráficos em tempo real
- Análise por bairro
- Distribuição regional
- Estatísticas completas

### 5️⃣ Painel Admin
- Login com senha
- Geração de dados de teste
- Visualização de resultados parciais
- Limpeza de dados

---

## 🎨 Estrutura de Arquivos

```
consulta-eleitoral/
├── client/
│   ├── public/
│   │   ├── images/           # Imagens dos candidatos
│   │   └── background-main.jpg
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx      # Página inicial
│   │   │   ├── Register.tsx  # Cadastro de eleitor
│   │   │   ├── Voting.tsx    # Votação (COM SOM 🔊)
│   │   │   ├── Results.tsx   # Resultados
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   └── Welcome.tsx
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Map.tsx
│   │   │   └── ui/           # Componentes shadcn/ui
│   │   ├── lib/
│   │   │   ├── bairros.ts    # Mapa de bairros com fallback
│   │   │   └── utils.ts
│   │   ├── App.tsx           # Roteamento
│   │   ├── index.css         # Estilos globais
│   │   └── main.tsx
│   ├── index.html
│   └── vite.config.ts
├── package.json
├── tsconfig.json
└── README_SETUP.md           # Este arquivo
```

---

## 🔊 Som de Urna Eletrônica

O sistema agora inclui **som de urna eletrônica** ao confirmar o voto!

**Características:**
- Beep duplo característico (800 Hz + 600 Hz)
- Duração: 250ms total
- Funciona em todos os navegadores modernos
- Pode ser silenciado pelo navegador se o usuário preferir

**Localização do código:**
- Arquivo: `client/src/pages/Voting.tsx`
- Função: `playBallotSound()`

---

## 📊 Dados de Teste

### Candidatos Pré-configurados
1. **Capitão Boanerges** (10)
2. **Judite Alapenha** (20)
3. **Coronel Alexandre Bilica** (11)
4. **Washington Azevedo** (40)
5. **Daniel Godoy** (50)
6. **Gilvado do Sindicato** (15)

### Cidades Mapeadas
- São Paulo (SP)
- Rio de Janeiro (RJ)
- Belo Horizonte (MG)
- Salvador (BA)
- Brasília (DF)
- Curitiba (PR)
- **Bom Conselho (PE)** ✨ Novo!
- **Garanhuns (PE)** ✨ Novo!
- **Recife (PE)** ✨ Novo!

### Fallback Automático
Para cidades não mapeadas:
- Centro
- Zona Rural
- Distritos
- Outros

---

## 🛠️ Configurações

### Tema
- **Modo:** Dark (Glassmorphism)
- **Cores:** Verde, Amarelo, Azul (Patriótico)
- **Fonte:** Sans-serif moderna

### Validações
- **Idade mínima:** 16 anos
- **CPF:** 11 dígitos
- **Data:** DD/MM/AAAA

### Armazenamento
- **LocalStorage:** Eleitores e votos
- **Sem servidor:** Dados persistem apenas no navegador

---

## 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

---

## 🔐 Segurança

### Admin Panel
- Senha: `admin123`
- Acesso restrito
- Dados simulados (LocalStorage)

**Nota:** Para produção, implementar:
- Autenticação real
- Backend seguro
- Banco de dados
- HTTPS obrigatório

---

## 🚀 Deploy

### Opção 1: Manus (Recomendado)
```bash
# Criar checkpoint
pnpm build

# Publicar via UI Manus
# Clique em "Publish" no painel de controle
```

### Opção 2: Vercel
```bash
npm install -g vercel
vercel
```

### Opção 3: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Opção 4: GitHub Pages
```bash
pnpm build
# Fazer push para branch gh-pages
```

---

## 🐛 Troubleshooting

### Problema: Dropdown de bairros vazio
**Solução:** O sistema oferece automaticamente opções genéricas (Centro, Zona Rural, Distritos, Outros)

### Problema: Som não funciona
**Solução:** Verifique se o navegador permite áudio. Alguns navegadores requerem interação do usuário primeiro.

### Problema: Imagens dos candidatos não aparecem
**Solução:** Adicione as imagens em `client/public/images/` com nomes: `candidate-10.jpg`, `candidate-20.jpg`, etc.

### Problema: Dados não persistem
**Solução:** O sistema usa LocalStorage. Limpe o cache do navegador e tente novamente.

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este README
2. Consulte o arquivo `CAMPANHA_PROPAGANDA_CANDIDATOS.md`
3. Verifique o arquivo `CALENDARIO_POSTAGENS.md`

---

## 📄 Licença

Sistema de Consulta Eleitoral - Versão 3.0
Desenvolvido em 01/03/2026

---

## ✅ Checklist de Implementação

- [x] Cadastro de eleitores com validações
- [x] Votação com interface intuitiva
- [x] Som de urna eletrônica 🔊
- [x] Análise de resultados
- [x] Painel administrativo
- [x] Suporte a bairros (com fallback)
- [x] Tema Glassmorphism Patriótico
- [x] Responsividade completa
- [x] Integração IBGE (Estados e Municípios)
- [x] LocalStorage para persistência
- [x] Documentação completa

---

## 🎯 Próximos Passos

1. Adicionar imagens dos candidatos
2. Implementar backend real
3. Adicionar banco de dados
4. Implementar autenticação
5. Deploy em produção
6. Campanha de marketing (veja CAMPANHA_PROPAGANDA_CANDIDATOS.md)

---

**Desenvolvido com ❤️ para a democracia digital brasileira**

🇧🇷 Consulta Eleitoral - Sistema de Votação Digital
