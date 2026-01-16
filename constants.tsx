
import { MusicTrack, AppSettings, PlanTier } from './types';

export const ADMIN_EMAIL = 'blessedsuccess738@gmail.com';

export const INITIAL_SETTINGS: AppSettings = {
  usdToNgnRate: 1550, 
  minWithdrawalNGN: 23250, 
  minWithdrawalUSD: 15.00, 
  dailyCapUSD: 10.00,
  referralBonusUSD: 1.00,
  dailyRewardUSD: 0.25,
  isWithdrawalOpen: true,
  withdrawalSchedule: 'Available 24/7',
  telegramAdmin: 'https://t.me/admin',
  telegramChannel: 'https://t.me/channel',
  whatsappLink: 'https://wa.me/yournumber',
  paystackPublicKey: 'pk_test_placeholder_please_replace',
  nubapiKey: '4uSyi6KbtzZZZwBpE8Lkh31A3Il0k2sQ6kKv4uND962e0daf', 
  maintenanceMode: false,
  announcementSubject: 'PROTOCOL UPGRADE: $15 MIN WITHDRAWAL',
  announcementContent: 'Welcome to the upgraded BeatBucks ecosystem. Minimum withdrawal is now strictly $15.00.',
  videoBackgroundUrl: 'https://cdn.pixabay.com/video/2021/04/12/70874-537467776_large.mp4' // Smooth tech background
};

export const BOOMPLAY_PNG = 'https://i.ibb.co/3N3t74Y/boomplay.png';
export const AUDIOMACK_PNG = 'https://i.ibb.co/YyYfJ9v/audiomack.png';
export const SPOTIFY_PNG = 'https://i.ibb.co/V9z0m8k/spotify.png';

export const INITIAL_TRACKS: MusicTrack[] = [
  { 
    id: '1', 
    title: 'Neon Nights', 
    artist: 'Cyber Runner', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=300&q=80',
    duration: 45,
    earningUSD: 0.15,
    category: 'Spotify',
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
    category: 'Apple Music',
    enabled: true
  },
  { 
    id: '3', 
    title: 'Electric Jungle', 
    artist: 'Safari Synth', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    duration: 50,
    earningUSD: 0.18,
    category: 'Boomplay',
    enabled: true
  }
];

export const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "000014" },
  { name: "EcoBank", code: "000010" },
  { name: "First Bank", code: "000016" },
  { name: "GTBank", code: "000013" },
  { name: "Kuda MFB", code: "090267" },
  { name: "Opay", code: "100004" },
  { name: "Palmpay", code: "100033" },
  { name: "Zenith Bank", code: "000015" }
].sort((a, b) => a.name.localeCompare(b.name));

export const PLAN_DETAILS = {
  [PlanTier.FREE]: { name: 'Free', priceUSD: 0, songLimit: 2, canWithdraw: false },
  [PlanTier.BASIC]: { name: 'Basic', priceUSD: 4, songLimit: 5, canWithdraw: true },
  [PlanTier.STANDARD]: { name: 'Standard', priceUSD: 7, songLimit: 8, canWithdraw: true },
  [PlanTier.PREMIUM]: { name: 'Premium', priceUSD: 12, songLimit: Infinity, canWithdraw: true }
};

export const SONG_CATEGORIES = ['Spotify', 'Boomplay', 'Audiomack', 'Apple Music'];
