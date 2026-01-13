
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
  },
  {
    id: '4',
    title: 'Electric Soul',
    artist: 'Voltage',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    duration: 50
  },
  {
    id: '5',
    title: 'Smooth Operator',
    artist: 'Lofi King',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    duration: 40
  },
  {
    id: '6',
    title: 'Cyber City',
    artist: 'Glitch Mob',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    duration: 55
  },
  {
    id: '7',
    title: 'Ocean Breeze',
    artist: 'Summer Vibes',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
    duration: 30
  }
];

export const SONG_CATEGORIES = ['Trending', 'New Releases', 'Recommended', 'Daily Picks'];
