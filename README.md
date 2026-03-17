# Monorepo Node + TypeScript

Base inicial de um monorepo com `yarn workspaces`, `Node.js`, `TypeScript`, `ESM`, `ESLint`, `Prettier` e `Vitest`.

## Estrutura

```text
.
├─ apps/
│  ├─ api/
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
└─ vitest.config.mjs
```

## Convenções

- `apps/*`: aplicações executáveis, como APIs, workers e CLIs.
- `packages/*`: bibliotecas compartilhadas e configurações reutilizáveis.
- Cada workspace usa `src/` como entrada e `dist/` como saída de build.
- Apps podem depender de packages internos.
- Packages compartilhados não devem depender de apps.
- O escopo interno adotado é `@repo/*`.

## Scripts da raiz

- `yarn build`: compila todos os workspaces.
- `yarn clean`: remove saídas de build dos workspaces.
- `yarn dev`: compila as libs internas e sobe a app `@repo/api` em modo watch.
- `yarn lint`: executa o lint no monorepo.
- `yarn test`: executa os testes com `Vitest`.
- `yarn typecheck`: valida tipos em todos os workspaces.

## Como instalar

```bash
yarn install
```

## Como rodar

```bash
yarn dev
yarn build
yarn lint
yarn test
yarn typecheck
```

## Executar um workspace específico

```bash
yarn workspace @repo/api dev
yarn workspace @repo/worker build
yarn workspace @repo/shared test
```

## Criando novos workspaces

1. Crie a pasta em `apps/` ou `packages/`.
2. Adicione `package.json`, `tsconfig.json` e `src/index.ts`.
3. Estenda `@repo/config-typescript/app` para apps ou `@repo/config-typescript/package` para bibliotecas.
4. Reaproveite os scripts padrão de `build`, `clean`, `lint`, `test` e `typecheck`.
5. Exporte a entrada principal usando o campo `exports` no `package.json`.
