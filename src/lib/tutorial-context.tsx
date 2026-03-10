"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface TutorialStep {
  id: string
  title: string
  description: string
  targetId?: string     // ID do elemento HTML a destacar
  position?: "top" | "bottom" | "left" | "right" | "center"
  route?: string        // Rota a navegar antes do passo
  icon?: string
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao Capita! 👋",
    description: "Vamos dar um tour rápido para você conhecer tudo que o sistema oferece. Você pode pular a qualquer momento.",
    position: "center",
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Aqui você tem uma visão geral das suas finanças: saldo total, receitas, despesas do mês e gráficos de evolução.",
    targetId: "sidebar-nav-dashboard",
    position: "right",
    route: "/",
  },
  {
    id: "contas",
    title: "Suas Contas",
    description: "Gerencie todas as suas contas financeiras: carteira, conta corrente, poupança, cartão de crédito ou vale. Cada conta tem seu próprio saldo e histórico.",
    targetId: "sidebar-nav-contas",
    position: "right",
    route: "/contas",
  },
  {
    id: "account-detail",
    title: "Detalhamento de Conta",
    description: "Clique em qualquer conta para ver um extrato completo com todas as movimentações. Você pode filtrar por período ou pesquisar por descrição.",
    targetId: "accounts-list",
    position: "top",
    route: "/contas",
  },
  {
    id: "transacoes",
    title: "Transações",
    description: "Registre entradas e saídas de dinheiro. Vincule cada transação a uma conta e categoria para manter tudo organizado.",
    targetId: "sidebar-nav-transacoes",
    position: "right",
    route: "/transacoes",
  },
  {
    id: "orcamento",
    title: "Orçamento",
    description: "Defina limites de gastos por categoria — em valor fixo ou percentual da sua renda. Veja rapidamente onde você está acima do planejado.",
    targetId: "sidebar-nav-orcamento",
    position: "right",
    route: "/orcamento",
  },
  {
    id: "metas",
    title: "Metas Financeiras",
    description: "Crie metas para o que você quer conquistar: viagem, reserva de emergência, novo eletrônico. Acompanhe o progresso e adicione contribuições.",
    targetId: "sidebar-nav-metas",
    position: "right",
    route: "/metas",
  },
  {
    id: "lembretes",
    title: "Lembretes",
    description: "Cadastre contas a pagar e receber com datas de vencimento. O sistema avisa quando há algo em atraso.",
    targetId: "sidebar-nav-lembretes",
    position: "right",
    route: "/lembretes",
  },
  {
    id: "novo",
    title: "Adicionar Rapidamente",
    description: "Use o botão '+' no cabeçalho para adicionar uma nova transação, conta, lembrete ou meta de forma rápida, de qualquer página.",
    targetId: "header-add-button",
    position: "bottom",
    route: "/",
  },
  {
    id: "done",
    title: "Tudo pronto! 🎉",
    description: "Você já conhece as principais funcionalidades do Capita. Explore à vontade e mantenha suas finanças sempre organizadas!",
    position: "center",
    route: "/",
  },
]

interface TutorialContextType {
  isActive: boolean
  currentStep: number
  steps: TutorialStep[]
  startTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  skipTutorial: () => void
  goToStep: (index: number) => void
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const startTutorial = () => {
    setCurrentStep(0)
    setIsActive(true)
  }

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      skipTutorial()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const skipTutorial = () => {
    setIsActive(false)
    setCurrentStep(0)
  }

  const goToStep = (index: number) => {
    if (index >= 0 && index < TUTORIAL_STEPS.length) {
      setCurrentStep(index)
    }
  }

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        steps: TUTORIAL_STEPS,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        goToStep,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider")
  }
  return context
}
