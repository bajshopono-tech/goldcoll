export type KaratType = '24k' | '22k' | '21k' | '18k' | 'sanatan';

export type PriceUnit = 'bhori' | 'gram' | 'ana';

export type CategoryType = 'newGold' | 'oldGold' | 'wholesale' | 'retail';

export interface KaratPriceDetail {
  newGold: number;
  oldGold: number;
  wholesale: number;
  retail: number;
}

export interface KaratRates {
  karat: KaratType;
  factor: number;
  bhori: KaratPriceDetail;
  gram: KaratPriceDetail;
  ana: KaratPriceDetail;
}

export interface GoldRatesResponse {
  rawUsdOz: number;
  usdToBdt: number;
  base24kBhoriBDT: number;
  makingChargePerBhori?: number;
  vatPercentage?: number;
  calculatedAt: string;
  rates: Record<KaratType, KaratRates>;
}

export interface ForecastItem {
  period: '1_week' | '1_month';
  title: string;
  expectedMin22kBhori: number;
  expectedMax22kBhori: number;
  trend: 'bullish' | 'bearish' | 'stable';
  advice: string;
  adminNote: string;
  updatedAt: string;
}

export interface UserPayment {
  id: string;
  userName: string;
  userPhone: string;
  method: 'bkash_personal' | 'nagad_personal' | 'nagad_agent';
  targetNumber: string;
  trxId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  expiresAt: string;
}
