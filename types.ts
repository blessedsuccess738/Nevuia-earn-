
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
  playedTracksToday: string[]; 
  status: AccountStatus;
  plan: PlanTier;
  referralCode: string;
  withdrawalEnabled: boolean;
  referredBy?: string;
  lastDailyReset?: string;
  lastDailyRewardClaimed?: string;
  referralsCount: number;
  referralEarningsUSD: number;
}

export interface Transaction {
  id: string;
  userId: string;
  amountUSD: number;
  type: 'WITHDRAWAL' | 'ACTIVATION' | 'REFERRAL' | 'DAILY_REWARD';
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
  dailyRewardUSD: number;
  isWithdrawalOpen: boolean;
  withdrawalSchedule: string;
  telegramAdmin: string;
  telegramChannel: string;
  whatsappLink: string;
  paystackPublicKey: string;
  nubapiKey: string; 
  maintenanceMode: boolean; // Added for platform control
  announcement: string;      // Global announcement text
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
  enabled: boolean;
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  transactions: Transaction[];
  settings: AppSettings;
  tracks: MusicTrack[];
}
