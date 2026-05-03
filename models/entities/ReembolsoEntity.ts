// models/entities/ReembolsoEntity.ts

export interface ReembolsoEntity {
  id: number;
  order_id: number;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  created_at: string;
  updated_at?: string;
}