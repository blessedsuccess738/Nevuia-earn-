
export enum AccountStatus {
  NOT_ACTIVATED = 'NOT_ACTIVATED',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  ACTIVATED = 'ACTIVATED',
  BANNED = 'BANNED'
}

export enum TransactionStatus {
  PROCESSING = 'PROCESSING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  username: string;
  email: string;
  balanceUSD: number;
  totalSongs: number;
  dailyEarnings: number;
  status: AccountStatus;
  referralCode: string;
  referredBy?: string;
  lastDailyLogin?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amountUSD: number;
  type: 'WITHDRAWAL' | 'ACTIVATION';
  status: TransactionStatus;
  timestamp: string;
  details?: string;
}

export interface AppSettings {
  usdToNgnRate: number;
  activationFeeUSD: number;
  minWithdrawalUSD: number;
  dailyCapUSD: number;
  referralBonusUSD: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
}
