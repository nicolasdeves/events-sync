# Event Sync - Frontend

Frontend do sistema de gerenciamento de eventos desenvolvido com React, TypeScript e Tailwind CSS.

## Tecnologias

- **React 20** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Vite** - Build tool e dev server rápido
- **@react-oauth/google** - Integração com Google OAuth

## Instalação

```bash
npm install
```

## Configuração do Google OAuth

1. Crie um arquivo `.env` na raiz da pasta `frontend`:
```env
VITE_GOOGLE_CLIENT_ID=seu_client_id_aqui
```

2. Para obter o Client ID do Google:
   - Acesse o [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um novo projeto ou selecione um existente
   - Ative a API "Google+ API" ou "Google Identity Services"
   - Vá em "Credenciais" > "Criar credenciais" > "ID do cliente OAuth"
   - Configure as URLs autorizadas:
     - Origens JavaScript autorizadas: `http://localhost:5173`
     - URIs de redirecionamento autorizados: `http://localhost:5173`

3. Copie o Client ID e cole no arquivo `.env`

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## Build

Para gerar a build de produção:

```bash
npm run build
```

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/     # Componentes React (.tsx)
│   ├── App.tsx        # Componente principal
│   ├── main.tsx       # Ponto de entrada
│   └── index.css      # Estilos globais com Tailwind
├── index.html         # HTML principal
├── package.json       # Dependências e scripts
├── tsconfig.json      # Configuração TypeScript
├── vite.config.ts     # Configuração Vite
└── tailwind.config.js # Configuração Tailwind CSS
```
