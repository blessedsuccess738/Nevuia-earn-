
import { MusicTrack, AppSettings, PlanTier } from './types';

export const ADMIN_EMAIL = 'blessedsuccess738@gmail.com';

export const INITIAL_SETTINGS: AppSettings = {
  usdToNgnRate: 1550, 
  minWithdrawalNGN: 10000,
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
  announcementSubject: 'NETWORK PROTOCOL UPDATE',
  announcementContent: 'Important: We have successfully integrated the high-yield liquidity pool for the new Juice WRLD tracks. Users can now earn up to $0.80 per stream on verified high-fidelity assets. Ensure your wallet is activated to claim rewards.'
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
  },
  { 
    id: '3', 
    title: 'Electric Jungle', 
    artist: 'Safari Synth', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    duration: 50,
    earningUSD: 0.18,
    category: 'Trending',
    enabled: true
  },
  { 
    id: '4', 
    title: 'Desert Mirage', 
    artist: 'Nomad Beats', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1514525253344-f814d0743b17?auto=format&fit=crop&w=300&q=80',
    duration: 55,
    earningUSD: 0.22,
    category: 'Recommended',
    enabled: true
  },
  { 
    id: '5', 
    title: 'Oceanic Echo', 
    artist: 'Deep Blue', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    duration: 40,
    earningUSD: 0.12,
    category: 'Daily Picks',
    enabled: true
  },
  { 
    id: '6', 
    title: 'Urban Skyline', 
    artist: 'Metro Pulse', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&w=300&q=80',
    duration: 65,
    earningUSD: 0.25,
    category: 'New Releases',
    enabled: true
  },
  { 
    id: '7', 
    title: 'Sunset Dreams', 
    artist: 'Golden Hour', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=300&q=80',
    duration: 48,
    earningUSD: 0.17,
    category: 'Recommended',
    enabled: true
  },
  { 
    id: '8', 
    title: 'Lunar Glow', 
    artist: 'Space Dust', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80',
    duration: 70,
    earningUSD: 0.30,
    category: 'Trending',
    enabled: true
  },
  { 
    id: '9', 
    title: 'I\'m Not Sure', 
    artist: 'Juice WRLD', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?auto=format&fit=crop&w=300&q=80',
    duration: 180,
    earningUSD: 0.75,
    category: 'Trending',
    enabled: true
  },
  { 
    id: '10', 
    title: 'Insecure Flow', 
    artist: '999 Legacy', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1453090927415-5f45085b65c0?auto=format&fit=crop&w=300&q=80',
    duration: 165,
    earningUSD: 0.48,
    category: 'New Releases',
    enabled: true
  },
  { 
    id: '11', 
    title: 'Midnight Vibe', 
    artist: 'Lofi King', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=300&q=80',
    duration: 120,
    earningUSD: 0.35,
    category: 'Trending',
    enabled: true
  },
  { 
    id: '12', 
    title: 'Starlight Melodies', 
    artist: 'Celestial', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=300&q=80',
    duration: 140,
    earningUSD: 0.42,
    category: 'Recommended',
    enabled: true
  },
  { 
    id: '13', 
    title: 'Future Pulse', 
    artist: 'Aura', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1484876063972-9d81f50ad827?auto=format&fit=crop&w=300&q=80',
    duration: 195,
    earningUSD: 0.60,
    category: 'New Releases',
    enabled: true
  },
  { 
    id: '14', 
    title: 'Deep Water', 
    artist: 'Oceanic', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=300&q=80',
    duration: 215,
    earningUSD: 0.65,
    category: 'Daily Picks',
    enabled: true
  },
  { 
    id: '15', 
    title: 'Lucid Echoes', 
    artist: '999 Collective', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1514525253344-f814d0743b17?auto=format&fit=crop&w=300&q=80',
    duration: 190,
    earningUSD: 0.70,
    category: 'Recommended',
    enabled: true
  },
  { 
    id: '16', 
    title: 'Cigarettes', 
    artist: 'Juice WRLD', 
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', 
    albumArt: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=300&q=80',
    duration: 220,
    earningUSD: 0.80,
    category: 'Trending',
    enabled: true
  }
];

export const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "000014" },
  { name: "EcoBank", code: "000010" },
  { name: "Fidelity Bank", code: "000007" },
  { name: "First Bank", code: "000016" },
  { name: "First City Monument Bank", code: "000003" },
  { name: "GTBank", code: "000013" },
  { name: "Heritage Bank", code: "000020" },
  { name: "Keystone Bank", code: "000002" },
  { name: "Kuda MFB", code: "090267" },
  { name: "Moniepoint MFB", code: "090405" },
  { name: "Opay", code: "100004" },
  { name: "Palmpay", code: "100033" },
  { name: "Polaris Bank", code: "000008" },
  { name: "Providus Bank", code: "000023" },
  { name: "Stanbic IBTC", code: "000012" },
  { name: "Sterling Bank", code: "000001" },
  { name: "Union Bank", code: "000018" },
  { name: "United Bank For Africa", code: "000004" },
  { name: "Unity Bank", code: "000011" },
  { name: "Wema Bank", code: "000017" },
  { name: "Zenith Bank", code: "000015" }
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

export const SONG_CATEGORIES = ['Trending', 'New Releases', 'Recommended', 'Daily Picks'];
