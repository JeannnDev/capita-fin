export function formatCurrency(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value)
}

export function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
    }).format(new Date(dateString))
}

export function formatFullDate(dateString: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(dateString))
}

export function getRelativeDate(dateString: string): string {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Hoje"
    if (diffDays === 1) return "Amanhã"
    if (diffDays === -1) return "Ontem"
    if (diffDays > 0 && diffDays <= 7) return `Em ${diffDays} dias`
    if (diffDays < 0 && diffDays >= -7) return `Há ${Math.abs(diffDays)} dias`

    return formatDate(dateString)
}

export function getFrequencyLabel(frequency: string): string {
    const labels: Record<string, string> = {
        once: "Única vez",
        weekly: "Semanal",
        monthly: "Mensal",
        yearly: "Anual",
    }
    return labels[frequency] || frequency
}
