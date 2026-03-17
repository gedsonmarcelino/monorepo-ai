# Monorepo AI

Monorepo em `Node.js + TypeScript` para serviços backend e bibliotecas compartilhadas.

## Visão geral

O projeto usa:

- `Yarn workspaces`
- `TypeScript` com `ESM`
- `Vitest`
- `ESLint` e `Prettier`

A primeira API oficial do monorepo é o serviço de autenticação em [apps/auth/README.md](./apps/auth/README.md).

## Estrutura

```text
.
├─ apps/
│  ├─ api/
│  ├─ auth/
│  └─ worker/
├─ packages/
│  ├─ config-eslint/
│  ├─ config-typescript/
│  ├─ shared/
│  └─ utils/
├─ .editorconfig
├─ .gitignore
├─ .prettierrc
├─ eslint.config.mjs
├─ package.json
├─ tsconfig.base.json
├─ vitest.config.mjs
└─ README.md
```

## Workspaces

- `apps/auth`
  Serviço dedicado de autenticação. Documentação própria em [apps/auth/README.md](./apps/auth/README.md).
- `apps/api`
  Placeholder para futuros serviços ou gateway.
- `apps/worker`
  Placeholder para processamento assíncrono.
- `packages/config-eslint`
  Configuração compartilhada de lint.
- `packages/config-typescript`
  Presets compartilhados de TypeScript.
- `packages/shared`
  Código compartilhado entre apps.
- `packages/utils`
  Utilitários reutilizáveis do monorepo.

## Convenções

- `apps/*` são aplicações executáveis.
- `packages/*` são bibliotecas e configurações compartilhadas.
- Cada workspace usa `src/` como entrada e `dist/` como saída de build.
- O namespace interno adotado é `@repo/*`.
- Apps podem depender de packages.
- Packages não devem depender de apps.

## Scripts da raiz

- `yarn dev`
  compila as libs internas e inicia `@repo/auth` em modo watch
- `yarn build`
  compila os workspaces principais
- `yarn lint`
  executa o lint do monorepo
- `yarn test`
  executa os testes do monorepo
- `yarn typecheck`
  valida tipos em todos os workspaces principais
- `yarn clean`
  remove saídas de build dos workspaces

## Como começar

```bash
yarn install
yarn dev
```

## Criando novos workspaces

1. Crie a pasta em `apps/` ou `packages/`.
2. Adicione `package.json`, `tsconfig.json` e `src/index.ts`.
3. Estenda `@repo/config-typescript/app` para apps ou `@repo/config-typescript/package` para bibliotecas.
4. Reaproveite os scripts padrão de `build`, `clean`, `lint`, `test` e `typecheck`.
5. Exporte a entrada principal usando o campo `exports` no `package.json`.
