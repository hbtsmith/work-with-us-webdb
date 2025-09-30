# 🎨 Requisitos Não Funcionais – Frontend Web

## 1. Arquitetura e Tecnologias
- A aplicação será desenvolvida em **React.js**, utilizando **JavaScript** ou preferencialmente **TypeScript**.
- Será utilizado **Vite** ou **Next.js** como bundler/boilerplate.
- O frontend será **100% responsivo**, com abordagem **mobile-first**.
- O projeto deve utilizar **componentização reutilizável** com padrão de organização clara (ex: `components`, `pages`, `hooks`, `services`, etc.).
- Devem ser utilizadas bibliotecas para UI modernas e flexíveis, como:
  - **Tailwind CSS** (recomendado)
  - Ou **Shadcn/UI**, **MUI**, **Radix UI** ou equivalente.

## 2. Qualidade de Código
- Código deve seguir padrão **ESLint + Prettier**, com regras compartilhadas com o backend quando possível.
- Toda a escrita será feita em **inglês americano**, inclusive:
  - Nome de arquivos, componentes, variáveis, funções
  - Comentários e documentação

## 3. Testes e Confiabilidade
- Devem ser escritos testes de componentes com **Vitest**, **Testing Library** ou equivalente.
- Testes end-to-end são recomendados com **Cypress**.
- Cobertura mínima sugerida: **80%**.

## 4. Integração com Backend
- O frontend deverá se comunicar com o backend via **RESTful APIs** (ou **GraphQL**, se implementado futuramente).
- As chamadas devem ser organizadas via serviços centralizados (ex: `api/axios.ts`).

## 5. Acessibilidade e UX
- Interface deve respeitar diretrizes básicas de **acessibilidade (WCAG)**.
- Comportamentos interativos devem ser intuitivos.
- Deve ser possível navegar via **teclado (tab)**.

## 6. Performance e SEO (se aplicável)
- Utilizar lazy loading de componentes e imagens.
- Configurar **meta tags** dinâmicas (caso seja SPA com SSR).
- Score mínimo no **Lighthouse**: 90+ em desempenho e acessibilidade.

## 7. Deploy
- O frontend será empacotado e enviado para ambiente de **staging/produção** via CI/CD.
- Pode ser hospedado em serviços como **Vercel**, **Netlify**, **Render** ou **Cloudflare Pages**.