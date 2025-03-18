export interface User {
  id: string;
  wallet_address: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export interface Will {
  id: string;
  creator_id: string;
  contract_will_id: number;
  status: 'draft' | 'active' | 'executed';
  created_at: string;
}

export interface Beneficiary {
  id: string;
  will_id: string;
  wallet_address: string;
  share_percentage: number;
  created_at: string;
}

export interface VaultTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdraw' | 'yield';
  created_at: string;
}