# Finanças Pessoais

Aplicação web para gerenciamento de finanças pessoais com suporte PWA (Progressive Web App).

## ✨ Funcionalidades

- 📊 **Dashboard** - Visão geral das finanças com gráficos e indicadores
- 💰 **Transações** - Cadastro de receitas e despesas
- 🏦 **Contas** - Gerenciamento de múltiplas contas/carteiras
- 🎯 **Metas** - Definição e acompanhamento de metas financeiras
- 🔄 **Recorrentes** - Transações automáticas mensais
- 📈 **Análises** - Gráficos avançados e insights
- 🌙 **Tema Claro/Escuro** - Suporte a modo noturno
- 📱 **PWA** - Funciona offline e pode ser instalado no celular

## 🚀 Tecnologias

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts (gráficos)
- Vite PWA Plugin

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/financas-app.git
cd financas-app

# Instale as dependências
npm install

# Gere os ícones do PWA
npm run generate-icons

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🏗️ Build

```bash
# Criar build de produção
npm run build

# Preview da build
npm run preview
```

## 🌐 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Conecte o repositório na Vercel
3. O deploy será automático!

Configurações já incluídas:
- `vercel.json` - Configuração de rotas e headers
- `vite.config.ts` - Configuração do PWA
- Ícones gerados automaticamente

## 📱 Instalação no Celular

### Android
1. Abra o site no Chrome
2. Toque no menu (3 pontos)
3. Selecione "Adicionar à tela inicial"

### iOS
1. Abra o site no Safari
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"

## 💾 Dados

Todos os dados são armazenados localmente no navegador usando `localStorage`. 
Você pode exportar/importar seus dados através da funcionalidade de backup no app.

## 📝 Licença

MIT - Carlos Dayton
