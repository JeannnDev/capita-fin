export interface Account {
    id: string
    name: string
    balance: number
    type: 'checking' | 'savings' | 'credit' | 'wallet' | 'food'
    color: string
    institution?: string
}

export interface Transaction {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    accountId: string
    date: string
    isPaid: boolean
}

export interface Reminder {
    id: string
    title: string
    amount: number
    dueDate: string
    frequency: 'once' | 'weekly' | 'monthly' | 'yearly'
    category: string
    isPaid: boolean
    accountId?: string
}

export interface Budget {
    id: string
    category: string
    limit: number
    spent: number
    color: string
    limitType?: 'value' | 'percentage'
    limitValue?: number // The value entered by the user (either absolute or %)
}

export interface Category {
    id: string
    name: string
    icon: string
    color: string
    type: 'income' | 'expense'
}

export interface Goal {
    id: string
    name: string
    targetAmount: number
    currentAmount: number
    deadline?: string
    icon: string
    color: string
    contributions: GoalContribution[]
}

export interface GoalContribution {
    id: string
    amount: number
    date: string
    accountId?: string
}

export type Period = 'day' | 'week' | 'month' | 'year'
