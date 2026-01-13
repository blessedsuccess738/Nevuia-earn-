
import { MusicTrack, AppSettings, PlanTier } from './types';

export const ADMIN_EMAIL = 'blessedsuccess738@gmail.com';

export const INITIAL_SETTINGS: AppSettings = {
  usdToNgnRate: 1200, 
  minWithdrawalNGN: 5000,
  dailyCapUSD: 5.00,
  referralBonusUSD: 0.50,
  dailyRewardUSD: 0.10,
  isWithdrawalOpen: true,
  withdrawalSchedule: 'Available 24/7',
  telegramAdmin: 'https://t.me/admin',
  telegramChannel: 'https://t.me/channel',
  whatsappLink: 'https://wa.me/yournumber',
  paystackPublicKey: 'pk_test_placeholder_please_replace',
  nubapiKey: '' 
};

export const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank", code: "023" },
  { name: "Diamond Bank", code: "063" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank Nigeria", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank", code: "214" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank Limited", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint", code: "50515" },
  { name: "OPay", code: "999992" },
  { name: "Palmpay", code: "999991" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "039" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Suntrust Bank Nigeria Limited", code: "100" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Unity Bank plc", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" }
].sort((a, b) => a.name.localeCompare(b.name));

export const PLAN_DETAILS = {
  [PlanTier.FREE]: {
    name: 'Free',
    priceUSD: 0,
    songLimit: 2,
    canWithdraw: false
  },
  [PlanTier.BASIC]: {
    name: 'Basic',
    priceUSD: 4,
    songLimit: 5,
    canWithdraw: true
  },
  [PlanTier.STANDARD]: {
    name: 'Standard',
    priceUSD: 7,
    songLimit: 8,
    canWithdraw: true
  },
  [PlanTier.PREMIUM]: {
    name: 'Premium',
    priceUSD: 12,
    songLimit: Infinity,
    canWithdraw: true
  }
};

export const INITIAL_TRACKS: MusicTrack[] = [
  { 
    id: '1', 
    title: 'Neon Nights', 
    artist: 'Cyber Runner', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80',
    duration: 45,
    earningUSD: 0.15,
    category: 'Trending',
    enabled: true
  },
  { 
    id: '2', 
    title: 'Midnight Drive', 
    artist: 'Synth Wave', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=300&q=80',
    duration: 60,
    earningUSD: 0.20,
    category: 'New Releases',
    enabled: true
  }
];

export const SONG_CATEGORIES = ['Trending', 'New Releases', 'Recommended', 'Daily Picks'];
