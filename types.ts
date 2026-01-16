
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

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'WITHDRAWAL_REQUEST' | 'NEW_MESSAGE' | 'ACTIVATION_REQUEST';
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
  notifications: Notification[];
  createdAt: string; // Track account creation date
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

export interface Message {
  id: string;
  userId: string; 
  username: string;
  text: string;
  timestamp: string;
  read: boolean;
  isAdmin: boolean; 
}

export interface AppSettings {
  usdToNgnRate: number;
  minWithdrawalNGN: number;
  minWithdrawalUSD: number; // Added USD minimum
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
  maintenanceMode: boolean;
  announcementSubject: string;
  announcementContent: string;
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
  messages: Message[];
  adminNotifications: AdminNotification[];
}
