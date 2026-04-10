export interface Refund {
    id?: number
    payment_id: number
    amount: number
    reason: string
    created_at?: Date
}