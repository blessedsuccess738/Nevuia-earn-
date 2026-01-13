
import { MusicTrack, AppSettings } from './types';

export const ADMIN_EMAIL = 'blessedsuccess738@gmail.com';

export const INITIAL_SETTINGS: AppSettings = {
  usdToNgnRate: 1550,
  activationFeeUSD: 7,
  minWithdrawalUSD: 15,
  dailyCapUSD: 2.10,
  referralBonusUSD: 0.50
};

export const MOCK_TRACKS: MusicTrack[] = [
  {
    id: '1',
    title: 'Neon Nights',
    artist: 'Cyber Runner',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 45
  },
  {
    id: '2',
    title: 'Midnight Drive',
    artist: 'Synth Wave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 60
  },
  {
    id: '3',
    title: 'Golden Rhythm',
    artist: 'Afro Beats',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 35
  }
];
