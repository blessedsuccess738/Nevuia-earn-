
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
  paystackPublicKey: 'pk_test_placeholder_please_replace'
};

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
    category: 'Trending'
  },
  { 
    id: '2', 
    title: 'Midnight Drive', 
    artist: 'Synth Wave', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=300&q=80',
    duration: 60,
    earningUSD: 0.20,
    category: 'New Releases'
  },
  { 
    id: '3', 
    title: 'Golden Rhythm', 
    artist: 'Afro Beats', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    duration: 35,
    earningUSD: 0.12,
    category: 'Trending'
  }
];

export const SONG_CATEGORIES = ['Trending', 'New Releases', 'Recommended', 'Daily Picks'];
