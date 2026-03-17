# Auth Service

Serviço de autenticação do monorepo, implementado como app separado em `apps/auth`.

## Objetivo

Fornecer autenticação para clientes `web` e `mobile` usando:

- `email + senha`
- `access token` JWT
- `refresh token` rotativo
- criação manual de usuários
- sessões persistidas futuramente em banco

## Stack planejada

- `Express`
- `TypeScript`
- `Vitest`
- `zod`
- `bcrypt`
- `SQLite`
- `Prisma`

Nesta fase, parte dessa stack ainda está representada por contratos e fakes para permitir desenvolvimento orientado a testes.

## Estrutura atual

```text
apps/auth
├─ src/
│  ├─ app/
│  ├─ contracts/
│  ├─ lib/
│  └─ modules/
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Módulos atuais

- `src/app`
  Bootstrap inicial do Express e rota `/health`.
- `src/contracts`
  Tipos de entrada, saída, sessão e contexto autenticado.
- `src/lib`
  Erros, abstrações de segurança e controle de tempo.
- `src/modules/auth`
  Serviço principal de autenticação e regras de refresh token.
- `src/modules/users`
  Contratos e repositório in-memory de usuários.
- `src/modules/sessions`
  Contratos e repositório in-memory de sessões.

## Regras de negócio

- Usuários não serão criados por endpoint público no v1.
- Apenas usuários ativos podem autenticar.
- O `access token` será enviado no header `Authorization`.
- O `refresh token` será enviado no corpo da requisição.
- O `refresh token` deve ser rotativo e invalidado após uso.
- Sessões revogadas ou expiradas não podem renovar tokens.

## Endpoints planejados

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Status da Fase 1

Já existe:

- workspace `apps/auth`
- bootstrap inicial do Express com `/health`
- contratos de autenticação
- `AuthService`
- repositórios in-memory para testes
- fakes de hashing, token e clock
- testes unitários cobrindo login, refresh, logout e contexto autenticado

Ainda não existe:

- rotas completas de autenticação
- integração HTTP dos endpoints planejados
- banco real
- Prisma e migrations
- seed administrativo definitivo
- JWT real
- `bcrypt` real

## Estratégia de testes

O serviço está sendo construído com testes unitários primeiro.

### Cobertura atual

- autenticação com credenciais válidas
- rejeição de email inexistente
- rejeição de senha inválida
- rejeição de usuário inativo
- rotação de refresh token
- bloqueio de refresh reutilizado
- rejeição de sessão expirada
- revogação de sessão
- leitura do contexto autenticado

### Próximas camadas de teste

- testes de integração HTTP
- testes com persistência real
- testes de fluxo completo com banco

## Scripts

```bash
yarn workspace @repo/auth dev
yarn workspace @repo/auth build
yarn workspace @repo/auth test
yarn workspace @repo/auth typecheck
```

## Como rodar nesta fase

### Instalar dependências

```bash
yarn install
```

### Subir o serviço

```bash
yarn workspace @repo/auth dev
```

### Rodar os testes unitários do auth

```bash
yarn workspace @repo/auth test
```

## Roadmap

### Fase 1

- criar a estrutura do serviço
- definir contratos do domínio
- escrever testes unitários
- documentar a API de autenticação

### Fase 2

- implementar handlers e rotas Express
- adicionar validação de payload
- conectar controladores ao domínio
- preparar tratamento consistente de erros

### Fase 3

- adicionar persistência real
- introduzir `Prisma + SQLite`
- criar schema e migrations
- criar seed/admin user manual
- trocar fakes por implementações reais de token e hash

## Limitações atuais

- A autenticação ainda não está exposta pelos endpoints finais.
- O armazenamento ainda é in-memory para o domínio testado.
- O hash de senha e os tokens ainda usam implementações fake de fase inicial.
- Esta documentação já descreve o roadmap completo, mas nem tudo nela está implementado ainda.
