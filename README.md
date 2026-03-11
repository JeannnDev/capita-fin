# CapitaFin 💎 
### Gestão Financeira com Estética Premium e Inteligência

O **CapitaFin** não é apenas um gerenciador de gastos; é uma plataforma de controle financeiro de alta fidelidade desenhada para oferecer sofisticação, clareza e insights profundos. Construído com as tecnologias mais modernas do ecossistema Web, prioriza a experiência do usuário (UX) através de uma interface baseada em glassmorphism, micro-animações e densidade de informação inteligente.

---

## 🌟 Diferenciais do Dashboard

- **💎 Estética Premium**: Interface limpa, com transparências dinâmicas, gradientes suaves e tipografia moderna (Outfit/Inter).
- **📈 Inteligência de Dados**: Dashboard consolidado com métricas em tempo real de saldo, receitas e despesas.
- **📊 Planejamento 50-25-15**: Metodologia integrada para alocação automática de recursos entre Necessidades, Desejos e Investimentos.
- **⚡ Performance Extrema**: Renderização híbrida com Next.js, garantindo navegação instantânea e SEO otimizado.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev) |
| **Estilização** | [Tailwind CSS 4](https://tailwindcss.com), [Framer Motion](https://framer.com/motion) |
| **Componentes** | [Shadcn UI](https://ui.shadcn.com), [Radix UI](https://radix-ui.com) |
| **Banco de Dados** | [Drizzle ORM](https://orm.drizzle.team), [Neon (PostgreSQL)](https://neon.tech) |
| **Autenticação** | [Better Auth](https://better-auth.com) |
| **Gráficos** | [Recharts](https://recharts.org) |
| **Validação** | [Zod](https://zod.dev) |

---

## 📁 Estrutura da Aplicação (App Map)

A arquitetura do projeto segue os padrões mais rigorosos de escalabilidade e manutenção:

### 📍 `/app` (Rotas & Páginas)
- **`dashboard/` (Página Inicial)**: Visão geral com cards interativos de saldo e atalhos rápidos.
- **`extrato/`**: Histórico detalhado de movimentações com filtros avançados de busca.
- **`contas/`**: Gestão de contas bancárias, carteiras e cartões, incluindo visão detalhada por ID.
- **`transacoes/`**: Lançamentos rápidos de receitas e despesas com categorização inteligente.
- **`metas/`**: Sistema de "caixinhas" de economia com barra de progresso e histórico de aportes.
- **`lembretes/`**: Controle de contas a pagar/receber com statuses de pendência e atraso.
- **`estatisticas/`**: Gráficos de fluxo histórico e distribuição por categoria via Recharts.
- **`orcamento/`**: Painel estratégico baseado na regra 50-25-15.

### 🧩 `/components`
- **`ui/`**: Nossa biblioteca de design system customizada baseada em Shadcn.
- **`dashboard/`**: Componentes específicos para visualização de dados e cards premium.
- **`layout/`**: Estruturas globais como o `AppHeader`, `AppShell` e navegação responsiva.

### ⚙️ `/lib` & `/actions`
- **`finance-context.tsx`**: Gestão de estado global para dados financeiros em tempo real.
- **`server-actions`**: Lógica de backend executada no servidor para máxima segurança.

---

## 🚀 Como Iniciar o Projeto

### 1. Clonagem e Dependências
```bash
git clone https://github.com/aizm-developer/capita-fin.git
cd capita-fin
npm install
```

### 2. Configuração de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```env
DATABASE_URL=postgresql://user:password@host/dbname
BETTER_AUTH_SECRET=sua_chave_secreta
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3. Banco de Dados
Sincronize o schema do Drizzle com seu banco Neon:
```bash
npx drizzle-kit push
```

### 4. Execução
```bash
npm run dev
```

---

## 🎨 Filosofia de Design

O projeto utiliza um **"Design System Atomizado"**, onde cada componente (como o `PremiumBalanceCard`) é pensado para ser visualmente independente e contextualmente rico. 

- **Cores**: Paleta balanceada com tons de Índigo, Esmeralda e Rose para significância financeira imediata.
- **Tipografia**: Uso extensivo de fontes em negrito (`font-black`) e espaçamento entre letras (`tracking-tighter`) para um ar de "Fintech de Luxo".
- **Espaçamento**: Grid otimizado para maximizar a densidade de informação sem poluição visual.

---

## 📄 Licença

Desenvolvido para uso exclusivo de **CapitaFin**. Todos os direitos reservados © 2026.