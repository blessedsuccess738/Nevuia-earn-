
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
  withdrawalSchedule: 'MON, WED, FRI (9AM - 4PM)',
  telegramAdmin: 'https://t.me/admin',
  telegramChannel: 'https://t.me/channel',
  whatsappLink: 'https://wa.me/yournumber',
  paystackPublicKey: 'pk_test_placeholder',
  nubapiKey: '4uSyi6KbtzZZZwBpE8Lkh31A3Il0k2sQ6kKv4uND962e0daf', 
  maintenanceMode: false,
  announcementSubject: 'JUICE WRLD SPECIAL: EARN 2X ROYALTIES',
  announcementContent: 'All Juice WRLD tracks on Boomplay now earn 2x royalties for a limited time!',
  videoBackgroundUrl: '' 
};

export const BOOMPLAY_PNG = 'https://i.ibb.co/3N3t74Y/boomplay.png';
export const AUDIOMACK_PNG = 'https://i.ibb.co/YyYfJ9v/audiomack.png';
export const SPOTIFY_PNG = 'https://i.ibb.co/V9z0m8k/spotify.png';

export const INITIAL_TRACKS: MusicTrack[] = [
  { id: 'jw1', title: 'Lucid Dreams', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.50, category: 'Boomplay', enabled: true },
  { id: 'jw2', title: 'All Girls Are The Same', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.50, category: 'Boomplay', enabled: true },
  { id: 'jw3', title: 'Robbery', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.55, category: 'Boomplay', enabled: true },
  { id: 'jw4', title: 'Wishing Well', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.50, category: 'Boomplay', enabled: true },
  { id: 'jw5', title: 'Lean Wit Me', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.45, category: 'Boomplay', enabled: true },
  { id: 'jw6', title: 'Legends', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.60, category: 'Boomplay', enabled: true },
  { id: 'jw7', title: 'Come & Go', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.50, category: 'Boomplay', enabled: true },
  { id: 'jw8', title: 'Righteous', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.55, category: 'Boomplay', enabled: true },
  { id: 'jw9', title: 'Burn', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.50, category: 'Boomplay', enabled: true },
  { id: 'jw10', title: 'Cigarettes', artist: 'Juice WRLD', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', albumArt: 'N/A', duration: 30, earningUSD: 0.55, category: 'Boomplay', enabled: true }
];

export const NIGERIAN_BANKS = [
  { name: "9psb", code: "120001" },
  { name: "Abbey Mortgage Bank", code: "070010" },
  { name: "Access Bank", code: "000014" },
  { name: "Access Bank (Diamond)", code: "000005" },
  { name: "Accion Microfinance Bank", code: "090134" },
  { name: "Al-Hayat Microfinance Bank", code: "090328" },
  { name: "Amju Unique MFB", code: "090180" },
  { name: "Aramoko MFB", code: "090483" },
  { name: "ASO Savings and Loans", code: "070001" },
  { name: "Astrapolaris MFB", code: "090172" },
  { name: "Bainescredit MFB", code: "090188" },
  { name: "Bowen Microfinance Bank", code: "090148" },
  { name: "Carbon", code: "000033" },
  { name: "CEMCS Microfinance Bank", code: "090267" },
  { name: "Citibank Nigeria", code: "000009" },
  { name: "Coronation Merchant Bank", code: "060001" },
  { name: "Ecobank Nigeria", code: "000010" },
  { name: "Eyowo", code: "090328" },
  { name: "Fairmoney Microfinance Bank", code: "090442" },
  { name: "Fidelity Bank", code: "000007" },
  { name: "First Bank of Nigeria", code: "000016" },
  { name: "First City Monument Bank (FCMB)", code: "000003" },
  { name: "FirstTrust Mortgage Bank Nigeria", code: "090107" },
  { name: "Globus Bank", code: "000027" },
  { name: "GoMoney", code: "100022" },
  { name: "Guaranty Trust Bank (GTBank)", code: "000013" },
  { name: "Hasal Microfinance Bank", code: "090121" },
  { name: "Heritage Bank", code: "000020" },
  { name: "HopePSB", code: "120002" },
  { name: "Ibile Microfinance Bank", code: "090118" },
  { name: "Infinity MFB", code: "090157" },
  { name: "Jaiz Bank", code: "000006" },
  { name: "Keystone Bank", code: "000002" },
  { name: "Kuda Microfinance Bank", code: "090267" },
  { name: "Lagos Building Investment Company", code: "070007" },
  { name: "Links MFB", code: "090271" },
  { name: "Lotus Bank", code: "000029" },
  { name: "Mayfair MFB", code: "090323" },
  { name: "Mint MFB", code: "090281" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "MTN MoMo PSB", code: "120003" },
  { name: "Nova Merchant Bank", code: "060003" },
  { name: "Opay (Paycom)", code: "100004" },
  { name: "Optimimus Bank", code: "000036" },
  { name: "Paga", code: "100002" },
  { name: "Palmpay", code: "100033" },
  { name: "Parallex Bank", code: "000030" },
  { name: "Parkway - ReadyCash", code: "100003" },
  { name: "Polaris Bank", code: "000008" },
  { name: "PremiumTrust Bank", code: "000031" },
  { name: "Providus Bank", code: "000023" },
  { name: "QuickCheck Microfinance Bank", code: "090551" },
  { name: "Rubies MFB", code: "090175" },
  { name: "Safe Haven MFB", code: "090286" },
  { name: "Sparkle Bank", code: "090325" },
  { name: "Stanbic IBTC Bank", code: "000012" },
  { name: "Standard Chartered Bank", code: "000021" },
  { name: "Sterling Bank", code: "000001" },
  { name: "SunTrust Bank", code: "000022" },
  { name: "TAJBank", code: "000026" },
  { name: "Tangerine Money", code: "090426" },
  { name: "Titan Trust Bank", code: "000025" },
  { name: "Union Bank of Nigeria", code: "000018" },
  { name: "United Bank for Africa (UBA)", code: "000004" },
  { name: "Unity Bank", code: "000011" },
  { name: "VFD Microfinance Bank", code: "090110" },
  { name: "Wema Bank", code: "000017" },
  { name: "Zenith Bank", code: "000015" }
].sort((a, b) => a.name.localeCompare(b.name));

export const PLAN_DETAILS = {
  [PlanTier.FREE]: { name: 'Free', priceUSD: 0, songLimit: 2, canWithdraw: false },
  [PlanTier.BASIC]: { name: 'Basic', priceUSD: 4, songLimit: 5, canWithdraw: true },
  [PlanTier.STANDARD]: { name: 'Standard', priceUSD: 7, songLimit: 10, canWithdraw: true },
  [PlanTier.PREMIUM]: { name: 'Premium', priceUSD: 12, songLimit: Infinity, canWithdraw: true }
};

export const SONG_CATEGORIES = ['Spotify', 'Boomplay', 'Audiomack', 'Apple Music'];
