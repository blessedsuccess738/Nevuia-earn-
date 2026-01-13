
export enum AccountStatus {
  NOT_ACTIVATED = 'NOT_ACTIVATED',
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  ACTIVATED = 'ACTIVATED',
  BANNED = 'BANNED'
}

export enum PlanTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM'
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
  songsListenedToday: number;
  status: AccountStatus;
  plan: PlanTier;
  referralCode: string;
  referredBy?: string;
  lastDailyReset?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amountUSD: number;
  type: 'WITHDRAWAL' | 'ACTIVATION';
  status: TransactionStatus;
  timestamp: string;
  details?: string;
  planRequested?: PlanTier;
}

export interface AppSettings {
  usdToNgnRate: number;
  minWithdrawalNGN: number;
  dailyCapUSD: number;
  referralBonusUSD: number;
  isWithdrawalOpen: boolean;
  withdrawalSchedule: string;
  telegramAdmin: string;
  telegramChannel: string;
  whatsappLink: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  albumArt: string;
  duration: number;
  earningUSD: number;
  category: string;
}
