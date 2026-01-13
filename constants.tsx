
import { MusicTrack, AppSettings, PlanTier } from './types';

export const ADMIN_EMAIL = 'blessedsuccess738@gmail.com';

export const INITIAL_SETTINGS: AppSettings = {
  usdToNgnRate: 1200, // $1 = ₦1,200 as per request example
  minWithdrawalNGN: 5000,
  dailyCapUSD: 5.00,
  referralBonusUSD: 0.50
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

export const MOCK_TRACKS: MusicTrack[] = [
  { id: '1', title: 'Neon Nights', artist: 'Cyber Runner', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', duration: 45 },
  { id: '2', title: 'Midnight Drive', artist: 'Synth Wave', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', duration: 60 },
  { id: '3', title: 'Golden Rhythm', artist: 'Afro Beats', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', duration: 35 },
  { id: '4', title: 'Electric Soul', artist: 'Voltage', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', duration: 50 },
  { id: '5', title: 'Smooth Operator', artist: 'Lofi King', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', duration: 40 },
  { id: '6', title: 'Cyber City', artist: 'Glitch Mob', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', duration: 55 },
  { id: '7', title: 'Ocean Breeze', artist: 'Summer Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', duration: 30 }
];

export const SONG_CATEGORIES = ['Trending', 'New Releases', 'Recommended', 'Daily Picks'];
