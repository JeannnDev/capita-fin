# 🚀 CapitaFin — Inteligência Financeira Premium

O **CapitaFin** é uma plataforma de gestão financeira de alto nível, projetada para oferecer uma experiência visual impactante (Dark Premium) aliada a um controle rigoroso e intuitivo das finanças pessoais. Esta proposta detalha as funcionalidades implementadas, a arquitetura tecnológica e a visão de produto.

---

## 🎨 Design & Experiência (UX/UI)
O sistema foi construído sob uma estética **"Glassmorphism Dark Premium"**, focada em:
- **Interface Viva:** Micro-animações suaves utilizando Framer Motion.
- **Visual Impactante:** Uso de gradientes mesh, efeitos de vidro (blur) e tipografia moderna (Geist).
- **Dashboard Dinâmico:** Cards interativos com atualização em tempo real de saldos e estatísticas.

---

## 🔐 Ecossistema de Autenticação
Segurança robusta implementada via **Better Auth**, garantindo integridade dos dados:
- **Login Multimodal:** Suporte para E-mail/Senha tradicional e Login Social com Google.
- **Fluxo de Recuperação:** Sistema completo de "Esqueci minha senha" com envio de e-mails via SMTP (Nodemailer), link de redefinição seguro e interface de nova senha com validação de força.
- **Proteção de Rotas:** Middleware inteligente que detecta sessões e protege áreas restritas, redirecionando usuários não autenticados automaticamente.

---

## 📊 Gestão Financeira Centralizada
O núcleo da aplicação permite o controle total do fluxo de caixa:
### 1. Gestão de Contas
- Suporte a múltiplos tipos de conta (Corrente, Poupança, Investimentos, Crédito, Carteira, Vale Alimentação).
- Saldo consolidado e saldo individual por conta.
- Identificação por instituições financeiras e cores personalizadas.

### 2. Controle de Movimentações
- **Transações Inteligentes:** Registro de Entradas (Receitas) e Saídas (Despesas).
- **Sincronização de Saldo:** Ajuste automático e persistente do saldo bancário ao criar, editar ou excluir uma transação.
- **Histórico Detalhado:** Filtros por período (Data Início/Fim), busca por descrição e categorização automática.

### 3. Categorização & Orçamento
- Sistema de categorias com ícones e cores para análise visual.
- **Orçamentos (Budgets):** Definição de limites de gastos por categoria com barra de progresso em tempo real.

### 4. Planejamento de Metas
- Criação de metas financeiras com acompanhamento de progresso.
- Registro de contribuições específicas para cada meta.

### 5. Lembretes de Pagamento
- Agendamento de contas a pagar com status de "Pendente" ou "Confirmado".
- Integração automática: ao marcar um lembrete como pago, o sistema gera a transação correspondente e abate do saldo da conta.

---

## 🛠️ Stack Tecnológica
A infraestrutura utiliza o que há de mais moderno no desenvolvimento web:
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router).
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) (Hospedado via NeonDB).
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Alta performance e type-safety).
- **Autenticação:** [Better Auth](https://www.better-auth.com/).
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com design system customizado.
- **Animações:** [Framer Motion](https://www.framer.com/motion/).
- **Comunicação:** [Nodemailer](https://nodemailer.com/) para notificações e transacionais.

---

## 🚀 Próximos Passos (Roadmap)
- [ ] **Relatórios em PDF:** Exportação de extratos e resumos mensais.
- [ ] **IA Financeira:** Insights automáticos baseados nos hábitos de consumo usando Gemini API.
- [ ] **Importação de Extratos:** Suporte a arquivos OFX e CSV de bancos brasileiros.
- [ ] **Modo Multi-moeda:** Suporte para contas em Dólar/Euro com conversão em tempo real.

---

**CapitaFin — Transformando sua relação com o dinheiro através da tecnologia.**