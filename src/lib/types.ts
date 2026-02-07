export type PaymentMethod = 'bank_transfer' | 'kakaopay';
export type DonationStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Donation {
  id: string;
  created_at: string;
  lecture_title: string;
  lecture_description: string | null;
  amount: number;
  payment_method: PaymentMethod;
  status: DonationStatus;
  kakaopay_tid: string | null;
  kakaopay_order_id: string | null;
  name: string;
  phone: string;
  email: string;
  receipt_required: boolean;
  resident_number_encrypted: string | null;
  deposit_name_format: string | null;
  deposit_confirmed_at: string | null;
  deposit_confirmed_by: string | null;
}

export interface DonationFormData {
  lecture_title: string;
  lecture_description: string;
  amount: number;
  amount_type: 'free' | 'fixed';
  fixed_amounts?: number[];
  name: string;
  phone: string;
  email: string;
  receipt_required: boolean;
  resident_number_prefix?: string; // 앞 7자리
  payment_method: PaymentMethod;
}
